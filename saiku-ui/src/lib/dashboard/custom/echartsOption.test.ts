import { describe, expect, it, test } from 'vitest';
import fc from 'fast-check';
import {
	applyDataToEchartsOption,
	validateEchartsOption,
	type EChartsDataProjection
} from './echartsOption';
import { applyValueAxisFormat } from './valueAxisFormat';
import { appEchartsBase, withAppEchartsDefaults } from '../appChartTheme';
import { resolveThemeTokens } from '$lib/views/chartTheme';

describe('validateEchartsOption — accept', () => {
	it('accepts a plain bar option', () => {
		const opt = {
			title: { text: 'Sales by month' },
			tooltip: { trigger: 'axis' },
			legend: {},
			xAxis: { type: 'category' },
			yAxis: { type: 'value' },
			color: ['#123456', '#abcdef'],
			series: [{ type: 'bar', name: 'Units', stack: 'total' }]
		};
		const r = validateEchartsOption(opt);
		expect(r.ok).toBe(true);
		if (r.ok) expect(r.value).toEqual(opt);
	});

	it('accepts a plain line option with a string formatter template', () => {
		// saiku#1937: a STRING formatter (ECharts template syntax) passes the
		// VALIDATOR — it can't execute the way a function can. It is NOT
		// "safe" outright though: in ECharts' default HTML render mode a string
		// formatter's surrounding markup is inserted into innerHTML unescaped
		// (only the {a}/{b}/{c} substitutions are escaped), so a markup-bearing
		// template is a stored-XSS vector. That gap is closed downstream, in
		// applyDataToEchartsOption, which forces every tooltip into
		// `renderMode: 'richText'` so a formatter string can never be parsed as
		// HTML/DOM — see the reversion-sensitive tests below.
		const opt = {
			xAxis: { type: 'category' },
			yAxis: { type: 'value' },
			tooltip: { trigger: 'axis', formatter: '{b}: {c}' },
			series: [{ type: 'line', name: 'Revenue', smooth: true }]
		};
		expect(validateEchartsOption(opt).ok).toBe(true);
	});

	it('returns a fresh copy, not an alias of the input', () => {
		const opt = { series: [{ type: 'bar' }] };
		const r = validateEchartsOption(opt);
		expect(r.ok).toBe(true);
		if (r.ok) expect(r.value).not.toBe(opt);
	});

	it('accepts an inline data:image background', () => {
		const opt = {
			backgroundColor: {
				image: 'data:image/png;base64,iVBORw0KGgoAAAANS'
			} as unknown,
			series: [{ type: 'bar' }]
		};
		// backgroundColor object with a data:image is safe.
		expect(validateEchartsOption(opt).ok).toBe(true);
	});
});

describe('validateEchartsOption — reject (fail closed)', () => {
	it('rejects a non-object input', () => {
		expect(validateEchartsOption(null).ok).toBe(false);
		expect(validateEchartsOption('nope').ok).toBe(false);
		expect(validateEchartsOption([{ type: 'bar' }]).ok).toBe(false);
		expect(validateEchartsOption(undefined).ok).toBe(false);
	});

	it('rejects an unknown top-level key', () => {
		const r = validateEchartsOption({ series: [], graphic: { type: 'text' } });
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error).toMatch(/graphic/);
	});

	it('rejects a function value at the top level', () => {
		const r = validateEchartsOption({ title: () => 'evil', series: [] });
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error).toMatch(/function/i);
	});

	it('rejects a function nested in tooltip.formatter', () => {
		const r = validateEchartsOption({
			tooltip: { trigger: 'axis', formatter: () => '<script>' },
			series: [{ type: 'bar' }]
		});
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error).toMatch(/function/i);
	});

	it('rejects a remote url in a nested value', () => {
		const r = validateEchartsOption({
			series: [{ type: 'bar', itemStyle: { color: 'http://evil.example/x.png' } }]
		});
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error).toMatch(/url/i);
	});

	it('rejects a remote url() in backgroundColor', () => {
		const r = validateEchartsOption({
			backgroundColor: 'url(https://evil.example/bg.png)',
			series: [{ type: 'bar' }]
		});
		expect(r.ok).toBe(false);
	});

	it('rejects a protocol-relative resource reference', () => {
		const r = validateEchartsOption({
			series: [{ type: 'pie', symbol: '//evil.example/x' }]
		});
		expect(r.ok).toBe(false);
	});

	it('rejects a non-image data: URI', () => {
		const r = validateEchartsOption({
			series: [{ type: 'bar', symbol: 'data:text/html;base64,PHNjcmlwdD4=' }]
		});
		expect(r.ok).toBe(false);
	});

	it('rejects an unknown series field', () => {
		const r = validateEchartsOption({ series: [{ type: 'bar', danger: 1 }] });
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error).toMatch(/danger/);
	});

	it('rejects a prototype-pollution key', () => {
		const r = validateEchartsOption(JSON.parse('{"series":[],"__proto__":{"x":1}}'));
		expect(r.ok).toBe(false);
	});
});

