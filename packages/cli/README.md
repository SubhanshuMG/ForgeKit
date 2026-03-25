<h1><a href="https://forgekit.build"><img src="https://raw.githubusercontent.com/SubhanshuMG/ForgeKit/main/docs/public/logo.svg" alt="" width="36" height="36" valign="middle" /></a>&nbsp;ForgeKit CLI</h1>

**The engineering acceleration CLI for AI, DevOps, and full-stack teams.**

[![npm version](https://img.shields.io/npm/v/forgekit-cli?color=CB3837&logo=npm)](https://www.npmjs.com/package/forgekit-cli)
[![npm downloads](https://img.shields.io/npm/dm/forgekit-cli?label=downloads&color=CB3837&logo=npm)](https://www.npmjs.com/package/forgekit-cli)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/SubhanshuMG/ForgeKit/blob/main/LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docs](https://img.shields.io/badge/docs-forgekit.build-00d4ff.svg)](https://forgekit.build)

> **[Documentation](https://forgekit.build)** | **[Templates](https://forgekit.build/templates/)** | **[CLI Reference](https://forgekit.build/cli-reference)** | **[GitHub](https://github.com/SubhanshuMG/ForgeKit)**

---

ForgeKit eliminates the setup friction that costs engineering teams days of work before they write a single line of product code. One command scaffolds a fully wired, production-ready project with the right stack, infrastructure, and tooling already connected.

<p align="center">
  <img
    src="https://raw.githubusercontent.com/SubhanshuMG/ForgeKit/main/docs/public/demo.gif"
    alt="ForgeKit CLI demo"
    width="700"
  />
</p>

---

## Quick Start

```bash
# Interactive wizard with beautiful terminal UI
npx forgekit-cli new

# AI-powered: describe your project, AI picks the template
npx forgekit-cli new --ai "REST API with PostgreSQL and JWT auth"

# Direct scaffolding with a specific template
npx forgekit-cli new my-app --template web-app
```

Your project will be ready to run in under 60 seconds.

---

## Install

```bash
# Run directly (no install needed)
npx forgekit-cli <command>

# Or install globally
npm install -g forgekit-cli
```

**Requirements:** Node.js 18+

---

## Commands

| Command | Description |
|---------|-------------|
| `forgekit new [name]` | Scaffold a new project from a template |
| `forgekit new --ai "..."` | AI picks the best template for your description |
| `forgekit health` | Gamified 0-100 project health score |
| `forgekit audit` | Dependency vulnerability and outdated package scan |
| `forgekit deploy` | One-command deploy (Vercel, Railway, Fly) |
| `forgekit env push/pull` | Encrypted .env file sync across environments |
| `forgekit docs generate` | Auto-generate README from your codebase |
| `forgekit doctor` | Check system prerequisites and project health |
| `forgekit search [query]` | Search official and community templates |
| `forgekit plugin add/remove` | Extend ForgeKit with community plugins |
| `forgekit publish` | Validate and publish templates to the registry |

See the full [CLI Reference](https://forgekit.build/cli-reference) for all options and flags.

---

## Templates

| Template | Stack | Use Case |
|----------|-------|----------|
| `web-app` | Node.js + React + TypeScript + Express | Full-stack web application |
| `next-app` | Next.js + TypeScript + Tailwind CSS | Modern React with SSR |
| `api-service` | Python + FastAPI + PostgreSQL + Docker | REST API backend |
| `go-api` | Go + Gin + PostgreSQL + Docker | High-performance API |
| `ml-pipeline` | Python + Jupyter + MLflow + scikit-learn | ML experiment workflow |
| `serverless` | TypeScript + AWS Lambda | Event-driven serverless |

```bash
# List all available templates
forgekit search

# Scaffold with a specific template
forgekit new my-project --template go-api
```

---

## Features

**Project Scaffolding** - Beautiful interactive wizard to scaffold any stack in seconds. Wires up linting, testing, Docker, CI/CD, and documentation out of the box.

**AI Scaffolding** - Describe your project in plain English and let AI pick the best template. Supports OpenAI and Anthropic providers.

**Project Health Score** - Gamified 0-100 score across 5 categories: security, code quality, testing, documentation, and DevOps. 21 automated checks with actionable recommendations.

**Dependency Audit** - Scan for known vulnerabilities and outdated packages. Security severity scoring with upgrade recommendations.

**One-Command Deploy** - Auto-detects your stack and deploys to Vercel, Railway, or Fly.io. No manual config needed.

**Environment Sync** - AES-256-GCM encrypted .env file management. Push, pull, list, and diff across environments.

**Docs Generation** - Analyzes your project structure, dependencies, and scripts to generate a complete README.

**Plugin System** - Extend ForgeKit with community plugins. Sandboxed execution with permission controls.

**Template Marketplace** - Search, discover, and publish templates. Community-driven with validation and quality checks.

---

## Architecture

ForgeKit is built as a modular 5-layer system:

<p align="center">
  <img
    src="https://raw.githubusercontent.com/SubhanshuMG/ForgeKit/main/docs/public/forgekit_architecture.png"
    alt="ForgeKit Architecture"
    width="600"
  />
</p>

```
Interface Layer     CLI / Web Dashboard / API Client
Application Layer   Workflow Engine / Task Orchestration
Service Layer       Scaffolding / AI / DevOps / Observability modules
Data Layer          Config storage / Execution logs / State
Infrastructure      CI/CD / Deployment / Monitoring
```

---

## GitHub Action

Use ForgeKit inside your CI/CD workflows:

```yaml
- uses: SubhanshuMG/ForgeKit/action@v1
  with:
    template: web-app
    name: my-app
```

See the [Action documentation](https://github.com/SubhanshuMG/ForgeKit/tree/main/action) for full usage.

---

## Configuration

ForgeKit can be configured via `forgekit.config.json` in your project root or `~/.forgekit/config.json` globally.

```json
{
  "defaultTemplate": "web-app",
  "skipInstall": false,
  "ai": {
    "provider": "openai",
    "model": "gpt-4o"
  }
}
```

See [Configuration docs](https://forgekit.build/configuration) for all options.

---

## Community

- **[Documentation](https://forgekit.build)** - Full docs, guides, and API reference
- **[GitHub](https://github.com/SubhanshuMG/ForgeKit)** - Source code, issues, and discussions
- **[X/Twitter](https://x.com/forgekit_os)** - Follow [@forgekit_os](https://x.com/forgekit_os) for updates
- **[LinkedIn](https://www.linkedin.com/company/forgekit-build)** - Follow ForgeKit on LinkedIn
- **[Blog](https://blogs.subhanshumg.com/forgekit)** - Behind-the-scenes and feature deep dives

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](https://github.com/SubhanshuMG/ForgeKit/blob/main/CONTRIBUTING.md) for how to get started.

```bash
git clone https://github.com/SubhanshuMG/ForgeKit.git
cd ForgeKit
npm install
npm run build -w packages/cli
npm test -w packages/cli
```

---

## License

Apache License 2.0. See [LICENSE](https://github.com/SubhanshuMG/ForgeKit/blob/main/LICENSE) for details.

Copyright 2026 ForgeKit Contributors.
