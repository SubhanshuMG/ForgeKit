---
title: FAQ
description: Frequently asked questions about ForgeKit: installation, templates, CI/CD, custom templates, and more.
---

# FAQ

Frequently asked questions about ForgeKit.

---

## General

### What is ForgeKit?

ForgeKit is a CLI tool that scaffolds production-ready projects in seconds. One command gives you a fully wired project with the right stack, Dockerfile, CI/CD pipeline, and environment config already set up. Nothing is left as a placeholder; every file is real and runnable from the first scaffold.

### Is ForgeKit free?

Yes. ForgeKit is open-source software licensed under the Apache License 2.0. It is free to use, modify, and distribute.

### What license do I get when I use ForgeKit?

ForgeKit itself is Apache 2.0 licensed. The projects you scaffold with ForgeKit are yours; they carry no ForgeKit license. You own everything that gets generated.

### What stacks does ForgeKit support?

Six templates are currently available:

| Template ID | Stack | Use Case |
|-------------|-------|----------|
| `web-app` | Node.js + React + TypeScript + Express + Vite | Full-stack web application |
| `api-service` | Python + FastAPI + PostgreSQL + SQLAlchemy | REST API service |
| `ml-pipeline` | Python + Jupyter + MLflow + scikit-learn | Machine learning workflow |
| `next-app` | Next.js + TypeScript + Tailwind CSS | Full-stack Next.js application |
| `go-api` | Go + Gin + PostgreSQL + Docker | High-performance REST API |
| `serverless` | TypeScript + AWS Lambda + Serverless Framework | Serverless functions |

See the [Templates](/templates/) page for details on each.

### Does ForgeKit work on Windows?

ForgeKit requires Node.js 18+ and works on macOS, Linux, and Windows via WSL2 or Git Bash. Native Windows Command Prompt (`cmd.exe`) and PowerShell are not officially tested. WSL2 is the recommended path for Windows users and provides the best experience.

### Do I need Docker?

No. Docker is optional. Every template includes a `Dockerfile` and `docker-compose.yml` for convenience, but scaffolding and running projects locally works without Docker installed. Docker is only needed if you want to use `docker-compose up` to run the full stack in containers.

---

## Installation

### What are the minimum requirements?

| Requirement | Minimum Version | Required For |
|-------------|----------------|--------------|
| Node.js | 18.0.0 | CLI and all Node templates |
| npm | 8.0.0 | All templates |
| Python 3 | 3.9+ | `api-service` and `ml-pipeline` templates |
| Go | 1.21+ | `go-api` template |
| Git | Any recent version | Version control setup |
| Docker | Any version | Running docker-compose locally (optional) |

Run `npx forgekit-cli doctor` to check your environment against all requirements.

### Do I need to install ForgeKit globally?

No. You can use `npx` to run ForgeKit without any permanent installation:

```bash
npx forgekit-cli new my-app --template web-app
```

If you prefer a persistent global install so you can type `forgekit` directly:

```bash
npm install -g forgekit-cli
forgekit new my-app --template web-app
```

### I get an `EACCES: permission denied` error when installing globally. How do I fix it?

This is an npm permissions issue. Do not use `sudo`, as it creates security problems and causes further permission errors. Fix it properly:

```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

Add the `export` line to your `~/.bashrc` or `~/.zshrc` to make it permanent. Then re-run `npm install -g forgekit-cli`.

Alternatively, use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js; it handles permissions automatically and is generally the better long-term choice.

### What Node.js version should I use?

Node.js 18 is the minimum. Node.js 20 (current LTS) is recommended. ForgeKit's own CI matrix tests against Node 18 and Node 20. Node 22 also works but is not part of the tested matrix.

To install or switch Node versions using nvm:

```bash
nvm install 20
nvm use 20
```

### What Python version do I need?

Python 3.9 or higher is required for the `api-service` and `ml-pipeline` templates. Python 3.11 is recommended. Python 2 is not supported.

Check your version:

```bash
python3 --version
```

If `python3` is not found, install it from [python.org](https://www.python.org) or via your system package manager (`brew install python3` on macOS, `sudo apt install python3` on Ubuntu).

---

## Scaffolding

### Can I scaffold without running npm install or pip install?

Yes. Use the `--skip-install` flag to copy the template files without running the post-scaffold install step:

```bash
npx forgekit-cli new my-app --template web-app --skip-install
```

This is useful in CI pipelines where you want to control the install step separately, or in offline environments.

### Can I scaffold into a specific directory?

Yes. Use the `--dir` flag:

```bash
npx forgekit-cli new my-app --template web-app --dir ~/projects
```

The project is created inside the specified directory.

### Can I use ForgeKit in an existing project?

Not currently. ForgeKit is designed to scaffold new projects from scratch. Support for adding templates to existing projects is on the roadmap.

### Can I use custom templates?

Yes. Point ForgeKit at a local directory containing your own templates using the `FORGEKIT_TEMPLATE_DIR` environment variable:

```bash
export FORGEKIT_TEMPLATE_DIR=/path/to/my-templates
forgekit list    # your templates appear alongside built-in ones
forgekit new my-project --template my-custom-template
```

Your template directory must follow the same structure as the built-in templates and be registered in a `registry.json` file inside that directory. See [Configuration](/configuration) for details and [Contributing](/contributing) for the full template format.

### How do I add Docker support to my scaffolded project?

Every ForgeKit template already includes a `Dockerfile` and `docker-compose.yml`. If you used `--skip-install`, Docker files are still present. To start your project with Docker:

```bash
docker-compose up --build
```

For the `web-app` template, the app runs on port 3000. For `api-service`, port 8000. Check the `docker-compose.yml` in your project for port mappings and environment variable requirements.

---

## CI/CD

### What CI/CD setup is included in the templates?

Every template includes a GitHub Actions workflow file (`.github/workflows/ci.yml`) that runs tests, linting, and build checks on every push and pull request. The workflow is matrix-tested across supported runtime versions and runs smoke tests to validate the scaffold.

### How do I set up the GIST_TOKEN and COVERAGE_GIST_ID secrets for coverage reporting?

ForgeKit's own CI publishes test coverage to a GitHub Gist and displays it on the [Coverage](/coverage) page. If you fork ForgeKit or want the same coverage reporting in your own project, you need two repository secrets:

**Step 1: Create a GitHub Personal Access Token**

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name (e.g., "ForgeKit Coverage Gist")
4. Check the `gist` scope only
5. Click "Generate token" and copy the value

**Step 2: Create a Gist**

1. Go to [gist.github.com](https://gist.github.com)
2. Create a new secret Gist with a filename like `coverage.json` and any placeholder content
3. Copy the Gist ID from the URL: `gist.github.com/<username>/<GIST_ID>`

**Step 3: Add secrets to your repository**

1. Go to your repository → Settings → Secrets and variables → Actions
2. Add `GIST_TOKEN` with the personal access token value
3. Add `COVERAGE_GIST_ID` with the Gist ID

The CI workflow will update the Gist with fresh coverage data on every push to `main`.

### Does telemetry run in CI?

No. ForgeKit detects the `CI` environment variable (set automatically by GitHub Actions, CircleCI, and most CI providers) and disables telemetry entirely. You do not need to configure anything.

---

## Templates

### Which template should I choose?

See the [Templates](/templates/) page for a detailed decision guide. Quick summary:

- Building a web app with a React UI and Node.js backend → `web-app`
- Building a Next.js app with Tailwind → `next-app`
- Building a Python REST API with a database → `api-service`
- Building a machine learning project → `ml-pipeline`
- Building a high-performance REST API in Go → `go-api`
- Building serverless functions on AWS → `serverless`

### How do templates work internally?

Templates are directories of files stored in `templates/<template-id>/`. Files with the `.hbs` extension are processed as Handlebars templates: tokens like `{{name}}` are replaced with your project name before the file is written. All other files are copied as-is.

The template metadata (ID, name, stack, file list, hooks) is declared in `templates/registry.json`.

### Where are the built-in templates stored?

Templates are bundled inside the `forgekit-cli` npm package under `dist/templates/`. The source is in the `templates/` directory of the [GitHub repository](https://github.com/SubhanshuMG/ForgeKit/tree/main/templates).

### How do I contribute my first template?

Contributing a template is one of the best ways to make your first contribution to ForgeKit. Here is the minimum path:

1. Read the [Contributing](/contributing) guide for the full template format
2. Create a directory `templates/<your-template-id>/` in your fork
3. Add template files (`.hbs` for files needing variable substitution)
4. Add a `{{name}}` token wherever the project name should appear
5. Register the template in `templates/registry.json`
6. Test it end-to-end: `node packages/cli/dist/index.js new test-project --template your-template-id`
7. Open a PR with a description of the stack and its intended use case

Templates receive a security review before merge to ensure no hooks execute untrusted code and no files contain secrets.

---

## Privacy and Telemetry

### Does ForgeKit collect data?

Telemetry is **off by default**. If you opt in, ForgeKit collects anonymous usage events: which commands are run, which templates are used, and whether the scaffold succeeded or failed. No personal data, file contents, project names, or identifiable information is ever collected.

Telemetry never runs in CI environments.

### How do I opt out of telemetry?

```bash
npx forgekit-cli telemetry disable
```

To check your current status:

```bash
npx forgekit-cli telemetry status
```

You can also set the environment variable `FORGEKIT_NO_TELEMETRY=1` to disable telemetry without modifying the config file. This is useful for scripted environments.

### Where is my config stored?

At `~/.forgekit/config.json`. You can inspect, edit, or delete this file at any time. If it is missing, ForgeKit falls back to safe defaults with telemetry disabled.

---

## Contributing

### How do I contribute?

Read [CONTRIBUTING.md](https://github.com/SubhanshuMG/ForgeKit/blob/main/CONTRIBUTING.md) for the full guide. All contributions require a DCO sign-off on every commit:

```bash
git commit -s -m "feat: my change"
```

### What license do my contributions fall under?

All contributions are licensed under Apache 2.0 by signing the DCO. You retain copyright of your contributions.

### How do I report a security vulnerability?

**Do not open a public GitHub issue for security vulnerabilities.** Use [GitHub Security Advisories](https://github.com/SubhanshuMG/ForgeKit/security/advisories/new) to report privately. See the [Security](/security) page for response timelines and what to include in your report.

---

## Still have a question?

Open a [GitHub Discussion](https://github.com/SubhanshumMG/ForgeKit/discussions); maintainers read everything.
