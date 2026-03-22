# Contributing to ForgeKit

Thank you for considering a contribution to ForgeKit. This project is built to be welcoming, practical, and high quality. Whether you're fixing a typo or building a new template, you're helping engineers everywhere ship faster.

---

## Before You Start

Read these first:
- [README.md](README.md), understand what ForgeKit is and what problem it solves
- [CLAUDE.md](.claude/CLAUDE.md), the product principles and engineering standards
- [architecture.md](.claude/architecture.md), how the system is structured

---

## Developer Certificate of Origin (DCO)

ForgeKit uses the **DCO** instead of a CLA. It's a lightweight way to certify that your contribution is yours to give.

By contributing, you certify:

> I wrote this code (or have the right to contribute it), and I'm making it available under the project's license.

To certify this, **sign off every commit** with the `-s` flag:

```bash
git commit -s -m "feat: add FastAPI template"
```

This adds a `Signed-off-by: Your Name <your@email.com>` line to your commit.

**PRs without DCO sign-offs will not be merged.**

Full text: [developercertificate.org](https://developercertificate.org)

---

## What You Can Contribute

| Type | Description |
|------|-------------|
| **Templates** | New project scaffolding templates (most wanted) |
| **Docs** | Improve setup guides, examples, architecture notes |
| **Bug fixes** | Fix broken behavior with a clear reproduction case |
| **Features** | New CLI commands or workflow capabilities |
| **Security** | See [SECURITY.md](SECURITY.md) for the private disclosure process |
| **Tests** | Add coverage for edge cases or untested paths |

### Good first issues
Start here if you're new: [`good first issue`](https://github.com/forgekit/forgekit/labels/good%20first%20issue) label.

---

## Contribution Workflow

1. **Open an issue first** for anything non-trivial, describe the problem and your intended solution
2. **Get alignment**, a maintainer will confirm the approach before you invest time building it
3. **Fork and branch**, use a descriptive branch name: `feat/add-django-template`, `fix/cli-path-escape`
4. **Build and test locally**, all tests must pass before opening a PR
5. **Open a focused PR**, one concern per PR; reference the issue it closes
6. **Pass CI**, all checks must be green; DCO sign-off required
7. **Address review feedback**, be responsive; stale PRs may be closed

---

## Pull Request Checklist

Before opening a PR, verify:

- [ ] Code is scoped and readable
- [ ] Tests added or updated for meaningful logic
- [ ] Documentation updated if behavior changed
- [ ] Security implications considered (see below)
- [ ] No secrets, tokens, or credentials introduced
- [ ] All commits are signed off (`git commit -s`)
- [ ] CI passes locally (`npm test` or equivalent)

---

## Security-Sensitive Changes

If your change touches any of the following, **document the risk, add validation, and flag it in the PR description**:

- Authentication or authorization
- File system operations (especially path handling)
- External API integrations
- Template execution hooks
- Secrets or environment variable handling
- Agent actions or automated workflows

Security issues should be reported **privately** via [GitHub Security Advisories](https://github.com/forgekit/forgekit/security/advisories/new), not as public issues.

---

## Issue Labels

| Label | Meaning |
|-------|---------|
| `good first issue` | Great starting point for new contributors |
| `help wanted` | Maintainers want community input |
| `area/backend` | CLI core, API, data layer |
| `area/frontend` | Web dashboard, terminal UX |
| `area/devops` | CI/CD, infrastructure, deployment |
| `area/security` | Security review or hardening |
| `area/docs` | Documentation improvements |
| `area/templates` | New or improved scaffolding templates |
| `area/ai` | AI workflow or assistant features |
| `bug` | Something is broken |
| `enhancement` | Improvement to existing functionality |
| `RFC` | Request for comments on a design decision |

---

## Code Style

- Prefer clear names over clever ones
- Keep functions and modules focused on a single responsibility
- Avoid duplicated logic
- Make failures obvious and actionable, errors should guide, not confuse
- Use sensible defaults; expose escape hatches for advanced use
- No dead code, no commented-out blocks

---

## Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add Django REST framework template
fix: resolve path traversal in template writer
docs: update CLI reference for list command
chore: upgrade TypeScript to 5.4
```

---

## By Contributing

By submitting a contribution, you agree that:
- Your contribution is licensed under the Apache License 2.0
- You certify the Developer Certificate of Origin (DCO)
- You are not introducing code that violates any third-party license or ownership

---

## Questions?

Open a [GitHub Discussion](https://github.com/forgekit/forgekit/discussions), we read everything.
