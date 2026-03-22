---
title: Security
description: ForgeKit security design principles and how to report vulnerabilities.
---

# Security

[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/12234/badge)](https://www.bestpractices.dev/projects/12234)

Security is a first-class concern in ForgeKit. This page covers the security design principles built into the platform and the process for reporting vulnerabilities.

For the full security policy including response timelines and supported versions, see [SECURITY.md](https://github.com/SubhanshuMG/ForgeKit/blob/main/SECURITY.md) in the repository root.

## Automated Security Pipeline

Every push and pull request runs through a layered security pipeline automatically:

| Tool | What It Checks | When |
|------|---------------|------|
| **CodeQL** | Static analysis — injection, path traversal, insecure APIs | Every push + PR |
| **Gitleaks** | Hardcoded secrets, API keys, tokens in source and history | Every push + PR |
| **npm audit** | Known CVEs in direct and transitive dependencies (blocks at `high`) | Every push + PR |
| **DCO check** | Every commit is signed-off by its author | Every PR |
| **Integration tests** | End-to-end scaffold runs validate no regressions in core paths | Every PR |

Secrets scanning and static analysis run in parallel with tests so failures surface immediately and never block unrelated jobs silently.

## Reporting a Vulnerability

**Do not report security vulnerabilities as public GitHub issues.**

Use [GitHub Security Advisories](https://github.com/SubhanshuMG/ForgeKit/security/advisories/new) to submit a private report. This keeps the vulnerability confidential until a fix is available.

Include as much of the following as possible:

- **Description** — what the vulnerability is and where it exists
- **Steps to reproduce** — the minimal steps needed to trigger it
- **Impact** — what an attacker could achieve
- **Affected versions** — which versions are affected
- **Suggested fix** — optional but appreciated

### Response Timeline

| Action | Target |
|--------|--------|
| Acknowledge receipt | Within 48 hours |
| Confirm or dismiss | Within 7 days |
| Fix for critical issues | Within 30 days |
| Fix for high severity | Within 60 days |
| Coordinated disclosure | After fix is released |

## Security Design Principles

### Input Validation

All CLI arguments and template IDs are validated before use. Invalid input is rejected with a clear error message rather than silently proceeding with unexpected values.

### Path Containment

Scaffold operations are sandboxed to the target output directory. The file writer prevents path traversal sequences (`../`) in template file destinations. A template cannot write files outside the directory you specify.

### No Secrets in Templates

Template files are scanned for common credential patterns before they are accepted into the registry. Hardcoded passwords, API keys, and tokens are not permitted in any template.

### Least Privilege

The CLI requests only the permissions it needs. It does not make network requests during scaffolding (except for the post-scaffold install step, which runs `npm install` or `pip install` using the tools already on your system).

### Dependency Auditing

`npm audit` runs on every CI build. Dependencies with known high or critical vulnerabilities block the build.

### DCO Enforcement

All contributions are certified by contributors via the Developer Certificate of Origin. This provides a lightweight audit trail for every line of code that enters the repository.

## Security-Sensitive Areas

If you are contributing to ForgeKit, pay extra attention to security when touching these areas:

- File system operations, especially path handling in `packages/cli/src/core/file-writer.ts`
- Input sanitization in `packages/cli/src/core/security.ts`
- Template hook execution in `packages/cli/src/core/scaffold.ts`
- Config file reads and writes in `packages/cli/src/core/config.ts`
- Any new CLI options that accept file paths or external URLs

Document the security implications in your PR description when modifying these files.
