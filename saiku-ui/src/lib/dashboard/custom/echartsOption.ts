/*
 * Safe-subset validator for a declarative ECharts `option` (App Builder Phase 2,
 * saiku#1441 — the `echarts-option` custom tile renderer).
 *
 * An app author supplies a plain, declarative ECharts `option` object — NO code.
 * Before it is ever handed to `chart.setOption()` it is validated against a
 * curated safe subset. The posture MIRRORS `$lib/dashboard/cssSanitiser`: reject
 * hostile constructs and FAIL CLOSED — anything the validator is not sure about
 * is rejected, and the whole option is dropped rather than partially sanitised.
 *
 * Three independent reject rules, enforced across the WHOLE tree at any depth:
 *
 *  1. NO FUNCTION VALUES. A function anywhere in the option (e.g.
 *     `tooltip.formatter`, `label.formatter`, an `onclick`) is an exec / XSS
 *     vector — ECharts calls these with live DOM/data. If any value is a
 *     function at any depth, the entire option is rejected. (JSON authoring
 *     can't even express a function; this guards the `unknown` boundary where a
 *     live object could carry one.)
 *  2. NO REMOTE URLs. Any string value that references a remote resource — an
 *     absolute `http(s):` / other scheme, a protocol-relative `//host`, a
 *     `url(...)` pointing off-origin, or a non-image `data:` URI — is a
 *     data-exfil / SSRF-ish vector (backgrounds, `image://` symbols, rich-text
 *     images). Only same-origin/relative refs and `data:image/<raster>` are
 *     allowed. Detection runs on url() targets AND on bare scheme'd strings,
 *     mirroring the cssSanitiser url() posture.
 *  3. ALLOWLIST. Only a curated set of top-level keys is accepted, and each
 *     `series` entry may only carry allowlisted fields. Unknown keys are
 *     REJECTED (fail closed), not silently dropped.
 *
 * Prototype-pollution keys (`__proto__` / `constructor` / `prototype`) are
 * rejected wherever they appear. Depth + node budgets bound the walk so a
 * pathological or circular input terminates as a rejection rather than hanging.
 *
 * Pure: no DOM, no fetches, no ECharts import — so the self-contained embed
 * bundle can import it too (it has no `$lib` alias). Never throws: every path
 * returns a discriminated result.
 */

/** A validated, safe ECharts option. Structurally a plain object; the brand is
 *  documentation only (the validator guarantees the safe-subset invariants). */
export type SafeEChartsOption = Record<string, unknown>;

/** Result of {@link validateEchartsOption}. Shape-compatible with the tile
 *  registry's {@code ValidateOptionsResult} so it can back a
 *  {@code TileRenderer.validateOptions}. */
export type ValidateEchartsOptionResult =
	{ ok: true; value: SafeEChartsOption } | { ok: false; error: string };

/** Curated chart-safe top-level option keys. Anything outside this set is
 *  rejected. Deliberately excludes `graphic` (arbitrary DOM/elements),
 *  `media` (responsive rule bodies), and event-handler-shaped keys. */
const TOP_LEVEL_ALLOWLIST: ReadonlySet<string> = new Set([
	'title',
	'grid',
	'xAxis',
	'yAxis',
	'series',
	'legend',
	'tooltip',
	'color',
	'backgroundColor',
	'textStyle',
	'dataZoom',
	'axisPointer',
	'visualMap',
	'polar',
	'radiusAxis',
	'angleAxis',
	'radar',
	'aria',
	'animation'
]);

/** Allowlisted fields on each `series[i]`. Covers the common cartesian / pie /
 *  radar / scatter shapes without opening arbitrary keys. */
const SERIES_FIELD_ALLOWLIST: ReadonlySet<string> = new Set([
	'type',
	'name',
	'data',
	'encode',
	'stack',
	'coordinateSystem',
	'xAxisIndex',
	'yAxisIndex',
	'polarIndex',
	'radarIndex',
	'itemStyle',
	'lineStyle',
	'areaStyle',
	'label',
	'labelLine',
	'emphasis',
	'tooltip',
	'symbol',
	'symbolSize',
	'showSymbol',
	'smooth',
	'step',
	'connectNulls',
	'barWidth',
	'barMaxWidth',
	'barMinWidth',
	'barGap',
	'barCategoryGap',
	'showBackground',
	'backgroundStyle',
	'radius',
	'center',
	'roseType',
	'startAngle',
	'clockwise',
	'colorBy',
	'color',
	'large',
	'sampling',
	'clip',
	'z',
	'zlevel',
	'markLine',
	'markPoint',
	'markArea',
	'seriesLayoutBy',
	'datasetIndex'
]);

