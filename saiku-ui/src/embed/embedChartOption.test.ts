/*
 * #1103 fast-follow — unit coverage for the embed chart's APPLIER
 * (buildEmbedChartOption), extracted from EmbedChart.svelte. The reader
 * (embedChartTheme.test.ts) proves the CSS vars parse correctly; this proves
 * the parsed theme maps onto the ECharts option AND — the crux — that an
 * unstyled embed emits the same option as pre-#1103 (no color/fg/axisLine
 * keys). Without this, a future buildOption refactor could silently break the
 * byte-identical back-compat guarantee with no red test.
 */
import { describe, test, expect } from 'vitest';
import { buildEmbedChartOption } from './embedChartOption';
import type { EmbedRow } from './types';
import type { EmbedChartTheme } from './embedChartTheme';

// A non-numeric `value` makes the column a category axis (isNumericColumn → false);
// row-header cells carry the caption. Type it loosely for the fixture.
const cat = (label: string) => ({ value: label as unknown as number, formatted: label });
const num = (n: number) => ({ value: n, formatted: String(n) });

const ROWS: EmbedRow[] = [
	{ Country: cat('France'), Sales: num(100), Units: num(5) },
	{ Country: cat('Spain'), Sales: num(200), Units: num(8) }
];

const UNSTYLED: EmbedChartTheme = { palette: [] };

