// Unit tests for the "red on base, green on head" proof (acceptance-base-check.mjs) and for
// how acceptance.yml wires it. Hermetic: temp directories and two loopback HTTP servers that
// play the base build and the PR build; no network. Run by `ci / flake-policy tests`
// (node --test ".github/scripts/*.test.mjs").

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { ESCAPE_LABEL, changedSpecIssues, decideSpec, evaluate, isExcused, main, renderReport } from './acceptance-base-check.mjs';
import { runSpecs } from './acceptance-runner.mjs';

const repoRoot = join(import.meta.dirname, '..', '..');
const cli = join(repoRoot, '.github', 'scripts', 'acceptance-base-check.mjs');

const pass = { verdict: 'pass' };
const fail = { verdict: 'fail' };
const notRun = (reason) => ({ verdict: 'not-run', reason });
const results = (specs) => ({ verdict: 'pass', specs: specs.map(([issue, verdict, reason]) => ({ issue, verdict, ...(reason ? { reason } : {}) })) });

// ------------------------------------------------------------------ changedSpecIssues

test('changedSpecIssues lists added, modified and renamed-in specs, sorted and unique', () => {
  const diff = [
    'A\tacceptance/2236/spec.json',
    'M\tacceptance/818/spec.json',
    'R087\tacceptance/1/spec.json\tacceptance/2240/spec.json',
    'M\tacceptance/818/spec.json'
  ].join('\n');
  assert.deepEqual(changedSpecIssues(diff), [818, 2236, 2240]);
});

test('changedSpecIssues ignores deleted specs, other files and malformed paths', () => {
  const diff = [
    'D\tacceptance/866/spec.json',
    'M\tacceptance/2172/check.mjs',
    'A\tacceptance/README.md',
    'A\tacceptance/abc/spec.json',
    'A\tacceptance/12/nested/spec.json',
    'A\tdocs/acceptance/12/spec.json',
    ''
  ].join('\n');
  assert.deepEqual(changedSpecIssues(diff), []);
  assert.deepEqual(changedSpecIssues(''), []);
  assert.deepEqual(changedSpecIssues(undefined), []);
});

// ------------------------------------------------------------------ the escape label

test('isExcused needs the exact label name', () => {
  assert.equal(isExcused('bug,spec-already-green'), true);
  assert.equal(isExcused(['x', ' spec-already-green ']), true);
  assert.equal(isExcused('acceptance-waived'), false, 'the docs-or-tests waiver is not this escape hatch');
  assert.equal(isExcused('Spec-Already-Green'), false);
  assert.equal(isExcused('spec-already-green-ish'), false);
  assert.equal(isExcused(''), false);
  assert.equal(ESCAPE_LABEL, 'spec-already-green');
});

// ------------------------------------------------------------------ decideSpec

test('red on base and green on head is the only unconditional pass', () => {
  const d = decideSpec({ issue: 5, head: pass, base: fail });
  assert.equal(d.verdict, 'pass');
  assert.match(d.message, /red on base, green on head/);
});

test('a spec that passes on base fails, names the spec and says how to proceed', () => {
  const d = decideSpec({ issue: 5, head: pass, base: pass });
  assert.equal(d.verdict, 'fail');
  assert.match(d.message, /acceptance\/5\/spec\.json/);
  assert.match(d.message, /PASSES on the base/);
  assert.match(d.message, /spec-already-green/);
});

test('the escape label excuses a base-green spec and the report says so', () => {
  const d = decideSpec({ issue: 5, head: pass, base: pass, excused: true });
  assert.equal(d.verdict, 'excused');
  assert.match(d.message, /excused by the "spec-already-green" label/);
});

test('the escape label never rescues a spec that is red on head', () => {
  assert.equal(decideSpec({ issue: 5, head: fail, base: pass, excused: true }).verdict, 'fail');
  assert.equal(decideSpec({ issue: 5, head: fail, base: fail, excused: true }).verdict, 'fail');
});

