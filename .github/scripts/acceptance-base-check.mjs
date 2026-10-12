#!/usr/bin/env node
// "Red on base, green on head": proves that every `acceptance/<issue>/spec.json` a PR adds or
// changes actually FAILS against the base branch's build and PASSES against the PR's build.
//
// Why: a spec written after the fact passes exactly like one written first, so nothing else
// shows that the spec proves anything. A spec that already passes on the base build asserts
// nothing the PR changed; it is the failure case this script exists to catch.
//
// This file only DECIDES. The workflow (.github/workflows/acceptance.yml) produces its inputs:
//   --changed FILE        `git diff --name-status HEAD^1 HEAD -- 'acceptance/*/spec.json'` of the PR's merge checkout
//   --head FILE           acceptance-runner results JSON from the PR build (the `acceptance / specs` job)
//   --base FILE           acceptance-runner results JSON for the same specs run on the BASE build
//   --base-job-result R   result of the job that produced --base (success | failure | cancelled | skipped)
//   --labels A,B          the PR's labels; `spec-already-green` excuses a spec that passes on base
//   --out FILE            verdict JSON (optional)
//   --list                with --changed only: print the changed issue numbers, space separated, and exit
//
// Exit 0 for pass / not-run / nothing to check, 1 when any spec fails the proof, 2 on bad input.
// Never a pass for something that could not run: a spec that was `not-run` on either side
// (a fork PR without the Maven token cannot start the launcher) is reported `not-run`.

import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** The human-applied label that excuses specs which legitimately pass on the base build. */
export const ESCAPE_LABEL = 'spec-already-green';

const SPEC_PATH = /^acceptance\/(\d+)\/spec\.json$/;

/**
 * Issue numbers whose spec.json the PR added, modified or renamed in. Input is
 * `git diff --name-status` output (tab separated, one entry per line). Deleted specs are not
 * checked: there is nothing left to prove. A rename counts by its new path.
 */
export function changedSpecIssues(nameStatus) {
  const issues = new Set();
  for (const line of String(nameStatus ?? '').split('\n')) {
    if (!line.trim()) continue;
    const [status, ...paths] = line.split('\t');
    if (status.startsWith('D')) continue;
    const path = paths[paths.length - 1];
    const match = SPEC_PATH.exec(path ?? '');
    if (match) issues.add(Number(match[1]));
  }
  return [...issues].sort((a, b) => a - b);
}

/** True when the PR carries the escape-hatch label (exact, case-sensitive name). */
export function isExcused(labels) {
  const list = Array.isArray(labels) ? labels : String(labels ?? '').split(',');
  return list.map((l) => l.trim()).includes(ESCAPE_LABEL);
}

const verdictOf = (results, issue) => {
  const spec = (results?.specs ?? []).find((s) => s.issue === issue);
  return spec ? { verdict: spec.verdict, reason: spec.reason } : null;
};

/**
 * Decide one spec. `head` and `base` are `{verdict, reason}` or null (no result recorded).
 * Order matters: the head must pass before the base is even considered, because "fails on
 * base" is only evidence when the same spec demonstrably passes on the PR.
 */
export function decideSpec({ issue, head, base, baseJobResult = 'success', excused = false }) {
  const spec = `acceptance/${issue}/spec.json`;
  if (!head) {
    return { issue, verdict: 'fail', message: `${spec}: no result from the PR build, so "green on head" is unproven. Check the acceptance / specs job.` };
  }
  if (head.verdict === 'fail') {
    return { issue, verdict: 'fail', message: `${spec}: fails on the PR build too. Fix the implementation (or the spec) until it is green on head.` };
  }
  if (head.verdict !== 'pass') {
    return { issue, verdict: 'not-run', message: `${spec}: not run on the PR build${head.reason ? ` (${head.reason})` : ''}; red-on-base is unproven.` };
  }
  if (baseJobResult === 'failure' || baseJobResult === 'cancelled') {
    return { issue, verdict: 'fail', message: `${spec}: the base-side run did not complete (${baseJobResult}), so "red on base" is unproven. Re-run the failed jobs.` };
  }
  if (!base) {
    return { issue, verdict: 'fail', message: `${spec}: no result from the base build although the base run completed.` };
  }
  if (base.verdict === 'fail') {
    return { issue, verdict: 'pass', message: `${spec}: red on base, green on head.` };
  }
  if (base.verdict === 'pass') {
    if (excused) {
      return { issue, verdict: 'excused', message: `${spec}: already passes on base; excused by the "${ESCAPE_LABEL}" label (applied by a human).` };
    }
    return {
      issue,
      verdict: 'fail',
      message:
        `${spec}: PASSES on the base branch's build, so it proves nothing about this change. ` +
        `Write the spec so it fails without the fix (commit it first), or, if it is a legitimate regression guard for behaviour that already works, ` +
        `have a maintainer add the "${ESCAPE_LABEL}" label and then push or close and reopen the PR.`
    };
  }
  return { issue, verdict: 'not-run', message: `${spec}: not run on the base build${base.reason ? ` (${base.reason})` : ''}; red-on-base is unproven.` };
}

