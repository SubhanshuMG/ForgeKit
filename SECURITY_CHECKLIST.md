# ForgeKit Security Checklist

Run this checklist before every release.

## Dependency Security
- [ ] `npm audit --audit-level=high` passes with no issues
- [ ] No dependencies with known critical CVEs
- [ ] All dependencies pinned in `package-lock.json`
- [ ] No unnecessary dependencies added

## Secret Scanning
- [ ] `gitleaks detect` passes on full repo
- [ ] No `.env` files with real secrets committed
- [ ] All `.env.example` files use placeholder values only
- [ ] No API keys, tokens, or passwords in template files

## Template Security
- [ ] All new template files reviewed for path traversal
- [ ] All template hook commands are in the allowlist
- [ ] No network calls in template files or hooks
- [ ] Handlebars templates use `{{variable}}` (escaped), not `{{{variable}}}` (unescaped) where user input is reflected

## CI/CD Security
- [ ] GitHub Actions permissions are minimal (contents: read where possible)
- [ ] `NPM_TOKEN` is stored in GitHub Secrets, not in code
- [ ] Release workflow only triggers on published releases (not on push)
- [ ] DCO check is enforced on all PRs

## Code Review
- [ ] All template changes have been reviewed by a maintainer
- [ ] `validatePathContainment()` covers all file write operations
- [ ] `validateHookCommand()` covers all hook executions
- [ ] No use of `eval()`, `exec()`, or `Function()` constructor

## Documentation
- [ ] SECURITY.md is accurate and up to date
- [ ] THREAT_MODEL.md reflects current architecture
- [ ] CHANGELOG.md includes security fixes under "Security" section