test('a spec red on head fails whatever the base did', () => {
  for (const base of [pass, fail, notRun('x'), null]) {
    assert.equal(decideSpec({ issue: 5, head: fail, base }).verdict, 'fail');
  }
});

test('no head result is a failure, never a pass', () => {
  const d = decideSpec({ issue: 5, head: null, base: fail });
  assert.equal(d.verdict, 'fail');
  assert.match(d.message, /no result from the PR build/);
});

test('not-run on either side is not-run, never pass', () => {
  assert.equal(decideSpec({ issue: 5, head: notRun('no base URL configured'), base: notRun('no base URL configured') }).verdict, 'not-run');
  const onBase = decideSpec({ issue: 5, head: pass, base: notRun('no base URL configured') });
  assert.equal(onBase.verdict, 'not-run');
  assert.match(onBase.message, /no base URL configured/);
});

test('a base run that did not complete cannot prove red-on-base', () => {
  for (const baseJobResult of ['failure', 'cancelled']) {
    const d = decideSpec({ issue: 5, head: pass, base: null, baseJobResult });
    assert.equal(d.verdict, 'fail');
    assert.match(d.message, new RegExp(baseJobResult));
  }
  // even a (stale) base failure result does not outweigh a base job that failed
  assert.equal(decideSpec({ issue: 5, head: pass, base: fail, baseJobResult: 'failure' }).verdict, 'fail');
  // a completed base run that simply lacks the spec is also a failure
  assert.equal(decideSpec({ issue: 5, head: pass, base: null, baseJobResult: 'success' }).verdict, 'fail');
});

// ------------------------------------------------------------------ evaluate / render

test('evaluate: any failing spec fails the PR; the others are still reported', () => {
  const report = evaluate({
    changedIssues: [1, 2, 3],
    headResults: results([[1, 'pass'], [2, 'pass'], [3, 'pass']]),
    baseResults: results([[1, 'fail'], [2, 'pass'], [3, 'fail']]),
    baseJobResult: 'success',
    labels: ''
  });
  assert.equal(report.verdict, 'fail');
  assert.deepEqual(report.specs.map((s) => s.verdict), ['pass', 'fail', 'pass']);
  const text = renderReport(report);
  assert.match(text, /acceptance \/ spec fails on base: fail/);
  assert.match(text, /acceptance\/2\/spec\.json: PASSES on the base/);
});

test('evaluate: fail beats not-run, not-run beats pass, no specs is none', () => {
  const head = results([[1, 'pass'], [2, 'not-run', 'no base URL configured']]);
  const base = results([[1, 'fail'], [2, 'not-run', 'no base URL configured']]);
  assert.equal(evaluate({ changedIssues: [1, 2], headResults: head, baseResults: base, baseJobResult: 'success', labels: '' }).verdict, 'not-run');
  assert.equal(evaluate({ changedIssues: [1], headResults: head, baseResults: base, baseJobResult: 'success', labels: '' }).verdict, 'pass');
  assert.equal(evaluate({ changedIssues: [], headResults: head, baseResults: base, baseJobResult: 'success', labels: '' }).verdict, 'none');
  const mixed = evaluate({ changedIssues: [1, 2], headResults: results([[1, 'fail'], [2, 'not-run']]), baseResults: results([[1, 'fail']]), baseJobResult: 'success', labels: '' });
  assert.equal(mixed.verdict, 'fail');
});

test('evaluate: the label excuses every base-green spec in the PR and is recorded', () => {
  const report = evaluate({
    changedIssues: [1, 2],
    headResults: results([[1, 'pass'], [2, 'pass']]),
    baseResults: results([[1, 'pass'], [2, 'fail']]),
    baseJobResult: 'success',
    labels: 'enhancement,spec-already-green'
  });
  assert.equal(report.verdict, 'pass');
  assert.equal(report.escapeLabel, true);
  assert.deepEqual(report.specs.map((s) => s.verdict), ['excused', 'pass']);
});