/** Fold the changed specs into one report. `verdict` is fail > not-run > pass; nothing changed => `none`. */
export function evaluate({ changedIssues, headResults, baseResults, baseJobResult, labels }) {
  const excused = isExcused(labels);
  const specs = changedIssues.map((issue) =>
    decideSpec({
      issue,
      head: verdictOf(headResults, issue),
      base: verdictOf(baseResults, issue),
      baseJobResult,
      excused
    })
  );
  let verdict = 'pass';
  if (specs.length === 0) verdict = 'none';
  else if (specs.some((s) => s.verdict === 'fail')) verdict = 'fail';
  else if (specs.some((s) => s.verdict === 'not-run')) verdict = 'not-run';
  return { schemaVersion: 1, verdict, escapeLabel: excused, specs };
}

/** Markdown for the job summary, one line per spec. */
export function renderReport(report) {
  const lines = [`## acceptance / spec fails on base: ${report.verdict}`, ''];
  if (report.specs.length === 0) lines.push('No `acceptance/<issue>/spec.json` was added or changed by this PR; nothing to prove.');
  for (const s of report.specs) lines.push(`- **${s.verdict}** ${s.message}`);
  if (report.verdict === 'not-run') {
    lines.push('', 'Not-run is not a pass: the proof could not be made here (for example a fork PR cannot build the launcher without the Maven token). A maintainer should check it on a same-repository branch.');
  }
  return `${lines.join('\n')}\n`;
}

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function readText(file) {
  try {
    return readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

function parseArgs(argv) {
  const opts = { baseJobResult: 'success', labels: '' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => argv[++i];
    if (arg === '--changed') opts.changed = next();
    else if (arg === '--head') opts.head = next();
    else if (arg === '--base') opts.base = next();
    else if (arg === '--base-job-result') opts.baseJobResult = next();
    else if (arg === '--labels') opts.labels = next() ?? '';
    else if (arg === '--out') opts.out = next();
    else if (arg === '--list') opts.list = true;
    else return { error: `unknown argument "${arg}"` };
  }
  if (!opts.changed) return { error: '--changed FILE is required' };
  return { opts };
}

/** CLI entry. Returns the exit code. */
export function main(argv, io = { stdout: process.stdout, stderr: process.stderr }) {
  const { opts, error } = parseArgs(argv);
  if (error) {
    io.stderr.write(`acceptance-base-check: ${error}\n`);
    return 2;
  }
  const changedText = readText(opts.changed);
  if (changedText === null) {
    io.stderr.write(`acceptance-base-check: cannot read ${opts.changed}\n`);
    return 2;
  }
  const changedIssues = changedSpecIssues(changedText);
  if (opts.list) {
    io.stdout.write(`${changedIssues.join(' ')}\n`);
    return 0;
  }
  // A missing results file is "no result", which decideSpec turns into a failure or not-run;
  // it is never silently a pass.
  const report = evaluate({
    changedIssues,
    headResults: opts.head ? readJson(opts.head) : null,
    baseResults: opts.base ? readJson(opts.base) : null,
    baseJobResult: opts.baseJobResult,
    labels: opts.labels
  });
  if (opts.out) writeFileSync(opts.out, `${JSON.stringify(report, null, 2)}\n`);
  io.stdout.write(renderReport(report));
  if (report.verdict === 'fail') {
    for (const s of report.specs.filter((x) => x.verdict === 'fail')) io.stdout.write(`::error::${s.message}\n`);
    return 1;
  }
  if (report.verdict === 'not-run') io.stdout.write('::warning::The red-on-base proof was not run for at least one spec; see the summary.\n');
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  process.exit(main(process.argv.slice(2)));
}
