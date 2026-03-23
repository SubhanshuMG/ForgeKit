---
title: Contributing
description: How to contribute to ForgeKit, including local setup, testing, and the PR checklist.
---

# Contributing

ForgeKit is built by engineers, for engineers. Contributions are welcome and encouraged. This page covers the practical steps to get set up and make your first contribution.

For the full contribution guidelines including code style, issue labels, and legal requirements, see [CONTRIBUTING.md](https://github.com/SubhanshuMG/ForgeKit/blob/main/CONTRIBUTING.md) in the repository root.

## Before You Start

Read these files in the repo:

- `README.md`: what ForgeKit is and what it solves
- `.claude/CLAUDE.md`: product principles and engineering standards
- `.claude/architecture.md`: how the system is structured

## Developer Certificate of Origin (DCO)

ForgeKit uses the [DCO](https://developercertificate.org) instead of a CLA. Sign every commit with the `-s` flag:

```bash
git commit -s -m "feat: add my contribution"
```

This adds a `Signed-off-by` line to your commit. PRs without DCO sign-offs will not be merged.

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/SubhanshuMG/ForgeKit.git
cd ForgeKit
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Build the CLI package

```bash
npm run build --workspace=packages/cli
```

### 4. Run the CLI locally

```bash
node packages/cli/dist/index.js --version
```

Or link it globally for easier testing:

```bash
npm link --workspace=packages/cli
forgekit --version
```

## Running Tests

```bash
npm test --workspace=packages/cli
```

All tests must pass before opening a PR.

## Contribution Workflow

1. Open an issue first for anything non-trivial
2. Get alignment from a maintainer on your approach
3. Fork the repo and create a descriptive branch: `feat/add-django-template`, `fix/cli-path-escape`
4. Build and test locally
5. Open a focused PR that references the issue it closes
6. Address review feedback promptly

## Adding a New Template

Templates live in `templates/` and are registered in `templates/registry.json`.

**Steps to add a template:**

1. Create a new directory under `templates/` with your template ID as the directory name (e.g., `templates/django-app/`)
2. Add all template files. Use `.hbs` extension for files that need variable substitution (e.g., `README.md.hbs`, `package.json.hbs`)
3. Add a <span v-pre>`{{name}}`</span> token anywhere the project name should appear
4. Register the template in `templates/registry.json` following the existing schema:

```json
{
  "id": "django-app",
  "name": "Django App",
  "description": "Django web application with PostgreSQL",
  "stack": ["python", "django", "postgresql"],
  "version": "1.0.0",
  "author": "Your Name",
  "files": [
    { "src": "requirements.txt", "dest": "requirements.txt" },
    { "src": "README.md.hbs", "dest": "README.md" }
  ],
  "hooks": [
    { "type": "post-scaffold", "command": "pip", "args": ["install", "-r", "requirements.txt"] }
  ],
  "variables": [
    { "name": "name", "prompt": "Project name", "type": "string", "default": "my-django-app" }
  ]
}
```

5. Test your template end to end:

```bash
node packages/cli/dist/index.js new test-project --template django-app --skip-install
```

6. Include the template in a PR with a description of the stack and use case

::: warning Security review required for templates
Templates are executed on the user's machine. All new templates receive a security review before merge. Ensure no hooks execute untrusted code and no files contain secrets or credentials.
:::

## PR Checklist

Before opening a PR, verify:

- [ ] Code is scoped and readable
- [ ] Tests are added or updated for meaningful logic
- [ ] Documentation is updated if behavior changed
- [ ] Security implications are considered
- [ ] No secrets, tokens, or credentials are introduced
- [ ] All commits are signed off (`git commit -s`)
- [ ] CI passes locally (`npm test --workspace=packages/cli`)

## Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add Django REST framework template
fix: resolve path traversal in template writer
docs: update CLI reference for list command
chore: upgrade TypeScript to 5.4
```

## Getting Help

Open a [GitHub Discussion](https://github.com/SubhanshuMG/ForgeKit/discussions) with questions or ideas. Maintainers read everything.