test('renderReport explains that not-run is not a pass', () => {
  const report = evaluate({ changedIssues: [1], headResults: results([[1, 'not-run', 'no base URL configured']]), baseResults: null, baseJobResult: 'success', labels: '' });
  assert.match(renderReport(report), /Not-run is not a pass/);
});

// ------------------------------------------------------------------ CLI

function scratch() {
  return mkdtempSync(join(tmpdir(), 'acceptance-base-'));
}

function capture() {
  let out = '';
  let err = '';
  return { io: { stdout: { write: (c) => (out += c) }, stderr: { write: (c) => (err += c) } }, out: () => out, err: () => err };
}

test('main exits 1 and annotates the failing spec when a spec passes on base', () => {
  const dir = scratch();
  writeFileSync(join(dir, 'changed.txt'), 'A\tacceptance/77/spec.json\n');
  writeFileSync(join(dir, 'head.json'), JSON.stringify(results([[77, 'pass']])));
  writeFileSync(join(dir, 'base.json'), JSON.stringify(results([[77, 'pass']])));
  const cap = capture();
  const code = main(['--changed', join(dir, 'changed.txt'), '--head', join(dir, 'head.json'), '--base', join(dir, 'base.json'), '--out', join(dir, 'verdict.json')], cap.io);
  assert.equal(code, 1);
  assert.match(cap.out(), /::error::acceptance\/77\/spec\.json: PASSES on the base/);
  assert.equal(JSON.parse(readFileSync(join(dir, 'verdict.json'), 'utf8')).verdict, 'fail');
});

test('main with the escape label exits 0; without a results file it fails closed', () => {
  const dir = scratch();
  writeFileSync(join(dir, 'changed.txt'), 'M\tacceptance/77/spec.json\n');
  writeFileSync(join(dir, 'head.json'), JSON.stringify(results([[77, 'pass']])));
  writeFileSync(join(dir, 'base.json'), JSON.stringify(results([[77, 'pass']])));
  const args = ['--changed', join(dir, 'changed.txt'), '--head', join(dir, 'head.json'), '--base', join(dir, 'base.json')];
  assert.equal(main([...args, '--labels', 'spec-already-green'], capture().io), 0);
  // a missing head file is "no result", which is a failure, not a silent pass
  assert.equal(main(['--changed', join(dir, 'changed.txt'), '--head', join(dir, 'nope.json'), '--base', join(dir, 'base.json')], capture().io), 1);
});

test('main prints a warning, not an error, for not-run, and exits 0', () => {
  const dir = scratch();
  writeFileSync(join(dir, 'changed.txt'), 'A\tacceptance/77/spec.json\n');
  writeFileSync(join(dir, 'head.json'), JSON.stringify(results([[77, 'not-run', 'no base URL configured']])));
  const cap = capture();
  assert.equal(main(['--changed', join(dir, 'changed.txt'), '--head', join(dir, 'head.json')], cap.io), 0);
  assert.match(cap.out(), /::warning::/);
  assert.match(cap.out(), /not-run/);
});

test('main --list prints the changed issue numbers; bad input exits 2', () => {
  const dir = scratch();
  writeFileSync(join(dir, 'changed.txt'), 'A\tacceptance/9/spec.json\nA\tacceptance/3/spec.json\nD\tacceptance/4/spec.json\n');
  const cap = capture();
  assert.equal(main(['--changed', join(dir, 'changed.txt'), '--list'], cap.io), 0);
  assert.equal(cap.out(), '3 9\n');
  assert.equal(main([], capture().io), 2);
  assert.equal(main(['--changed', join(dir, 'missing.txt')], capture().io), 2);
  assert.equal(main(['--bogus'], capture().io), 2);
});