/* ------------------------------------------------------------------ *
 * Property tests — for arbitrary objects that embed a function OR a   *
 * remote-url string at a random depth, the validator NEVER accepts.   *
 * ------------------------------------------------------------------ */

// A first segment under a top-level key WITHOUT a per-series field allowlist, so
// the deep scanner (not the allowlist) is what must catch the hostile leaf.
const scanContainerKey = fc.constantFrom('tooltip', 'title', 'grid', 'legend', 'textStyle', 'aria');
const safeKey = fc
	.string({ minLength: 1, maxLength: 8 })
	.filter((s) => !['__proto__', 'constructor', 'prototype'].includes(s) && !s.includes('.'));

/** Nest a leaf value under a path of object keys: ["a","b"] + leaf → {a:{b:leaf}}. */
function nest(path: string[], leaf: unknown): Record<string, unknown> {
	return path.reduceRight<Record<string, unknown>>(
		(acc, key) => ({ [key]: acc }),
		leaf as Record<string, unknown>
	);
}

const pathArb = fc
	.tuple(scanContainerKey, fc.array(safeKey, { maxLength: 4 }))
	.map(([first, rest]) => [first, ...rest]);

describe('validateEchartsOption — properties', () => {
	test('NEVER accepts an option with a function at any depth', () => {
		fc.assert(
			fc.property(pathArb, fc.func(fc.integer()), (path, fn) => {
				const opt = nest(path, fn);
				return validateEchartsOption(opt).ok === false;
			}),
			{ numRuns: 500 }
		);
	});

	test('NEVER accepts an option with a remote-url string at any depth', () => {
		const remoteUrl = fc.oneof(
			fc.webUrl().filter((u) => /^https?:\/\//i.test(u)),
			fc.constant('http://evil.example/x'),
			fc.constant('https://evil.example/y.png'),
			fc.string().map((s) => `https://evil.example/${s}`)
		);
		fc.assert(
			fc.property(pathArb, remoteUrl, (path, url) => {
				const opt = nest(path, url);
				return validateEchartsOption(opt).ok === false;
			}),
			{ numRuns: 500 }
		);
	});

	test('NEVER accepts a protocol-relative url as a whole string value at any depth', () => {
		fc.assert(
			fc.property(pathArb, fc.string(), (path, tail) => {
				const opt = nest(path, `//evil.example/${tail}`);
				return validateEchartsOption(opt).ok === false;
			}),
			{ numRuns: 300 }
		);
	});
});

/* ------------------------------------------------------------------ *
 * applyDataToEchartsOption — data merge                               *
 * ------------------------------------------------------------------ */

const projection: EChartsDataProjection = {
	categories: ['Jan', 'Feb', 'Mar'],
	series: [
		{ name: 'Units', data: [10, 20, 30] },
		{ name: 'Revenue', data: [1, 2, 3] }
	]
};

describe('applyDataToEchartsOption', () => {
	it('fills xAxis categories and series data on a bar option', () => {
		const merged = applyDataToEchartsOption(
			{ series: [{ type: 'bar', name: 'Units' }] },
			projection
		);
		expect((merged.xAxis as { data: string[] }).data).toEqual(['Jan', 'Feb', 'Mar']);
		const series = merged.series as Array<{ type: string; data: unknown[] }>;
		expect(series[0].data).toEqual([10, 20, 30]);
	});

	it('synthesises one bar series per measure when none declared', () => {
		const merged = applyDataToEchartsOption({}, projection);
		const series = merged.series as Array<{ type: string; name: string; data: unknown[] }>;
		expect(series).toHaveLength(2);
		expect(series[0]).toMatchObject({ type: 'bar', name: 'Units', data: [10, 20, 30] });
		expect(series[1]).toMatchObject({ type: 'bar', name: 'Revenue', data: [1, 2, 3] });
	});

	it('builds {name,value} pairs for a pie series and skips the axes', () => {
		const merged = applyDataToEchartsOption({ series: [{ type: 'pie' }] }, projection);
		expect(merged.xAxis).toBeUndefined();
		const series = merged.series as Array<{
			type: string;
			data: Array<{ name: string; value: number }>;
		}>;
		expect(series[0].data).toEqual([
			{ name: 'Jan', value: 10 },
			{ name: 'Feb', value: 20 },
			{ name: 'Mar', value: 30 }
		]);
	});

	it('does not mutate the input option', () => {
		const input = { series: [{ type: 'bar' }] };
		applyDataToEchartsOption(input, projection);
		expect(input.series[0]).toEqual({ type: 'bar' });
	});

	/* saiku#1772 — horizontal bar. The built-in Chart tile has no horizontal
     variant, so `yAxis:{type:"category"}` + `xAxis:{type:"value"}` is a main
     reason to reach for this renderer. Categories used to go to xAxis
     unconditionally, leaving the y axis labelled 0,1,2… */
	it('#1772 feeds categories to a declared category yAxis (horizontal bar)', () => {
		const merged = applyDataToEchartsOption(
			{
				xAxis: { type: 'value' },
				yAxis: { type: 'category' },
				series: [{ type: 'bar', name: 'Units' }]
			},
			projection
		);
		expect((merged.yAxis as { data: string[] }).data).toEqual(['Jan', 'Feb', 'Mar']);
		// The value axis must NOT be handed categories.
		expect((merged.xAxis as { data?: string[] }).data).toBeUndefined();
		expect((merged.xAxis as { type: string }).type).toBe('value');
	});

	it('#1772 defaults the missing opposite axis to a value axis', () => {
		const merged = applyDataToEchartsOption(
			{ yAxis: { type: 'category' }, series: [{ type: 'bar' }] },
			projection
		);
		expect((merged.yAxis as { data: string[] }).data).toEqual(['Jan', 'Feb', 'Mar']);
		expect(merged.xAxis).toEqual({ type: 'value' });
	});

	it('#1772 leaves the vertical default alone when xAxis is the category axis', () => {
		const merged = applyDataToEchartsOption(
			{ xAxis: { type: 'category' }, yAxis: { type: 'value' }, series: [{ type: 'bar' }] },
			projection
		);
		expect((merged.xAxis as { data: string[] }).data).toEqual(['Jan', 'Feb', 'Mar']);
		expect((merged.yAxis as { data?: string[] }).data).toBeUndefined();
	});

	it('#1772 respects author-supplied axis data on the category yAxis', () => {
		const merged = applyDataToEchartsOption(
			{ yAxis: { type: 'category', data: ['A', 'B'] }, series: [{ type: 'bar' }] },
			projection
		);
		expect((merged.yAxis as { data: string[] }).data).toEqual(['A', 'B']);
	});
});

/* ------------------------------------------------------------------ *
 * saiku#1937 — a markup-bearing string tooltip.formatter must never    *
 * reach an HTML-rendered tooltip once applyDataToEchartsOption has run. *
 * Reversion-sensitive: stashing the neutraliseTooltip wiring in         *
 * applyDataToEchartsOption turns every one of these red.                *
 * ------------------------------------------------------------------ */
describe('applyDataToEchartsOption — saiku#1937 tooltip XSS neutralisation', () => {
	const hostileFormatter = '<img src=x onerror=alert(document.cookie)>{b}: {c}';

	it('forces renderMode:"richText" on a top-level tooltip carrying a markup formatter', () => {
		const validated = validateEchartsOption({
			tooltip: { trigger: 'axis', formatter: hostileFormatter },
			series: [{ type: 'bar' }]
		});
		expect(validated.ok).toBe(true);
		if (!validated.ok) return;
		const merged = applyDataToEchartsOption(validated.value, projection);
		const tooltip = merged.tooltip as { formatter: string; renderMode: string };
		// The formatter string itself is untouched (richText mode still does the
		// {a}/{b}/{c} substitution) — what changes is HOW it gets rendered.
		expect(tooltip.formatter).toBe(hostileFormatter);
		expect(tooltip.renderMode).toBe('richText');
	});

	it('forces renderMode:"richText" on a per-series tooltip carrying a markup formatter', () => {
		const validated = validateEchartsOption({
			series: [{ type: 'line', tooltip: { formatter: hostileFormatter } }]
		});
		expect(validated.ok).toBe(true);
		if (!validated.ok) return;
		const merged = applyDataToEchartsOption(validated.value, projection);
		const series = merged.series as Array<{ tooltip: { formatter: string; renderMode: string } }>;
		expect(series[0].tooltip.formatter).toBe(hostileFormatter);
		expect(series[0].tooltip.renderMode).toBe('richText');
	});

	it('forces renderMode:"richText" on a markPoint/markLine/markArea tooltip', () => {
		const validated = validateEchartsOption({
			series: [
				{
					type: 'line',
					markPoint: { tooltip: { formatter: hostileFormatter } },
					markLine: { tooltip: { formatter: hostileFormatter } },
					markArea: { tooltip: { formatter: hostileFormatter } }
				}
			]
		});
		expect(validated.ok).toBe(true);
		if (!validated.ok) return;
		const merged = applyDataToEchartsOption(validated.value, projection);
		const series = merged.series as Array<{
			markPoint: { tooltip: { renderMode: string } };
			markLine: { tooltip: { renderMode: string } };
			markArea: { tooltip: { renderMode: string } };
		}>;
		expect(series[0].markPoint.tooltip.renderMode).toBe('richText');
		expect(series[0].markLine.tooltip.renderMode).toBe('richText');
		expect(series[0].markArea.tooltip.renderMode).toBe('richText');
	});

	it('drops tooltip.extraCssText everywhere it can appear', () => {
		// This value survives validateEchartsOption on purpose (a leading digit
		// dodges the "bare scheme" whole-string check in stringIsHostile, so the
		// embedded legacy IE `behavior:url(...)` CSS binding — a historical
		// script-execution vector — is never even flagged there): the point of
		// this test is that applyDataToEchartsOption still drops extraCssText
		// unconditionally, as defence-in-depth independent of the validator.
		const hostileCss = '1px solid red;behavior:url(evil.htc)';
		const validated = validateEchartsOption({
			tooltip: { extraCssText: hostileCss },
			series: [
				{
					type: 'bar',
					tooltip: { extraCssText: hostileCss },
					markPoint: { tooltip: { extraCssText: hostileCss } }
				}
			]
		});
		expect(validated.ok).toBe(true);
		if (!validated.ok) return;
		const merged = applyDataToEchartsOption(validated.value, projection);
		const tooltip = merged.tooltip as Record<string, unknown>;
		const series = merged.series as Array<{
			tooltip: Record<string, unknown>;
			markPoint: { tooltip: Record<string, unknown> };
		}>;
		expect(tooltip.extraCssText).toBeUndefined();
		expect(series[0].tooltip.extraCssText).toBeUndefined();
		expect(series[0].markPoint.tooltip.extraCssText).toBeUndefined();
	});

	it('does not introduce a tooltip when the author declared none at all', () => {
		// Baseline: an option with no tooltip shouldn't gain one just because of
		// this pass — richText forcing only touches tooltips the author (or the
		// synthesised series) actually has.
		const merged = applyDataToEchartsOption({ series: [{ type: 'bar' }] }, projection);
		expect(merged.tooltip).toBeUndefined();
	});

	it('coerces a truthy non-object top-level tooltip (e.g. `tooltip: true`) into a richText object', () => {
		const validated = validateEchartsOption({ tooltip: true, series: [{ type: 'bar' }] });
		expect(validated.ok).toBe(true);
		if (!validated.ok) return;
		const merged = applyDataToEchartsOption(validated.value, projection);
		expect(merged.tooltip).toEqual({ renderMode: 'richText' });
	});

	it('coerces a truthy string top-level tooltip into a richText object', () => {
		const validated = validateEchartsOption({ tooltip: 'x', series: [{ type: 'bar' }] });
		expect(validated.ok).toBe(true);
		if (!validated.ok) return;
		const merged = applyDataToEchartsOption(validated.value, projection);
		expect(merged.tooltip).toEqual({ renderMode: 'richText' });
	});

	it('leaves a falsy top-level tooltip (disabled) alone rather than fabricating one', () => {
		const validated = validateEchartsOption({ tooltip: false, series: [{ type: 'bar' }] });
		expect(validated.ok).toBe(true);
		if (!validated.ok) return;
		const merged = applyDataToEchartsOption(validated.value, projection);
		expect(merged.tooltip).toBe(false);
	});
});

/* ------------------------------------------------------------------ *
 * saiku#1937 — CALL-SITE wiring tests.                                 *
 *                                                                      *
 * The helper-level tests above prove applyDataToEchartsOption itself   *
 * neutralises tooltips. These tests instead replicate the exact        *
 * production call sequence each tile renderer runs in its `$effect`    *
 * right before `chart.setOption(...)`, importing the REAL production   *
 * functions (never reimplementing them), so a regression that          *
 * reintroduces `renderMode:'html'` downstream of                       *
 * applyDataToEchartsOption — e.g. a theme-layering step that lets the   *
 * base option's tooltip win instead of the author's — fails here even  *
 * though the helper itself is untouched.                               *
 * ------------------------------------------------------------------ */
describe('saiku#1937 — in-app tile wiring (EChartsOptionTile.svelte composition)', () => {
	it('the themed-baseline layering step preserves richText on the top-level tooltip', () => {
		const hostileFormatter = '<img src=x onerror=alert(1)>{b}: {c}';
		const validated = validateEchartsOption({
			tooltip: { trigger: 'axis', formatter: hostileFormatter },
			series: [{ type: 'bar' }]
		});
		expect(validated.ok).toBe(true);
		if (!validated.ok) return;

		// Mirrors EChartsOptionTile.svelte's render $effect: applyDataToEchartsOption,
		// then withAppEchartsDefaults(filled, appEchartsBase(tokens, fonts)) — the
		// step that layers the app's theme over the author's option before it
		// reaches chart.setOption(option, true).
		const filled = applyDataToEchartsOption(validated.value, projection);
		const tokens = resolveThemeTokens();
		const themed = withAppEchartsDefaults(
			filled,
			appEchartsBase(tokens, { body: 'inherit', display: 'inherit' })
		);
		applyValueAxisFormat(themed, undefined);

		const tooltip = themed.tooltip as { formatter: string; renderMode: string };
		expect(tooltip.formatter).toBe(hostileFormatter);
		expect(tooltip.renderMode).toBe('richText');
	});

	it('the themed-baseline layering step preserves richText on a per-series tooltip', () => {
		const hostileFormatter = '<img src=x onerror=alert(1)>{b}: {c}';
		const validated = validateEchartsOption({
			series: [{ type: 'line', tooltip: { formatter: hostileFormatter } }]
		});
		expect(validated.ok).toBe(true);
		if (!validated.ok) return;

		const filled = applyDataToEchartsOption(validated.value, projection);
		const tokens = resolveThemeTokens();
		const themed = withAppEchartsDefaults(
			filled,
			appEchartsBase(tokens, { body: 'inherit', display: 'inherit' })
		);

		const series = themed.series as Array<{ tooltip: { renderMode: string } }>;
		expect(series[0].tooltip.renderMode).toBe('richText');
	});
});

describe('saiku#1937 — embed tile wiring (EmbedEChartsOptionTile.svelte composition)', () => {
	it('the embed render sequence (validate -> project -> merge -> axis-format) yields a richText tooltip', () => {
		const hostileFormatter = '<img src=x onerror=alert(document.cookie)>{b}: {c}';
		// Mirrors EmbedEChartsOptionTile.svelte's `project()` — first non-numeric
		// column is categories, numeric columns become series — feeding data shaped
		// like the token-scoped `rows` prop it receives from <EmbedGrid>.
		const embedProjection: EChartsDataProjection = {
			categories: ['Jan', 'Feb'],
			series: [{ name: 'Units', data: [10, 20] }]
		};

		const validated = validateEchartsOption({
			tooltip: { formatter: hostileFormatter },
			series: [
				{
					type: 'bar',
					markPoint: { tooltip: { formatter: hostileFormatter } }
				}
			]
		});
		expect(validated.ok).toBe(true);
		if (!validated.ok) return;

		// Mirrors EmbedEChartsOptionTile.svelte's render $effect exactly: no theme
		// layering step exists on the embed path — applyDataToEchartsOption's
		// output goes straight to applyValueAxisFormat, then chart.setOption().
		const option = applyDataToEchartsOption(validated.value, embedProjection);
		applyValueAxisFormat(option, undefined);

		const tooltip = option.tooltip as { renderMode: string };
		const series = option.series as Array<{ markPoint: { tooltip: { renderMode: string } } }>;
		expect(tooltip.renderMode).toBe('richText');
		expect(series[0].markPoint.tooltip.renderMode).toBe('richText');
	});
});
