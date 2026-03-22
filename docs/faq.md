# FAQ

Frequently asked questions about ForgeKit.

---

## General

### What is ForgeKit?

ForgeKit is a CLI tool that scaffolds production-ready projects in seconds. One command gives you a fully wired project with the right stack, Dockerfile, CI/CD pipeline, and environment config already set up.

### Is ForgeKit free?

Yes. ForgeKit is open-source software licensed under the Apache License 2.0. It is free to use, modify, and distribute.

### What stacks does ForgeKit support?

Currently three templates are available:

| Template | Stack |
|---|---|
| `web-app` | Node.js + React + TypeScript |
| `api-service` | Python + FastAPI + PostgreSQL |
| `ml-pipeline` | Python + Jupyter + MLflow |

More templates are being added. See the [Templates](/templates/) page.

### Does ForgeKit work on Windows?

ForgeKit requires Node.js 18+ and works on macOS, Linux, and Windows (via WSL2 or Git Bash). Native Windows (cmd.exe / PowerShell) is not currently tested.

### Do I need Docker?

No. Docker is optional. Templates include a `Dockerfile` and `docker-compose.yml` for convenience, but scaffolding works without Docker installed.

---

## Installation

### What are the requirements?

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Git (for version control of your scaffolded project)
- Python 3.9+ (for `api-service` and `ml-pipeline` templates)

Run `npx forgekit-cli doctor` to check your environment.

### Do I need to install ForgeKit globally?

No. You can use it directly with `npx`:
```bash
npx forgekit-cli new my-app --template web-app
```

If you prefer a global install:
```bash
npm install -g forgekit-cli
forgekit new my-app --template web-app
```

---

## Scaffolding

### Can I use ForgeKit in an existing project?

Not currently. ForgeKit is designed to scaffold new projects from scratch. Support for adding templates to existing projects is on the roadmap.

### Can I scaffold into a specific directory?

Yes, use the `--dir` flag:
```bash
npx forgekit-cli new my-app --template web-app --dir ~/projects
```

### Can I scaffold without running npm install?

Yes, use the `--skip-install` flag:
```bash
npx forgekit-cli new my-app --template web-app --skip-install
```

### Can I use my own custom templates?

Yes. Use the `github:` or `npm:` prefix:
```bash
# From a GitHub repo
npx forgekit-cli new my-app --template github:my-org/my-template

# From npm
npx forgekit-cli new my-app --template npm:my-forgekit-template
```

---

## Templates

### Can I contribute a template?

Yes! Template contributions are welcome. See [Contributing](/contributing) for how to submit a template PR.

### How do templates work?

Templates are directories of files with optional Handlebars (`.hbs`) variables. When you scaffold, ForgeKit substitutes variables like `{{projectName}}` with your input and copies the files to the output directory.

### Where are the templates stored?

Templates are bundled inside the `forgekit-cli` npm package under `dist/templates/`. The source is in the `templates/` directory of the GitHub repository.

---

## Privacy & Telemetry

### Does ForgeKit collect data?

ForgeKit collects anonymous, opt-in usage events (scaffold command, template used, success/failure). No personal data, file contents, or project names are collected.

Telemetry only runs if you opt in during first run, and only outside of CI environments.

### How do I opt out?

```bash
npx forgekit-cli telemetry disable
```

### Where is my config stored?

At `~/.forgekit/config.json`. You can inspect or delete it at any time.

---

## Contributing

### How do I contribute?

Read [CONTRIBUTING.md](https://github.com/SubhanshuMG/ForgeKit/blob/main/CONTRIBUTING.md) for the full guide. All contributions require a DCO sign-off:

```bash
git commit -s -m "feat: my change"
```

### What license do contributions fall under?

All contributions are licensed under Apache 2.0 by signing the DCO. You retain copyright of your contributions.

### How do I report a security vulnerability?

**Do not open a public issue.** Use [GitHub Security Advisories](https://github.com/SubhanshuMG/ForgeKit/security/advisories/new) to report privately.

---

## Still have a question?

Open a [GitHub Discussion](https://github.com/SubhanshuMG/ForgeKit/discussions) — we read everything.