/* eslint-disable @typescript-eslint/no-explicit-any */
describe('buildEmbedChartOption', () => {
	test('unstyled (no vars) emits NO color/fg/axisLine keys — byte-identical to pre-#1103', () => {
		const opt = buildEmbedChartOption(ROWS, 'bar', UNSTYLED) as any;
		expect(opt.color).toBeUndefined(); // no host palette → no `color` key
		expect(opt.legend.textStyle).toBeUndefined(); // no fg → no legend textStyle
		expect(opt.xAxis.axisLabel.color).toBeUndefined(); // no fg → no x label colour
		expect(opt.xAxis.axisLine).toBeUndefined(); // no axisLine theme on x
		expect(opt.yAxis.axisLabel).toBeUndefined(); // no fg → no y label colour
		expect(opt.yAxis.axisLine).toBeUndefined();
		expect(opt.yAxis.splitLine).toBeUndefined();
	});

	test('each numeric column becomes its own bar series; the non-numeric column is the category axis', () => {
		const opt = buildEmbedChartOption(ROWS, 'bar', UNSTYLED) as any;
		expect(opt.series.map((s: any) => s.name)).toEqual(['Sales', 'Units']);
		expect(opt.series.every((s: any) => s.type === 'bar')).toBe(true);
		expect(opt.xAxis.data).toEqual(['France', 'Spain']);
	});

	test('host palette → ECharts `color` cycle', () => {
		const opt = buildEmbedChartOption(ROWS, 'bar', {
			palette: ['#2563eb', '#16a34a', '#dc2626']
		}) as any;
		expect(opt.color).toEqual(['#2563eb', '#16a34a', '#dc2626']);
	});

	test('fg themes axis labels + legend text', () => {
		const opt = buildEmbedChartOption(ROWS, 'bar', { palette: [], fg: '#ffffff' }) as any;
		expect(opt.legend.textStyle.color).toBe('#ffffff');
		expect(opt.xAxis.axisLabel.color).toBe('#ffffff');
		expect(opt.yAxis.axisLabel.color).toBe('#ffffff');
	});

	test('axisLine (muted) themes both axis lines + the y splitLine', () => {
		const opt = buildEmbedChartOption(ROWS, 'bar', { palette: [], axisLine: '#cccccc' }) as any;
		expect(opt.xAxis.axisLine.lineStyle.color).toBe('#cccccc');
		expect(opt.yAxis.axisLine.lineStyle.color).toBe('#cccccc');
		expect(opt.yAxis.splitLine.lineStyle.color).toBe('#cccccc');
	});

	test('line mode → line series', () => {
		const opt = buildEmbedChartOption(ROWS, 'line', UNSTYLED) as any;
		expect(opt.series.every((s: any) => s.type === 'line')).toBe(true);
	});

	test('pie mode → a single pie series on the first numeric column, honouring the palette', () => {
		const opt = buildEmbedChartOption(ROWS, 'pie', { palette: ['#abc'] }) as any;
		expect(opt.series).toHaveLength(1);
		expect(opt.series[0].type).toBe('pie');
		expect(opt.color).toEqual(['#abc']); // palette still applies in pie mode
		expect(opt.series[0].data.map((d: any) => d.value)).toEqual([100, 200]); // first numeric col = Sales
	});

	test("empty rows → 'No data' title, still no color key when unstyled", () => {
		const opt = buildEmbedChartOption([], 'bar', UNSTYLED) as any;
		expect(opt.title.text).toBe('No data');
		expect(opt.color).toBeUndefined();
	});

	test('SECURITY (#1909): tooltip formatter HTML-escapes the category AND every series name AND every cell value (innerHTML, un-escaped by ECharts)', () => {
		// TWO series (not one) so the per-series `.map` path is actually
		// exercised — a formatter that only escaped arr[0] (or only the
		// category) would still pass a single-series assertion. Every
		// fixture below carries all FIVE HTML-significant characters
		// (< > & " '), including `>` and `'`, neither of which the original
		// #1909 test asserted — a formatter that escapes `<`/`&`/`"` but
		// forgets `>` or `'` must fail this test.
		const hostileCat = `<img src=x onerror=alert(1)>&"'cat`;
		const hostileName1 = `<img src=x onerror=alert(2)>&"'name1`;
		const hostileDisp1 = `<img src=x onerror=alert(3)>&"'disp1`;
		const hostileName2 = `<img src=x onerror=alert(4)>&"'name2`;
		const hostileDisp2 = `<img src=x onerror=alert(5)>&"'disp2`;
		const hostileRows: EmbedRow[] = [
			{
				Country: cat(hostileCat),
				[hostileName1]: { value: 100, formatted: hostileDisp1 },
				[hostileName2]: { value: 200, formatted: hostileDisp2 }
			}
		];
		const opt = buildEmbedChartOption(hostileRows, 'bar', UNSTYLED) as any;
		const fmt = opt.tooltip.formatter as (p: unknown) => string;
		// Shaped like the real ECharts axis-trigger callback: axisValue is the
		// hovered category, shared by every entry; seriesName + dataIndex
		// identify which row/column cell backs EACH series' value (the
		// formatter looks up `formatted` from the original rows via those
		// two, not from `value`). Both entries share dataIndex 0 — one row,
		// two series — matching how the axis trigger fires once per category
		// with every series' params in the array.
		const out = fmt([
			{ axisValue: hostileCat, seriesName: hostileName1, dataIndex: 0, value: 100 },
			{ axisValue: hostileCat, seriesName: hostileName2, dataIndex: 0, value: 200 }
		]);

		// Exact match on the whole formatter output: the strongest possible
		// guarantee that ALL THREE sinks are escaped for BOTH series (cat
		// once, name/disp twice each), that the static <b>/<br/> structure
		// is untouched, and that no raw markup survives anywhere at all —
		// not just "some escaped substring appears somewhere in the output"
		// the way a bare toContain would allow.
		expect(out).toBe(
			`<b>&lt;img src=x onerror=alert(1)&gt;&amp;&quot;&#39;cat</b><br/>` +
				`&lt;img src=x onerror=alert(2)&gt;&amp;&quot;&#39;name1: ` +
				`&lt;img src=x onerror=alert(3)&gt;&amp;&quot;&#39;disp1<br/>` +
				`&lt;img src=x onerror=alert(4)&gt;&amp;&quot;&#39;name2: ` +
				`&lt;img src=x onerror=alert(5)&gt;&amp;&quot;&#39;disp2`
		);

		// Belt-and-braces per-value checks so a future failure here points
		// straight at which sink regressed, without having to diff the full
		// string above by eye.
		// Raw, executable markup must never reach the innerHTML sink — the
		// tag itself is neutralised (the literal text "onerror=alert" that
		// remains is inert once it's no longer inside a real `<img>` tag).
		expect(out).not.toContain('<img');
		expect(out).toContain('&lt;img src=x onerror=alert(1)&gt;'); // cat
		expect(out).toContain('&lt;img src=x onerror=alert(2)&gt;'); // series 1 name
		expect(out).toContain('&lt;img src=x onerror=alert(3)&gt;'); // series 1 disp
		expect(out).toContain('&lt;img src=x onerror=alert(4)&gt;'); // series 2 name
		expect(out).toContain('&lt;img src=x onerror=alert(5)&gt;'); // series 2 disp
		expect(out).toContain('&amp;');
		expect(out).toContain('&quot;');
		expect(out).toContain('&#39;'); // ' — not asserted by the original #1909 test
		// The static <b>/<br/> structure is untouched — only the dynamic
		// values were escaped.
		expect(out.startsWith('<b>')).toBe(true);
		expect(out).toContain('</b><br/>');
	});
});
