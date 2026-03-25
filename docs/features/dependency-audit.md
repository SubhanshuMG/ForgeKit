---
title: Dependency Audit
description: Security vulnerability scanning and outdated package reports.
---

# Dependency Audit

ForgeKit audits your project's dependencies for known security vulnerabilities and outdated packages, producing a color-coded report with a trackable security score.

## Usage

```bash
forgekit audit
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--path <dir>` | string | `.` | Project directory to audit |
| `--json` | boolean | `false` | Output raw JSON instead of formatted display |

### Examples

```bash
forgekit audit
forgekit audit --path ~/projects/my-api
forgekit audit --json
```

## What It Does

1. **Detects your package manager** by checking for `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json` in priority order
2. **Runs security audit** via `npm audit --json` to find known vulnerabilities
3. **Checks for outdated packages** via `npm outdated --json` and classifies updates as major, minor, or patch
4. **Calculates a security score** starting at 100, deducting points for vulnerabilities and outdated packages

## Vulnerability Severity

Vulnerabilities are displayed with color-coded severity:

| Severity | Display | Score Deduction |
|----------|---------|-----------------|
| Critical | **Bold red** | High |
| High | Red | Medium |
| Moderate | Yellow | Low |
| Low | Dim | Minimal |

## Outdated Packages

Packages are grouped by update type:

| Type | Meaning |
|------|---------|
| **Major** | Breaking changes possible (e.g., 2.x → 3.x) |
| **Minor** | New features, backward compatible (e.g., 2.1 → 2.2) |
| **Patch** | Bug fixes only (e.g., 2.1.0 → 2.1.1) |

## Example Output

```
  Dependency Audit

  Vulnerabilities:
  ┌──────────┬────────────┬──────────┬─────────────────────────┐
  │ Severity │ Package    │ Version  │ Advisory                │
  ├──────────┼────────────┼──────────┼─────────────────────────┤
  │ high     │ lodash     │ 4.17.20  │ Prototype Pollution     │
  │ moderate │ axios      │ 0.21.1   │ Server-Side Request...  │
  └──────────┴────────────┴──────────┴─────────────────────────┘

  Outdated Packages:
  Major: express (4.18.2 → 5.0.0)
  Minor: typescript (5.3.3 → 5.4.2)
  Patch: jest (29.7.0 → 29.7.1)

  Security Score: 72/100
```

## JSON Output

Use `--json` for CI integration:

```bash
forgekit audit --json | jq '.score'
```
