# Acceptance specs: `acceptance/<issue>/`

Ported from spiculedata/saiku-cloud (its #1382) and adapted to Saiku's REST surface; see
[Provenance](#provenance). Tracked here by issue #2172.

**Where the logic lives.** Running the specs and the red-on-base, green-on-head proof are done by reusable
workflows in [spiculedata/acceptance-spec](https://github.com/spiculedata/acceptance-spec) (a public repository,
extracted from this one), called from `.github/workflows/acceptance.yml` at a pinned commit SHA. This repository
keeps only what is Saiku's: the Maven build of the launcher, how it is started, the REST paths, the waiver list and
the specs themselves. The convention gate (`ci / acceptance convention`) is acceptance-spec's `convention.yml`,
called from `ci.yml` at the same pin. Only the local runner is still here; see
[What is still local](#what-is-still-local) and [Bumping acceptance-spec](#bumping-acceptance-spec).

## Why

Green CI is not the same as "this PR did what its issue asked". Unit tests build objects by hand; nothing
executes the behaviour the issue asked for. So the acceptance criteria live **with the issue, as code**, next to
the fix:

- the issue templates have an **Acceptance tests** section, so a worker writes the check before the patch;
- a PR that closes issue N **must** ship `acceptance/N/spec.json`; `ci / acceptance convention` (inside the
  required `ci` rollup) fails without it, once the rollout cutoff is set;
- `acceptance / specs` (`acceptance.yml`, which calls acceptance-spec's `run-specs.yml`) executes those specs
  against the PR's own launcher.

## The convention

```bash
# 1. the issue: fill in "Acceptance tests" when filing it
# 2. the fix: acceptance/<issue>/spec.json, derived from those criteria
# 3. the gate: ci / acceptance convention (inside ci.yml)
# 4. the run:  acceptance / specs (acceptance.yml, shared run-specs.yml) against the PR's own launcher
```

One directory per **issue**, not per PR: a spec belongs to the contract, so a later change that regresses it
runs the same file. The PR body claims the issue with a GitHub closing keyword (`Closes #818`, `Fixes #818`,
`Resolves #818`); a bare `#818` or "related to #818" is not a claim.

### The waiver

A PR opts out with the `acceptance-waived` label. The label is deliberate and human-applied; nothing in CI
waives itself. The waiver is **verified**: it only holds when every changed file is documentation (`docs/`,
`*.md`, `.github/ISSUE_TEMPLATE/`) or a test (`src/test/`, `__tests__/`, `saiku-ui/e2e/`, `tests/`, `*.test.*`,
`*.spec.*`, `*.e2e.*`): a tests-only change adds no product behaviour to specify. A PR that touches anything
else (a test file beside a production change still has the production file), or has no changed files, is held as
if the label were absent, and the check says which files disqualify it. The changed files are
`git diff --name-only HEAD^1 HEAD` on the PR's merge checkout, read one path per line.

### Spec first: red on base, green on head

The convention gate only proves a spec **exists**. `acceptance / spec fails on base` (acceptance-spec's
`base-check.yml`, called by `acceptance.yml`) proves it was worth writing: for every `acceptance/<issue>/spec.json` a PR **adds or changes**, the spec must

1. **fail** when run against the build of the PR's **base** branch (the commit the PR is merged into), and
2. **pass** against the PR's own build.

A spec that already passes on base asserts nothing the PR changed, which is exactly what a spec written after the
fact looks like, so it fails the check and the message names the spec. So write and commit the failing spec
**first** (the first commit on the branch contains `acceptance/<issue>/spec.json`), watch it fail, then implement.
A spec that tests a brand-new endpoint "fails" on base because the endpoint is missing; that is the intended red.

How it runs, and what it costs:

| Piece | Behaviour |
|---|---|
| Trigger | Only when the PR's merge checkout differs from its base in some `acceptance/*/spec.json` (a deleted spec is not checked). A PR touching no spec pays nothing: `detect` is a few seconds and the rest is skipped. |
| Jobs | `acceptance / detect changed specs` (seconds), then `acceptance / specs on head` and `acceptance / specs on base` in **parallel**, then `acceptance / spec fails on base`. The workflow is self-contained: it builds and runs both sides itself, so the PR's launcher is built twice per spec-changing PR (once by `acceptance / acceptance specs`, once by `specs on head`). Upstream has an opt-in `share-build` that avoids that at the price of running the base side after the head side; it is not turned on here. |
| Base build | `acceptance / specs on base` builds the base launcher (same Maven command as the head job) and runs only the changed specs against it. The launcher jar (`acceptance-launcher.jar`) is meant to be cached (`actions/cache`) on the base SHA and a fingerprint of the build settings, so a re-push to the same PR, which has the same base, skips the ~5 min build (working since pin `380780e`; see [What is still local](#what-is-still-local)). A cache created by one PR is not visible to another PR, so the first run per PR and per base SHA pays the build. |
| Specs and base tree | The runner comes from acceptance-spec at the pinned SHA; the spec files come from the PR. The code under test, and the working directory of `command` specs, come from the base checkout, with the PR's spec directories copied over it. |
| Verdict | `acceptance / spec fails on base` waits for both runs. Per spec: **red on base and green on head** passes; **passes on base** fails; **fails on head** fails; a base run that errored or recorded nothing fails (the proof is unmade, not assumed). |
| Forks | The Maven token is withheld from fork PRs, so the base launcher cannot be built. Api specs are `not-run` on both sides and the check reports `not-run` (a warning, green by design like `acceptance / specs`), **never** `pass`. Upstream skips the build whenever the token is absent, even if a cached base jar exists. `command` specs need no server and still run on both sides. A maintainer should re-prove a fork's specs on a same-repository branch. |
| Security | `pull_request` only, `contents: read`, no write scope, no secret beyond the `GH_PACKAGES_TOKEN` (handed over as the shared workflows' `BUILD_TOKEN`). The PR's spec commands run with the same allow-listed environment as in the head job. |

**Not required.** Like `acceptance / specs`, it is a separate workflow (`mode: enforce`, so it goes red, but it is not in the `ci` rollup), so it reports
red but does not by itself block a merge unless the repository's rules make it a required status check
(not verified or assumed here; see [ci-overview.md](ci-overview.md)). Its failures reach the PR through the sticky
`ci feedback` comment.

### The escape hatch: `spec-already-green`

Some specs legitimately pass on base: a regression guard for behaviour that already works, or a typo fix to an
old spec. A **human** applies the `spec-already-green` PR label (create the label once; like `acceptance-waived`
it is deliberate, human-applied and visible in the PR timeline, and nothing in CI applies it). With the label,
every base-green spec in the PR is reported `excused` instead of failing, and the check output says so. The label
never rescues a spec that fails on head. A spec field was rejected as the hatch: the PR's author (often an agent)
would be granting its own exception inside the very file under test. The label is read from the event payload
like `acceptance-waived`, so apply it **before** pushing or close and reopen the PR; re-running a finished job
reuses the old payload. Agents must not apply it.

### Rollout cutoff

The gate does not apply retroactively. The repository variable `ACCEPTANCE_ENFORCE_FROM_ISSUE` is an issue
number: only issues numbered at or above it owe a spec, and a PR that closes older issues is reported as
`grandfathered`. **Unset (or not a number) means nothing is enforced**, so the gate can be merged before it is
switched on. To switch it on, set the variable to the first issue number opened after the convention was
announced.

| Path | What |
|---|---|
| `acceptance/README.md` | The convention in one page, plus the shape of a spec |
| `.github/scripts/acceptance-spec.mjs` | The local runner's pure decisions: spec validation, assertions, verdict |
| `.github/scripts/acceptance-runner.mjs` | Local CLI to execute specs and update ci-feedback.json. Not used by CI any more; `acceptance/2172` still exercises it |
| `.github/scripts/acceptance-{spec,runner}.test.mjs` | Offline unit tests (loopback HTTP server, temp dirs) |
| `.github/workflows/ci.yml` job `acceptance-convention` | The convention gate: calls acceptance-spec's `convention.yml` (pinned SHA, `mode: enforce`, cutoff from `vars.ACCEPTANCE_ENFORCE_FROM_ISSUE`, Saiku's `waivable-paths`). Guarded by `ci-wiring.test.mjs` |
| `.github/scripts/acceptance-caller.test.mjs` | Guards `acceptance.yml`: the pinned SHA, `mode: enforce`, the check names, the trust model |
| `.github/workflows/acceptance.yml` | Two thin callers of acceptance-spec's `run-specs.yml` and `base-check.yml` (pinned SHA) plus the Saiku settings: Maven build of the launcher, loopback FoodMart start, REST paths, demo login |
| `spiculedata/acceptance-spec` `scripts/acceptance-base-check.mjs` | The red-on-base, green-on-head decision and its tests (removed from this repository) |

## What is still local

- **The local runner** (`acceptance-runner.mjs`, `acceptance-spec.mjs`, their tests). CI does not use them. They
  stay because `acceptance/2172/check.mjs` imports them and asserts the `ci-feedback.json` `acceptance` key, which
  the shared workflows do not write. The convention logic (closing keywords, cutoff, waiver) was removed from
  `acceptance-spec.mjs` when the gate moved: it lives in acceptance-spec's `scripts/acceptance-check.mjs`.
- **The waiver list**, passed to `convention.yml` as `waivable-paths` in `ci.yml` (it replaces the shared built-in
  list, which also waives any `e2e/` or `test/` directory). Saiku waives only `docs/`, `*.md`,
  `.github/ISSUE_TEMPLATE/`, `src/test/`, `__tests__/`, `saiku-ui/e2e/`, `tests/`, `*.test.*` / `*.spec.*` and
  `*.e2e.*`. `.md` was matched case-insensitively before; the shared list takes no regex flags, so it is spelled
  `\.[mM][dD]$`. `ci-wiring.test.mjs` pins both what is waivable and what is not (`saiku-core/e2e/`, `test/`).
- **The cutoff** is still the repository variable `ACCEPTANCE_ENFORCE_FROM_ISSUE` (`2181`), passed as the
  `enforce-from-issue` input.
- One cosmetic difference from the former local script: the closing hint line now points at acceptance-spec's
  `docs/spec-format.md` instead of this repository's docs. The error lines and exit status are identical.

The base launcher cache works since the pin `380780e` (spiculedata/acceptance-spec#4: the cache path was
`base/./acceptance-launcher.jar`, which `actions/cache` rejects, so nothing was saved). On the second push to a
spec-changing PR `acceptance / specs on base` logs a cache hit and skips the base Maven build.

## Bumping acceptance-spec

`acceptance.yml` calls two workflows of `spiculedata/acceptance-spec` and `ci.yml` calls a third (`convention.yml`), all
pinned to the same **full 40-character commit SHA** of that repository's `main` (never a branch or a tag;
`acceptance-caller.test.mjs` and `ci-wiring.test.mjs` fail otherwise). Current pin: `380780e255019826deb3901987f4004a454a7659`.
To bump:

1. Read what changed: `git log <old>..<new> -- scripts .github/workflows` in a checkout of acceptance-spec, and its
   `README.md` ("Migrating from saiku's copy", inputs, trust model).
2. Replace the SHA in the `uses:` lines of `.github/workflows/acceptance.yml` (two) and `.github/workflows/ci.yml` (one) and
   in "Current pin" above (one find-and-replace over `.github/workflows` and this file).
3. Open a PR. A spec-changing PR exercises all four called jobs; check that `acceptance / acceptance specs`,
   `acceptance / detect changed specs`, `acceptance / specs on base`, `acceptance / spec fails on base` and
   `acceptance / specs` all exist and pass, and so does `ci / acceptance convention`, since other things key on
   those names (the hive label watcher reads `acceptance / specs`; `ci-feedback.mjs` keys on `ci / acceptance convention`).

The called jobs' names are part of acceptance-spec's interface. If a bump renames one, either change the caller or
update every reference listed in the PR.

## Spec format

```jsonc
{
  "issue": 818,           // must equal the directory name
  "title": "one line",    // what a worker reads first
  "kind": "api",          // "api" | "ui"
  "auth": "session",      // optional, api only: "none" (default) | "session" | "basic"
  "basePath": "/rest/saiku/api",   // optional; this is the default
  "criteria": [ { "id": "C1", "given": "...", "then": "..." } ],
  "steps": [ /* api */ ] // or "command": [ /* ui, argv */ ]
}
```

### `kind: "api"`

```jsonc
{
  "name": "the cube list names Sales",
  "criterion": "C1",                 // which criterion this step proves
  "auth": "none",                    // optional per-step override of the spec's "auth"
  "request": {
    "method": "GET",
    "path": "/ai/cubes",             // under basePath; "/rest/..." is used as-is; or an absolute URL on the same origin
    "headers": { "x-example": "{{env.ACCEPTANCE_USER}}" },
    "json": { "any": "request body" }
  },
  "repeat": { "count": 90, "untilStatus": 429 },   // optional
  "expect": { /* see below */ }
}
```

`repeat` drives the same request until `untilStatus` (bounded at 500 attempts) and asserts on the last response
(for example to spend a rate-limit budget).

### Authentication

Saiku's REST surface under `/rest/saiku/*` is session based. The credentials come only from the environment
(`ACCEPTANCE_USER`, `ACCEPTANCE_PASSWORD` in CI, where the shared runner executes the specs; the local runner script still reads `SAIKU_ACCEPTANCE_USER` / `SAIKU_ACCEPTANCE_PASSWORD`, so never put either name in a spec as `{{env.NAME}}` unless it is the CI one); a spec says only *how* to use them. In CI they are
the public demo login (`admin` / `admin`, the same pair the demo deploy smoke test uses), because the target
on a PR is the PR's own launcher on loopback inside the runner (`SAIKU_DEMO=true`) and there is nothing to keep secret. To aim
acceptance at a private instance, replace the two literals under `secrets:` in `acceptance.yml` with repository
**secrets** (withheld from fork PRs); never variables, which are not masked in logs.

| `auth` | What the runner does |
|---|---|
| `none` (default) | Sends nothing. For anonymous endpoints (`/rest/saiku/info`) and to prove an endpoint refuses an anonymous caller. |
| `session` | Once per spec, `POST /rest/saiku/session` with `username` / `password` (form encoded; the endpoint is exempt from CSRF). It keeps `JSESSIONID` and `XSRF-TOKEN`, sends the cookies on later steps, and echoes `XSRF-TOKEN` as `X-XSRF-TOKEN` on non-safe methods, as the SPA does. |
| `basic` | `Authorization: Basic ...` on each request. Stateless, so no CSRF token is needed. |

If the credentials are not in the environment the spec is `not-run` ("credentials not configured"), never a pass
and never a product failure. A login the server **refuses** fails the spec (once: the refusal is remembered so
the login rate limiter is not hammered). Redirects are never followed and cookies or credentials are only ever
sent to the base URL's origin.

### `kind: "ui"`

```jsonc
{ "command": ["npx", "playwright", "test", "--config", "playwright.config.ts"] }
```

Run as argv (**never** a shell string; a metacharacter is a validation error) in the spec's own directory, with
`ACCEPTANCE_BASE_URL` set when a base URL is configured (the shared runner in CI does not set `SAIKU_BASE_URL`; the local runner sets both). The exit code is the verdict. A
command spec needs no base URL at all, which is how `acceptance/2172` checks CI tooling.

### `expect`

| Key | Meaning |
|---|---|
| `status` | `200` or `[200, 204]` |
| `header` | `{ "name": "Retry-After", ...assertion }`, name matched case-insensitively |
| `bodyContains` | Substring of the raw body |
| `json` | Object keyed by json path (`data[0].value`, `measures.unit sales.description`; `$` is the whole document), one assertion each |

One assertion operator per path: `equals`, `contains` (substring, or membership in an array), `matches`
(regular expression), `isNull`, `exists`, `type` (`string`/`number`/`boolean`/`object`/`array`/`null`), `length`.
Add `because` for a message that says why. A path that does not resolve fails the assertion; it is never silently
absent.

Secrets never live in a spec: write `{{env.NAME}}`. An unresolved placeholder is passed through as it is, which
makes the request wrong and the step red, rather than quietly empty.

## Verdict, and what is not a pass

`pass` / `fail` / `not-run`. **A spec that could not run is never a pass**: no base URL, an unreadable or invalid
spec, missing credentials and a UI command that could not start are all `not-run` with a reason recorded. A run
in which every spec is `not-run` has the verdict `not-run`.

## Configuration

| What | Where | Effect when unset |
|---|---|---|
| `ACCEPTANCE_ENFORCE_FROM_ISSUE` | repository **variable** | Nothing is enforced (every closing PR is reported `grandfathered`). See *Rollout cutoff*. |
| `ACCEPTANCE_BASE_URL` | repository **variable** | Unused now (it was read only by the removed manual `target: deployed` run). Pull requests always run against their own build. |
| `ACCEPTANCE_USER`, `ACCEPTANCE_PASSWORD` | `secrets:` of the two calls in `acceptance.yml` | The shared workflows' names for the login. `acceptance.yml` passes the public demo pair `admin` / `admin` as literals (the launcher is the PR's own, on loopback, `SAIKU_DEMO=true`), so GitHub masks the word "admin" in these logs. In specs and `{{env.NAME}}` placeholders the names are `ACCEPTANCE_USER` / `ACCEPTANCE_PASSWORD`, not `SAIKU_ACCEPTANCE_*`. To aim acceptance at a private instance, pass repository **secrets** there; never variables, which are not masked in logs. |
| `GH_PACKAGES_TOKEN` | repository **secret** | Passed as `BUILD_TOKEN` to build the launcher. Empty on fork PRs: no build, api specs `not-run`. |
| `acceptance-waived` | repository **label** | The waiver cannot be applied until the label exists. |
| `spec-already-green` | repository **label** | The escape hatch for `acceptance / spec fails on base` cannot be applied until the label exists; without it a base-green spec just fails. |

Use a **low-privilege** account on a disposable or demo instance. The runner executes specs written in the PR
under test, so a same-repository PR author can reach whatever that account can.

## Trust model of `acceptance.yml`

The specs are authored in the PR under test and the runner executes them, so the workflow is deliberately small:
`pull_request` (never `pull_request_target`), `contents: read`, and no secret other than the Maven token and the
public demo login. The shared workflows fetch their scripts from acceptance-spec at exactly the pinned SHA
(`job.workflow_sha`), verify the checkout, and move them out of the workspace before the PR's build runs.
GitHub passes secrets to same-repository PRs only, so a fork PR runs with none and its login-dependent specs
record `not-run`. The spec commands run with an allow-listed environment (`PATH`, `HOME`, the target URL and the
`ACCEPTANCE_*` variables), not the runner's; `GITHUB_TOKEN` is not among them. Api specs
may only address the base URL's origin (a PR-authored absolute URL to another host would carry interpolated
credentials with it). Guard tests (`acceptance-caller.test.mjs`, `acceptance-runner.test.mjs`) fail if `acceptance.yml` gains `pull_request_target` or `workflow_run`, reads
the acceptance credentials from `vars.`, takes a write scope or touches `GITHUB_TOKEN`. Do not widen either
without a security review.

## The worked examples

`acceptance/866/spec.json` — `HEAD /rest/saiku/info` must answer 200 within the runner timeout (the bug was a
30-second hang followed by a connection reset) and `GET /rest/saiku/info` must be an anonymous JSON array.

`acceptance/818/spec.json` — with a session login, `GET /rest/saiku/api/ai/cubes` lists the FoodMart `Sales`
cube, `GET /rest/saiku/api/ai/schema/foodmart/FoodMart/FoodMart/Sales` returns measures that carry a
`description` and `synonyms` (the semantic annotations of #818), and an anonymous caller is refused with 401. It
assumes the default seeded FoodMart connection name `foodmart`.

Both pass against a fresh 4.8.0 launcher (`SAIKU_ALLOW_DEFAULT_ADMIN=true java -jar saiku-<version>.jar serve`
with `admin` / `admin`).

`acceptance/2172/spec.json` is the third, different kind: its subject is CI tooling, so it is a `ui`-style
**command** spec (`check.mjs`) that exercises the convention itself: a closing PR with no spec is held, the
waiver and the shipped spec pass, the runner logs in with a session against a stub, and a failed spec reads as
`status: "failed"` in `ci-feedback.json` at an unchanged `schemaVersion`.

## ci-feedback.json

The local runner (`acceptance-runner.mjs run --feedback`, `attach`) can still add an optional `acceptance` key to a
`ci-feedback.json`; the CI run no longer does (see [What is still local](#what-is-still-local)). The key looks like:

```jsonc
"acceptance": {
  "verdict": "fail",
  "baseUrl": "https://acceptance.example.com",
  "specs": [ { "issue": 818, "kind": "api", "verdict": "fail", "failedChecks": ["..."] } ]
}
```

A failing acceptance verdict also sets the document's `status` to `failed` and adds a `failingChecks` /
`failures` entry with a one-line repro. `schemaVersion` stays 1: adding an optional field is not a breaking
change ([`docs/ci-feedback.md`](ci-feedback.md)), and `.github/ci-feedback.schema.json` is the authority.

## Running them locally

```bash
# the convention, as CI decides it (acceptance-spec's copy; pass Saiku's waivable-paths from ci.yml to try a waiver)
PR_BODY="Closes #2172" PR_LABELS="" ACCEPTANCE_ENFORCE_FROM_ISSUE=1 node <acceptance-spec>/scripts/acceptance-check.mjs

# the specs against anything with a base URL (the local runner; CI uses acceptance-spec's copy)
SAIKU_ACCEPTANCE_USER=admin SAIKU_ACCEPTANCE_PASSWORD=admin \
  node .github/scripts/acceptance-runner.mjs run --all --base-url http://localhost:8080 \
  --out /tmp/acceptance-results.json --feedback /tmp/ci-feedback.json

# the same with the shared runner CI uses (a checkout of spiculedata/acceptance-spec at the pinned SHA)
ACCEPTANCE_USER=admin ACCEPTANCE_PASSWORD=admin ACCEPTANCE_SESSION_PATH=/rest/saiku/session \
  ACCEPTANCE_BASE_PATH=/rest/saiku/api \
  node <acceptance-spec>/scripts/acceptance-runner.mjs run --all --base-url http://localhost:8080

# the red-on-base proof: acceptance-spec's scripts/acceptance-base-check.mjs (see its README)

# the tooling's own tests (also `ci / flake-policy tests`)
node --test ".github/scripts/acceptance-spec.test.mjs" ".github/scripts/acceptance-runner.test.mjs" ".github/scripts/acceptance-caller.test.mjs" ".github/scripts/ci-wiring.test.mjs"
```

## Provenance

Ported from `spiculedata/saiku-cloud` (`acceptance-spec.mjs`, `acceptance-check.mjs`, `acceptance-runner.mjs`
and tests, `docs/acceptance-specs.md`, `acceptance/README.md`, `acceptance.yml`, the `acceptance-convention`
job of its `ci.yml`). The hardening added there after review is kept: the rollout cutoff, the verified waiver,
the allow-listed spec environment, the same-origin restriction for api specs, and the guard test on
`acceptance.yml`. Differences:

- Relative paths resolve under `/rest/saiku/api`; `auth` (`session` / `basic`) and `basePath` are new, as is
  `$` for the whole JSON document.
- The credentials are `SAIKU_ACCEPTANCE_USER` / `SAIKU_ACCEPTANCE_PASSWORD`, both secrets (the original used one
  API key). Missing credentials make a spec `not-run`.
- Redirects are never followed; a refused login is remembered.
- The changed-file list is split on newlines only (a comma is legal in a file name).
- The waiver's "tests" now include `saiku-ui/e2e/`.
- The convention job runs for pull requests only (a push has no PR body) and is inside `ci.yml`'s rollup.
- No preview/validation coupling.
- The convention gate, the running of specs and the red-on-base proof were later extracted into `spiculedata/acceptance-spec` and
  are called from `acceptance.yml` at a pinned SHA (see [Bumping acceptance-spec](#bumping-acceptance-spec)).