test('the script runs as a CLI (process exit code is the verdict)', () => {
  const dir = scratch();
  writeFileSync(join(dir, 'changed.txt'), 'A\tacceptance/77/spec.json\n');
  writeFileSync(join(dir, 'head.json'), JSON.stringify(results([[77, 'pass']])));
  writeFileSync(join(dir, 'base.json'), JSON.stringify(results([[77, 'fail']])));
  const ok = spawnSync(process.execPath, [cli, '--changed', join(dir, 'changed.txt'), '--head', join(dir, 'head.json'), '--base', join(dir, 'base.json')], { encoding: 'utf8' });
  assert.equal(ok.status, 0, ok.stderr);
  writeFileSync(join(dir, 'base.json'), JSON.stringify(results([[77, 'pass']])));
  const bad = spawnSync(process.execPath, [cli, '--changed', join(dir, 'changed.txt'), '--head', join(dir, 'head.json'), '--base', join(dir, 'base.json')], { encoding: 'utf8' });
  assert.equal(bad.status, 1);
});

// ------------------------------------------------------------------ with the real runner

/** A loopback "build": answers /rest/saiku/api/widgets with the given status. */
function build(status) {
  const server = createServer((_req, res) => {
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end('[]');
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, url: `http://127.0.0.1:${server.address().port}` })));
}

function widgetsRepo() {
  const root = scratch();
  mkdirSync(join(root, 'acceptance', '4242'), { recursive: true });
  writeFileSync(
    join(root, 'acceptance', '4242', 'spec.json'),
    JSON.stringify({
      issue: 4242,
      title: 'the widgets endpoint exists',
      kind: 'api',
      criteria: [{ id: 'C1', given: 'any caller', then: 'GET /widgets returns 200' }],
      steps: [{ name: 'GET /widgets', criterion: 'C1', request: { method: 'GET', path: '/widgets' }, expect: { status: 200 } }]
    })
  );
  return root;
}

test('end to end with the runner: a new endpoint is red on a base without it and green on the PR build', async () => {
  const base = await build(404);
  const head = await build(200);
  try {
    const root = widgetsRepo();
    const baseResults = await runSpecs({ repoRoot: root, baseUrl: base.url, issues: [4242], env: {} });
    const headResults = await runSpecs({ repoRoot: root, baseUrl: head.url, issues: [4242], env: {} });
    const report = evaluate({ changedIssues: [4242], headResults, baseResults, baseJobResult: 'success', labels: '' });
    assert.equal(report.verdict, 'pass', renderReport(report));
  } finally {
    base.server.close();
    head.server.close();
  }
});

test('end to end with the runner: a spec written after the fact (green on both builds) is rejected', async () => {
  const base = await build(200);
  const head = await build(200);
  try {
    const root = widgetsRepo();
    const baseResults = await runSpecs({ repoRoot: root, baseUrl: base.url, issues: [4242], env: {} });
    const headResults = await runSpecs({ repoRoot: root, baseUrl: head.url, issues: [4242], env: {} });
    const report = evaluate({ changedIssues: [4242], headResults, baseResults, baseJobResult: 'success', labels: '' });
    assert.equal(report.verdict, 'fail');
    assert.match(report.specs[0].message, /acceptance\/4242\/spec\.json: PASSES on the base/);
  } finally {
    base.server.close();
    head.server.close();
  }
});

test('end to end with the runner: with no server on either side (fork PR) the proof is not-run', async () => {
  const root = widgetsRepo();
  const baseResults = await runSpecs({ repoRoot: root, baseUrl: undefined, issues: [4242], env: {} });
  const headResults = await runSpecs({ repoRoot: root, baseUrl: undefined, issues: [4242], env: {} });
  const report = evaluate({ changedIssues: [4242], headResults, baseResults, baseJobResult: 'success', labels: '' });
  assert.equal(report.verdict, 'not-run');
  assert.notEqual(report.verdict, 'pass');
});

