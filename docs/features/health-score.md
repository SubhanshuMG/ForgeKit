---
title: Project Health Score
description: Gamified 0-100 project health score across security, quality, testing, documentation, and DevOps.
---

# Project Health Score

ForgeKit can analyze any project directory and produce a gamified 0 to 100 health score across five categories with actionable suggestions.

## Usage

```bash
forgekit health
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--path <dir>` | string | `.` | Project directory to analyze |
| `--json` | boolean | `false` | Output raw JSON instead of formatted display |

### Examples

```bash
forgekit health
forgekit health --path ~/projects/my-api
forgekit health --json
```

## Score Breakdown

The health score is calculated across 5 weighted categories:

| Category | Weight | What's Checked |
|----------|--------|----------------|
| Security | 25% | .gitignore, lockfile, no exposed secrets, npm audit |
| Quality | 25% | Linter config, TypeScript, low TODO count, package.json fields, source structure |
| Testing | 20% | Test directory, test script, test config, test files exist |
| Documentation | 15% | README (length check), CONTRIBUTING, LICENSE, CHANGELOG |
| DevOps | 15% | CI config, Dockerfile, deploy config, .editorconfig |

## Grading Scale

| Grade | Score |
|-------|-------|
| A+ | 95–100 |
| A | 90–94 |
| A- | 85–89 |
| B+ | 80–84 |
| B | 75–79 |
| B- | 70–74 |
| C+ | 65–69 |
| C | 60–64 |
| F | Below 60 |

## Example Output

```
  Project Health Score: 82/100 (A-)

  ████████████████████░░░░░

  Security       ██████████ 92%
  Quality        ████████░░ 80%
  Testing        ███████░░░ 70%
  Docs           ████████░░ 85%
  DevOps         ████████░░ 80%

  Top suggestions:
  1. Add test configuration (jest.config, vitest.config, etc.)
  2. Add a CHANGELOG.md to track releases
  3. Add an .editorconfig for consistent formatting
```

## 21 Automated Checks

ForgeKit runs these checks automatically:

**Security:** .gitignore exists, lockfile present, no secrets in source, npm audit clean

**Quality:** Linter config (.eslintrc, etc.), TypeScript enabled, TODO count below threshold, package.json has description/license/repository, organized source directory

**Testing:** Test directory exists, test script in package.json, test config file, test files present

**Documentation:** README exists and has substance, CONTRIBUTING.md, LICENSE, CHANGELOG.md

**DevOps:** CI configuration (.github/workflows, etc.), Dockerfile, deploy config (vercel.json, fly.toml, etc.), .editorconfig

## JSON Output

Use `--json` for programmatic access:

```bash
forgekit health --json | jq '.score'
```

The JSON output includes the overall score, grade, per-category breakdown, and all individual check results with suggestions.
