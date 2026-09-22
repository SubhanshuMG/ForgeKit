# Changelog

All notable changes to ForgeKit will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
ForgeKit uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

> **Note:** the `Added` section, and any item marked *(v0.1.0)*, describes the original
> v0.1.0 release and has not been revised since. ForgeKit has shipped 11 tags through
> `v0.5.1` with no per-release sections in this file; `v0.1.0`–`v0.5.1` still need
> backfilling from the git tags. Everything else below is genuinely unreleased.

### Added
- CLI core engine (`@forgekit/cli`)
- `forgekit new`, interactive project scaffolding
- `forgekit list`, list available templates
- `forgekit info <template>`, show template details
- Template: `web-app` (Node.js + React + TypeScript)
- Template: `api-service` (Python + FastAPI + PostgreSQL)
- Template: `ml-pipeline` (Python + Jupyter + MLflow)
- Path containment security sandbox for template file writes
- DCO enforcement on all PRs
- GitHub Actions CI (lint, type-check, test, smoke test)
- Automated secret scanning with gitleaks
- Governance files: Apache 2.0, DCO, TRADEMARK, CODE_OF_CONDUCT, SECURITY

### Changed
- **Coverage floors raised** from 38% lines / 33% functions / 30% branches to 85 / 84 / 80 / 85,
  with a statements floor added. Actual coverage is 87.78% lines and 83.29% branches, so the
  old gate would have allowed a ~50-point regression. The 80% branch floor is load-bearing:
  it backs the OpenSSF Best Practices `dynamic_analysis` criterion, which accepts an automated
  test suite with at least 80% branch coverage.
- **Docs deploys now flag degraded coverage.** The docs workflow keeps deploying when tests
  fail, by design, but jest writes coverage reports for failing runs too — so real-looking
  percentages were published with no signal. Failures now raise a warning annotation and a
  job-summary note. The deploy itself is unchanged.

### Removed
- **`packages/web`.** Untouched since 2026-03-22, not lint/test/built/deployed by any
  workflow, and it did not compile. It also held every remaining audit finding. `ROADMAP.md`
  had listed it under Milestone 1 "Delivered"; it is now tracked under Milestone 2, where the
  web dashboard belongs.

### Fixed
- **Version drift across five declarations.** `forgekit --version` reported `0.5.1` while
  telemetry events, audit-log entries, and the outbound HTTP User-Agent all reported
  `0.4.0`, and the root manifest reported `0.4.2`. The audit log mattered most: its
  `forgeKitVersion` field is what ties an entry to a release. `package.json` is now the
  single source of truth, read via `src/version.ts`.
- **Root `npm run build` and `npm test` were broken.** Build exited 2 with seven `TS6133`
  errors; `npm test` hung indefinitely, because `@forgekit/web`'s test script was a bare
  `vitest` (watch mode). Both were the first commands a new contributor would run.
- **The stale bot was closing the contributor backlog.** `exempt-issue-labels` did not
  cover `good first issue`, `help wanted` or `enhancement`, so all 21 curated onboarding
  issues were auto-closed after 60 days of inactivity, leaving nothing for a newcomer to
  pick up. Those labels are now exempt and the issues are reopened.
- **Two required status checks on `main` could never pass.** Branch protection required
  contexts named `Smoke Test` and `DCO`, but the workflows report `Smoke Test (scaffold runs)`
  and `DCO Sign-off Check`, so every pull request stayed permanently blocked. Contexts
  corrected.

### Security
- **`handlebars` 4.7.8 → 4.7.9.** 4.7.8 is affected by critical advisories for JavaScript
  injection via AST type confusion and prototype pollution through partial template
  injection. This was reachable, not theoretical: `forgekit new --template github:owner/repo`
  downloads a third-party template and renders it through `Handlebars.compile()`, so a
  malicious community template could execute arbitrary JavaScript in the user's Node
  process at scaffold time.
- Dependency audit reduced from **17 findings (2 critical, 8 high, 6 moderate, 1 low) to 0**,
  via non-breaking lockfile bumps and the removal of `packages/web`.
- Template hook command allowlist (prevents arbitrary code execution) *(v0.1.0)*
- Directory traversal protection in file writer *(v0.1.0)*
- npm audit in CI pipeline *(v0.1.0)*