/** Keys that enable prototype pollution — rejected wherever they appear. */
const POLLUTION_KEYS: ReadonlySet<string> = new Set(['__proto__', 'constructor', 'prototype']);

/** Budgets that bound the recursive walk (DoS / circular-ref guard). */
const MAX_DEPTH = 16;
const MAX_NODES = 20_000;

/** Same-origin `data:` images that are safe to embed. SVG is excluded on
 *  purpose — an SVG data URI can carry script. */
const ALLOWED_DATA_IMAGE = /^data:image\/(?:png|jpe?g|gif|webp);/i;

/**
 * Extract every `url(...)` target from a value string, matching the
 * cssSanitiser extractor so url() hidden inside a bigger value is caught.
 */
function extractUrlTargets(value: string): string[] {
	const targets: string[] = [];
	const re = /url\(\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^)]*)\s*\)/gi;
	let match: RegExpExecArray | null;
	while ((match = re.exec(value)) !== null) {
		targets.push(match[1]);
	}
	return targets;
}

/**
 * Normalise a string the way the WHATWG URL parser normalises its input
 * BEFORE scheme detection (steps 1-2 of
 * https://url.spec.whatwg.org/#url-parsing): strip any leading/trailing C0
 * control (0x00-0x1F) or space (0x20), then remove every ASCII tab/CR/LF
 * wherever it occurs in what remains.
 *
 * saiku#1940: `trim()` only strips whitespace at the ends and never touches an
 * EMBEDDED control character, so a scheme split by an inner tab/newline (e.g.
 * `"java\tscript:alert(1)"`) doesn't match the anchored scheme regex below and
 * was treated as scheme-less / relative. A real browser's URL parser removes
 * that embedded tab/newline (and strips a leading control byte such as 0x01)
 * BEFORE it looks for a scheme, so it sees plain `"javascript:alert(1)"` — the
 * validator must normalise identically before it decides.
 */
function normalizeUrlLike(s: string): string {
	// Deliberate: strip leading/trailing C0 control (0x00-0x1F) or space (0x20),
	// mirroring the WHATWG URL parser.
	// eslint-disable-next-line no-control-regex
	const stripped = s.replace(/^[\x00-\x20]+/, '').replace(/[\x00-\x20]+$/, '');
	return stripped.replace(/[\t\r\n]/g, '');
}

/**
 * True when a resource reference (a full string value, or a `url()` target) is
 * safe: empty, a same-origin/relative path, or a `data:image/<raster>` URI.
 * Absolute schemes, protocol-relative `//host`, `image://<remote>`, and any
 * other `data:` payload are unsafe. Fails closed.
 */
