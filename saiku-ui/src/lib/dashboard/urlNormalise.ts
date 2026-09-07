/**
 * Shared URL-target normalisation for the App Builder's fail-closed
 * sanitisers (`cssSanitiser` and the `echarts-option` custom-tile validator,
 * `dashboard/custom/echartsOption.ts`). Extracted in saiku#1942 so both
 * validators apply the SAME control-char handling instead of maintaining two
 * copies that can drift — this module has no dependency on either sanitiser
 * (neutral location under `dashboard/`, not `dashboard/custom/`) so the
 * import direction stays clean both ways.
 */

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
export function normalizeUrlLike(s: string): string {
	// Deliberate: strip leading/trailing C0 control (0x00-0x1F) or space (0x20),
	// mirroring the WHATWG URL parser.
	// eslint-disable-next-line no-control-regex
	const stripped = s.replace(/^[\x00-\x20]+/, '').replace(/[\x00-\x20]+$/, '');
	return stripped.replace(/[\t\r\n]/g, '');
}