// ------------------------------------------------------------------ workflow wiring

const workflow = readFileSync(join(repoRoot, '.github', 'workflows', 'acceptance.yml'), 'utf8');
const code = workflow.split('\n').filter((line) => !line.trim().startsWith('#')).join('\n');

/** The text of one top-level job in acceptance.yml. */
function jobBlock(id) {
  const lines = workflow.split('\n');
  const start = lines.findIndex((line) => line === `  ${id}:`);
  assert.ok(start >= 0, `job ${id} exists`);
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^ {2}[a-z][\w-]*:\s*$/.test(lines[i])) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join('\n');
}

test('the spec-first check exists under its published name and only runs when a spec changed', () => {
  const check = jobBlock('spec-fails-on-base');
  assert.match(check, /name: acceptance \/ spec fails on base/);
  assert.match(check, /needs: \[detect, specs, base-run\]/);
  assert.match(check, /needs\.detect\.outputs\.has_specs == 'true'/);
  assert.match(check, /acceptance-base-check\.mjs/);
  // the base build is paid for only when a spec changed
  assert.match(jobBlock('base-run'), /needs\.detect\.outputs\.has_specs == 'true'/);
  assert.match(jobBlock('detect'), /github\.event_name == 'pull_request'/);
});

test('the base build is cached on the base SHA and runs beside the head job, not after it', () => {
  const baseRun = jobBlock('base-run');
  assert.match(baseRun, /actions\/cache\/restore@[0-9a-f]{40}/);
  assert.match(baseRun, /actions\/cache\/save@[0-9a-f]{40}/);
  assert.match(baseRun, /key: acceptance-base-launcher-v1-\$\{\{ needs\.detect\.outputs\.base_sha \}\}/);
  assert.match(baseRun, /needs: detect\n/, 'base-run waits only for detect, so it runs in parallel with specs');
  assert.doesNotMatch(baseRun, /needs:.*specs/);
});

test('the spec-first jobs keep the trust model: no new trigger, no write scope, only the Maven token, every action SHA-pinned', () => {
  assert.doesNotMatch(code, /pull_request_target|workflow_run/);
  assert.doesNotMatch(code, /(?:contents|issues|pull-requests|actions|checks|statuses|id-token): write/);
  assert.doesNotMatch(code, /GITHUB_TOKEN|github\.token/);
  const secrets = [...code.matchAll(/secrets\.([A-Z_]+)/g)].map((m) => m[1]);
  assert.ok(secrets.length > 0);
  assert.deepEqual([...new Set(secrets)], ['GH_PACKAGES_TOKEN']);
  for (const m of code.matchAll(/^\s*(?:-\s*)?uses:\s*(\S+)/gm)) {
    assert.match(m[1], /@[0-9a-f]{40}$/, `${m[1]} must be pinned to a full commit SHA`);
  }
  // untrusted PR text reaches scripts through env:, never by interpolation into run:
  assert.doesNotMatch(code, /run:[^\n]*\$\{\{\s*github\.event\.pull_request\.(title|body)/);
  assert.match(jobBlock('spec-fails-on-base'), /PR_LABELS: \$\{\{ join\(github\.event\.pull_request\.labels\.\*\.name, ','\) \}\}/);
});

test('the base run starts the BASE checkout\'s jar and runs the PR\'s runner against the base tree', () => {
  const baseRun = jobBlock('base-run');
  assert.match(baseRun, /ref: \$\{\{ needs\.detect\.outputs\.base_sha \}\}/);
  assert.match(baseRun, /path: base/);
  assert.match(baseRun, /--host 127\.0\.0\.1/);
  assert.match(baseRun, /SAIKU_DEMO=true/);
  assert.match(baseRun, /acceptance-runner\.mjs run --repo-root base/);
  assert.match(baseRun, /GH_PACKAGES_TOKEN is not available \(fork PR\)/);
});
