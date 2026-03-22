# ForgeKit

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![DCO](https://img.shields.io/badge/DCO-signed-green.svg)](https://developercertificate.org)
[![npm](https://img.shields.io/npm/v/forgekit-cli)](https://www.npmjs.com/package/forgekit-cli)

**The engineering acceleration platform for AI, DevOps, and full-stack teams.**

ForgeKit eliminates the setup friction that costs engineering teams days of work before they write a single line of product code. One command scaffolds a fully wired, production-ready project, with the right stack, infrastructure, and tooling already connected.

---

## Why ForgeKit?

Modern engineering teams waste too much time before they can ship:

- **Fragmented toolchains**, CI/CD, infrastructure, AI workflows, and frontend frameworks all need separate configuration
- **Slow Day-1 onboarding**, new projects and new teammates take hours to set up before they're productive
- **Reinventing the wheel**, the same scaffolding, Dockerfiles, and pipeline configs are written again and again
- **Burnout from maintenance**, keeping tooling up to date takes ~80% of platform team time
- **Poor documentation**, knowledge lives in people's heads, not the repo

ForgeKit solves all of this from a single CLI.

---

## Core Features

| Feature | Description |
|---------|-------------|
| **Project Scaffolding** | Scaffold any stack in seconds with `forgekit new` |
| **Template Library** | Production-ready templates for web apps, APIs, and ML pipelines |
| **AI-Assisted Workflows** | Built-in AI assistance for code generation, docs, and debugging |
| **DevOps Automation** | Pre-wired CI/CD, Dockerfiles, and infrastructure-as-code |
| **Observability** | Integrated logging, tracing, and health checks out of the box |
| **Docs Generation** | Auto-generate architecture diagrams and API references |

---

## Quick Start

```bash
# Scaffold a new project interactively
npx @forgekit/cli new

# Scaffold with a specific template
npx @forgekit/cli new my-app --template web-app

# List available templates
npx @forgekit/cli list
```

Your project will be ready to run in under 60 seconds.

---

## Templates

| Template | Stack | Use Case |
|----------|-------|----------|
| `web-app` | Node.js + React + TypeScript | Full-stack web application |
| `api-service` | Python + FastAPI + PostgreSQL | REST or GraphQL API service |
| `ml-pipeline` | Python + Jupyter + MLflow | Machine learning workflow |

More templates are coming. [Contribute a template →](docs/templates.md)

---

## Architecture

ForgeKit is built as a modular 5-layer system:

```
Interface Layer  →  CLI / Web Dashboard / API Client
Application Layer  →  Workflow Engine / Task Orchestration
Service Layer  →  Scaffolding / AI / DevOps / Observability modules
Data Layer  →  Config storage / Execution logs / State
Infrastructure Layer  →  CI/CD / Deployment / Monitoring
```

See [architecture.md](.claude/architecture.md) for the full design.

---

## Roadmap

ForgeKit is being built in focused milestones:

- **Milestone 1** *(current)*, CLI scaffolding engine + 3 starter templates
- **Milestone 2**, Web dashboard + AI-assisted workflows
- **Milestone 3**, Ephemeral dev environments (preview URLs per PR)
- **Milestone 4**, AI Knowledge Hub (codebase Q&A + plugin marketplace)

See [ROADMAP.md](.claude/ROADMAP.md) for full details.

---

## Contributing

ForgeKit is built by engineers, for engineers. Contributions are welcome and encouraged.

- Read [CONTRIBUTING.md](CONTRIBUTING.md) for how to get started
- Find a [good first issue](https://github.com/forgekit/forgekit/labels/good%20first%20issue)
- Open a [Discussion](https://github.com/forgekit/forgekit/discussions) with questions or ideas
- Report security issues privately via [GitHub Security Advisories](SECURITY.md)

---

## Community

- **GitHub Discussions**, questions, ideas, show-and-tell
- **Discord**, real-time collaboration *(link coming at launch)*
- **Changelog**, monthly updates on what shipped

---

## License & Trademark

ForgeKit is open-source software licensed under the [Apache License 2.0](LICENSE).

"ForgeKit" and the ForgeKit logo are trademarks of the ForgeKit project maintainers.
The Apache 2.0 license grants you rights to use, modify, and distribute the *code*.
It does **not** grant rights to use the ForgeKit name or logo in ways that imply
official endorsement or affiliation. See [TRADEMARK.md](TRADEMARK.md) for permitted uses.

Copyright 2026 ForgeKit Contributors.
