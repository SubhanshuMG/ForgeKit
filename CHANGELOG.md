# Changelog

All notable changes to ForgeKit will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
ForgeKit uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- CLI core engine (`@forgekit/cli`)
- `forgekit new` — interactive project scaffolding
- `forgekit list` — list available templates
- `forgekit info <template>` — show template details
- Template: `web-app` (Node.js + React + TypeScript)
- Template: `api-service` (Python + FastAPI + PostgreSQL)
- Template: `ml-pipeline` (Python + Jupyter + MLflow)
- Path containment security sandbox for template file writes
- DCO enforcement on all PRs
- GitHub Actions CI (lint, type-check, test, smoke test)
- Automated secret scanning with gitleaks
- Governance files: Apache 2.0, DCO, TRADEMARK, CODE_OF_CONDUCT, SECURITY

### Security
- Template hook command allowlist (prevents arbitrary code execution)
- Directory traversal protection in file writer
- npm audit in CI pipeline