function resourceRefAllowed(raw: string): boolean {
	let s = normalizeUrlLike(raw).replace(/^['"]|['"]$/g, '');
	s = normalizeUrlLike(s);
	// ECharts image-symbol prefix — validate whatever it points at.
	if (/^image:\/\//i.test(s)) {
		s = normalizeUrlLike(s.slice('image://'.length));
	}
	if (s === '') return true;
	if (ALLOWED_DATA_IMAGE.test(s)) return true;
	// Protocol-relative host reference.
	if (s.startsWith('//')) return false;
	// Any explicit scheme (http:, https:, javascript:, data:<non-image>, blob:,
	// file:, …) is rejected.
	if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return false;
	// No scheme and not protocol-relative → same-origin / relative → allowed.
	return true;
}

/**
 * True when a string carries a C0 control character that has NO legitimate use
 * in a chart title, label, or URL. Deliberately EXCLUDES tab (0x09), LF
 * (0x0A), and CR (0x0D): zrender/ECharts splits label/title/formatter text on
 * `\n` as a documented line-break feature, so a blanket 0x00-0x1F reject would
 * break real saved tiles on upgrade (e.g. a multi-line `title.text`). Those
 * three are already handled for the URL/scheme path by `normalizeUrlLike`
 * (which strips them before the scheme check), so excluding them here is
 * SAFE, not a bypass — this check is defence-in-depth for the remaining C0
 * bytes, none of which any legitimate string needs.
 */
function hasIllegalControlChar(value: string): boolean {
	// eslint-disable-next-line no-control-regex
	return /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(value);
}

/**
 * True when a string value is hostile: it references a remote resource, either
 * as a bare scheme'd/protocol-relative value, via a disallowed `url()` target,
 * or by embedding an absolute `http(s)` / `image://` URL anywhere inside it.
 */
function stringIsHostile(value: string): boolean {
	const v = value.trim();
	// 1. Bare resource reference as the whole value.
	if (!resourceRefAllowed(v)) return true;
	// 2. Any disallowed url() target embedded in the value.
	for (const target of extractUrlTargets(v)) {
		if (!resourceRefAllowed(target)) return true;
	}
	// 3. An absolute remote URL embedded ANYWHERE in the string (rich text /
	//    concatenated values). Protocol-relative refs are only treated as hostile
	//    at the start of the value (rule 1) to avoid false positives on prose.
	// Normalised the same way as the scheme check (saiku#1940) so a
	// control-char-split "http(s)://" / "image://" can't dodge this heuristic
	// either, for consistency with rule 1 — not itself a security boundary,
	// since `hasIllegalControlChar` already rejects everything but tab/LF/CR
	// before a string reaches here, and those three don't affect this match.
	const lower = normalizeUrlLike(v).toLowerCase();
	if (/https?:\/\//.test(lower)) return true;
	if (/image:\/\//.test(lower)) return true;
	return false;
}

/**
 * Deep-scan an arbitrary value for the three reject rules. Returns an error
 * string on the first violation, or {@code null} when the subtree is clean.
 */
function scanValue(
	value: unknown,
	path: string,
	ctx: { nodes: number },
	depth: number
): string | null {
	if (depth > MAX_DEPTH) return `Option nesting is too deep (at ${path || 'root'}).`;
	if (++ctx.nodes > MAX_NODES) return 'Option is too large to validate.';

	const t = typeof value;
	if (t === 'function') return `Function values are not allowed (at ${path || 'root'}).`;
	if (t === 'symbol' || t === 'bigint' || t === 'undefined') {
		// undefined can legitimately appear as an omitted key's value; only flag it
		// when it is an explicit array element / property value we can't serialise.
		if (t === 'undefined') return null;
		return `Unsupported value type at ${path || 'root'}.`;
	}
	if (value === null) return null;
	if (t === 'string') {
		if (hasIllegalControlChar(value as string)) {
			return `Control characters are not allowed (at ${path || 'root'}).`;
		}
		return stringIsHostile(value as string)
			? `Remote or unsafe URL is not allowed (at ${path || 'root'}).`
			: null;
	}
	if (t === 'number' || t === 'boolean') return null;

	if (Array.isArray(value)) {
		for (let i = 0; i < value.length; i++) {
			const err = scanValue(value[i], `${path}[${i}]`, ctx, depth + 1);
			if (err) return err;
		}
		return null;
	}

	if (t === 'object') {
		for (const key of Object.keys(value as object)) {
			if (POLLUTION_KEYS.has(key)) return `Disallowed key "${key}" (at ${path || 'root'}).`;
			const childPath = path ? `${path}.${key}` : key;
			const err = scanValue((value as Record<string, unknown>)[key], childPath, ctx, depth + 1);
			if (err) return err;
		}
		return null;
	}

	return `Unsupported value type at ${path || 'root'}.`;
}

/** JSON-safe deep clone. Inputs reaching here have already been scanned, so they
 *  contain only JSON-cloneable values; a circular ref (caught by the node
 *  budget earlier) would make this throw, which the caller turns into a
 *  rejection. Returns a fresh object so the validated value is never an alias of
 *  the caller's input (immutability). */
function deepClone<T>(value: T): T {
	return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Validate an author-supplied ECharts `option` against the safe subset.
 * Returns {@code {ok:true, value}} with a fresh, safe copy, or
 * {@code {ok:false, error}} with a human-readable reason. Never throws.
 */
export function validateEchartsOption(input: unknown): ValidateEchartsOptionResult {
	try {
		if (typeof input !== 'object' || input === null || Array.isArray(input)) {
			return { ok: false, error: 'ECharts option must be a JSON object.' };
		}
		const obj = input as Record<string, unknown>;

		// 1. Top-level allowlist (fail closed on unknown keys).
		for (const key of Object.keys(obj)) {
			if (POLLUTION_KEYS.has(key)) {
				return { ok: false, error: `Disallowed key "${key}".` };
			}
			if (!TOP_LEVEL_ALLOWLIST.has(key)) {
				return {
					ok: false,
					error: `Unknown top-level key "${key}". Allowed keys: ${[...TOP_LEVEL_ALLOWLIST].join(', ')}.`
				};
			}
		}

		// 2. Per-series field allowlist.
		if ('series' in obj && obj.series !== undefined && obj.series !== null) {
			const list = Array.isArray(obj.series) ? obj.series : [obj.series];
			for (let i = 0; i < list.length; i++) {
				const s = list[i];
				if (typeof s !== 'object' || s === null || Array.isArray(s)) {
					return { ok: false, error: `series[${i}] must be an object.` };
				}
				for (const key of Object.keys(s as object)) {
					if (POLLUTION_KEYS.has(key)) {
						return { ok: false, error: `Disallowed key "${key}" in series[${i}].` };
					}
					if (!SERIES_FIELD_ALLOWLIST.has(key)) {
						return {
							ok: false,
							error: `Unknown series field "${key}" in series[${i}]. Allowed: ${[...SERIES_FIELD_ALLOWLIST].join(', ')}.`
						};
					}
				}
			}
		}

		// 3. Deep scan for functions / remote URLs / pollution across the whole tree.
		const err = scanValue(obj, '', { nodes: 0 }, 0);
		if (err) return { ok: false, error: err };

		return { ok: true, value: deepClone(obj) };
	} catch (e: unknown) {
		// Fail closed on anything unexpected (e.g. a circular structure).
		return { ok: false, error: e instanceof Error ? e.message : 'Invalid ECharts option.' };
	}
}

/* ------------------------------------------------------------------ *
 * Data merge — inject the tile's query data into the author's option. *
 * ------------------------------------------------------------------ */

/** Generic chart projection the data-merge understands. Both the in-app tile
 *  (from an AiQueryResponse) and the embed tile (from token-scoped rows) build
 *  one of these, so the merge logic is shared. */
export interface EChartsDataProjection {
	/** Category-axis labels (one per data row). */
	categories: string[];
	/** One entry per measure column: its name + the column of values. */
	series: { name: string; data: (number | null)[] }[];
}

function asObject(v: unknown): Record<string, unknown> {
	return v && typeof v === 'object' && !Array.isArray(v)
		? { ...(v as Record<string, unknown>) }
		: {};
}

/* ------------------------------------------------------------------ *
 * saiku#1937 — tooltip render-mode neutralisation.                    *
 *                                                                      *
 * The validator above allows a STRING `tooltip.formatter` (ECharts     *
 * template syntax, e.g. "{b}: {c}") because a string can't execute the *
 * way a function can — that's true for the three reject rules above,   *
 * but it misses how ECharts actually RENDERS that string. In its       *
 * default `renderMode: 'html'`, ECharts substitutes the {a}/{b}/{c}    *
 * placeholders (escaped) into the author's template and then inserts   *
 * the WHOLE result into the tooltip DOM node via `innerHTML` — the     *
 * surrounding template markup itself is never escaped. An author       *
 * formatter like `'<img src=x onerror=alert(document.cookie)>'` is a   *
 * stored HTML fragment that executes on hover, in Saiku's own origin   *
 * for every viewer (including admins), and in a third-party embedder's *
 * origin via <saiku-embed kind="app">.                                 *
 *                                                                      *
 * Fix: force `renderMode: 'richText'` on every tooltip object the      *
 * custom-option path can reach — top-level `tooltip`, each             *
 * `series[i].tooltip`, and each `series[i].mark{Point,Line,Area}`'s    *
 * own `tooltip` — right where the option is handed to ECharts.         *
 *                                                                      *
 * IMPORTANT — these are NOT independently load-bearing. ECharts        *
 * resolves `renderMode` exactly ONCE per chart instance, from the      *
 * global top-level `tooltip` component: `TooltipView.init` reads       *
 * `ecModel.getComponent('tooltip').get('renderMode')` and that is the  *
 * render mode used for every tooltip the chart ever shows. A           *
 * `series[i].tooltip.renderMode`, a `mark*.tooltip.renderMode`, a      *
 * per-datum tooltip, or `legend.tooltip.renderMode` is NEVER consulted *
 * for this — ECharts only reads other fields (formatter, trigger, …)   *
 * off those nested tooltip objects. So the TOP-LEVEL neutralisation    *
 * below is what actually closes the hole; the series/mark* passes are  *
 * defence-in-depth (future-proofing against an ECharts version that    *
 * starts honouring them, and keeping the option internally consistent)*
 * — NOT a second, independently sufficient fix. Do not reason "series  *
 * is covered, the top-level pass can be relaxed": relaxing it reopens  *
 * the vulnerability regardless of what the series/mark* objects say.   *
 * `TooltipView.init` runs once per chart instance (on the FIRST        *
 * `setOption`), so the neutralised option must be part of that first   *
 * call — it always is today, since applyDataToEchartsOption runs       *
 * before every `chart.setOption(...)` call on the custom-option path.  *
 *                                                                      *
 * In richText mode ECharts lays the (still placeholder-substituted)    *
 * string out with its own text renderer onto the canvas; it is never   *
 * parsed as HTML/DOM, so embedded markup renders as inert literal text *
 * instead of executing. `extraCssText` (a raw `cssText` string applied *
 * to the tooltip DOM node) is dropped outright for the same reason —   *
 * it's only ever meaningful in HTML render mode, and a value like      *
 * `width:0;height:0` plus a `behavior:url(...)` legacy expression      *
 * isn't worth trying to sub-validate.                                  *
 *                                                                      *
 * Trade-off (flagged for SEC/LEAD): an author who genuinely wants rich *
 * HTML in a custom-tile tooltip (bold text, line breaks via <br>, an   *
 * inline swatch) loses that — richText mode renders such markup as     *
 * literal text, not formatting. The built-in Chart tile's tooltips are *
 * unaffected — they build their own formatter functions server-side    *
 * (already escaped, #1071/#1087/#1909) and never take author-supplied  *
 * HTML.                                                                *
 * ------------------------------------------------------------------ */

/** Force one tooltip-shaped value (or array of them) into `richText` render
 *  mode and drop `extraCssText`. Never mutates its input. */
function neutraliseTooltip(t: unknown): unknown {
	if (Array.isArray(t)) return t.map(neutraliseTooltip);
	if (!t || typeof t !== 'object') return t;
	const out = { ...(t as Record<string, unknown>) };
	out.renderMode = 'richText';
	delete out.extraCssText;
	return out;
}

/** Neutralise the TOP-LEVEL `tooltip` specifically — the one
 *  `TooltipView.init` actually reads `renderMode` from (see the block
 *  comment above). Not a vector today (`tooltip: "x"` / `tooltip: true`
 *  carry no formatter), but a truthy non-object value is coerced into an
 *  equivalent richText object rather than passed through unchanged, so a
 *  future author-reachable shape here can't quietly resolve to ECharts'
 *  own default renderMode instead of ours. A falsy tooltip (disabling it)
 *  is left alone. */
function neutraliseTopLevelTooltip(t: unknown): unknown {
	if (t && typeof t !== 'object') return { renderMode: 'richText' };
	return neutraliseTooltip(t);
}

/** Neutralise a single series entry's own `tooltip` plus the `tooltip` nested
 *  under each mark* component. Never mutates its input. */
function neutraliseSeriesTooltips(s: Record<string, unknown>): Record<string, unknown> {
	const out = { ...s };
	if ('tooltip' in out) out.tooltip = neutraliseTooltip(out.tooltip);
	for (const markKey of ['markPoint', 'markLine', 'markArea'] as const) {
		const mark = out[markKey];
		if (mark && typeof mark === 'object' && !Array.isArray(mark)) {
			const m = { ...(mark as Record<string, unknown>) };
			if ('tooltip' in m) m.tooltip = neutraliseTooltip(m.tooltip);
			out[markKey] = m;
		}
	}
	return out;
}

/** Set category `data` on a single axis object (only when it is a category axis
 *  and the author didn't already supply data). Returns a fresh object. */
function withCategoryData(axis: unknown, categories: string[]): Record<string, unknown> {
	const a = asObject(axis);
	const type = a.type;
	if (type === undefined || type === 'category') {
		a.type = 'category';
		if (a.data === undefined) a.data = categories;
	}
	return a;
}

/** Apply the category axis, tolerating a single axis or an array. */
function applyCategoryAxis(axis: unknown, categories: string[]): unknown {
	if (Array.isArray(axis)) {
		return axis.map((a, i) => (i === 0 ? withCategoryData(a, categories) : a));
	}
	return withCategoryData(axis, categories);
}

/** saiku#1772: true when the author EXPLICITLY declared this axis as categorical.
 *  Deliberately strict — an absent or untyped axis is not "explicit", so the
 *  historical default (categories on x) still applies when nothing says otherwise. */
function isDeclaredCategoryAxis(axis: unknown): boolean {
	const first = Array.isArray(axis) ? axis[0] : axis;
	return (
		!!first && typeof first === 'object' && (first as Record<string, unknown>).type === 'category'
	);
}

/**
 * Merge a data projection into a validated author option, returning a fresh
 * render-ready option. The author owns the chart shape + styling; this only
 * fills in axis categories and series data:
 *
 *  - Category `xAxis.data` is populated from {@link EChartsDataProjection.categories}
 *    (unless the author already set axis data), and a default value `yAxis` is
 *    added when absent — skipped entirely for pie charts.
 *  - Author-declared `series` keep their type/style; each gets its `data`
 *    filled from the projection by index (pie series get `{name,value}` pairs).
 *  - When the author declared no series, one bar series per measure is synthesised.
 *
 * Pure; never mutates its inputs.
 */
export function applyDataToEchartsOption(
	option: SafeEChartsOption,
	projection: EChartsDataProjection
): Record<string, unknown> {
	const opt = deepClone(option) as Record<string, unknown>;
	const { categories, series } = projection;

	const declared =
		opt.series === undefined || opt.series === null
			? []
			: Array.isArray(opt.series)
				? opt.series
				: [opt.series];

	const isPie = declared.some(
		(s) => s && typeof s === 'object' && (s as Record<string, unknown>).type === 'pie'
	);

	if (!isPie) {
		// saiku#1772: feed the categories to whichever axis the author declared as
		// categorical, not always x. A horizontal bar is written
		// `yAxis:{type:"category"}` + `xAxis:{type:"value"}` — and horizontal bar is
		// one of the shapes the built-in Chart tile can't produce, so it's a main
		// reason to reach for this renderer. Forcing categories onto x left the y
		// axis rendering 0,1,2… while the bars themselves were correct.
		// When both (or neither) are explicitly categorical, x keeps priority.
		if (isDeclaredCategoryAxis(opt.yAxis) && !isDeclaredCategoryAxis(opt.xAxis)) {
			opt.yAxis = applyCategoryAxis(opt.yAxis, categories);
			if (opt.xAxis === undefined || opt.xAxis === null) opt.xAxis = { type: 'value' };
		} else {
			opt.xAxis = applyCategoryAxis(opt.xAxis, categories);
			if (opt.yAxis === undefined || opt.yAxis === null) opt.yAxis = { type: 'value' };
		}
	}

	if (declared.length === 0) {
		opt.series = series.map((s) => ({ type: 'bar', name: s.name, data: s.data }));
	} else {
		opt.series = declared.map((raw, i) => {
			const s = asObject(raw);
			const src = series[i] ?? series[0];
			if (!src) return s;
			if (s.type === 'pie') {
				s.data = categories.map((c, ci) => ({ name: c, value: src.data[ci] ?? null }));
			} else {
				s.data = src.data;
				if (s.name === undefined) s.name = src.name;
			}
			return s;
		});
	}

	// saiku#1937 — neutralise every tooltip this option can reach (top-level,
	// per-series, per-mark*) right before it's handed back to the tile
	// renderer. See the block comment above neutraliseTooltip for why.
	if ('tooltip' in opt) opt.tooltip = neutraliseTopLevelTooltip(opt.tooltip);
	opt.series = (opt.series as unknown[]).map((s) => neutraliseSeriesTooltips(asObject(s)));

	return opt;
}
