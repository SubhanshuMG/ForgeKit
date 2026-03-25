---
title: CLI Reference
description: Complete reference for all ForgeKit CLI commands and options.
---

# CLI Reference

ForgeKit CLI (`forgekit`) provides commands for scaffolding projects, AI-assisted setup, project health scoring, dependency auditing, deployment, environment management, docs generation, plugin management, and more.

All commands work with both the global install (`forgekit`) and via npx (`npx forgekit-cli`). Examples in this reference use `forgekit` for brevity; prepend `npx forgekit-cli` if you are not using a global install.

## Global Options

These options are available on the top-level `forgekit` command:

| Option | Description |
|--------|-------------|
| `-v, --version` | Print the current version and exit |
| `--no-plugins` | Skip loading plugins |
| `--help` | Show help for any command |

---

## `forgekit new [name]`

Scaffold a new project from a template.

```bash
forgekit new [name] [options]
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `name` | No | Project name. If omitted, you will be prompted interactively. Must contain only alphanumeric characters, hyphens, and underscores. |

### Options

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--template <id>` | `-t` | string | None | Template ID to use. Skips the interactive template selection prompt. See `forgekit list` for all valid IDs. |
| `--dir <path>` | `-d` | string | `.` (current directory) | Parent directory where the project folder is created. |
| `--skip-install` | | boolean | `false` | Skip the post-scaffold install step (`npm install` or `pip install -r requirements.txt`). Useful in CI or offline environments. |
| `--dry-run` | | boolean | `false` | Show what files would be created without writing anything. |
| `--ai <description>` | | string | None | Use AI to select the best template for your project description. See [AI Scaffolding](/features/ai-scaffolding). |

### Examples

Interactive scaffold (prompts for name and template):

```bash
forgekit new
```

Scaffold with a name, interactive template selection:

```bash
forgekit new my-app
```

Scaffold with both name and template specified (no prompts):

```bash
forgekit new my-app --template web-app
```

AI-powered scaffolding:

```bash
forgekit new --ai "REST API with PostgreSQL and JWT auth"
```

Preview what would be created:

```bash
forgekit new my-app --template web-app --dry-run
```

Scaffold into a specific parent directory:

```bash
forgekit new my-api --template api-service --dir ~/projects
```

Scaffold without running the install step:

```bash
forgekit new my-app --template web-app --skip-install
```

Using npx:

```bash
npx forgekit-cli new my-app --template next-app
```

### What happens

1. The project name is validated and sanitized. Invalid characters are rejected with a clear error.
2. The output path is checked; if a directory with that name already exists, the command exits with an error.
3. Template files are copied to the output directory. Files with the `.hbs` extension are processed as Handlebars templates: <span v-pre>`{{name}}`</span> tokens are replaced with your project name.
4. Unless `--skip-install` is passed, the post-scaffold hook runs automatically:
   - `web-app`, `next-app`, `serverless`: runs `npm install`
   - `api-service`, `ml-pipeline`: runs `pip install -r requirements.txt`
   - `go-api`: no install hook (Go modules are fetched on first build)
5. The CLI prints a numbered list of next steps specific to the template.

### Exit codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Error: invalid arguments, template not found, or directory already exists |

---

## `forgekit health`

Calculate a gamified 0–100 project health score. See [Health Score](/features/health-score) for full details.

```bash
forgekit health [options]
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--path <dir>` | string | `.` | Project directory to analyze |
| `--json` | boolean | `false` | Output raw JSON |

---

## `forgekit audit`

Audit dependencies for security vulnerabilities and outdated packages. See [Dependency Audit](/features/dependency-audit) for full details.

```bash
forgekit audit [options]
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--path <dir>` | string | `.` | Project directory to audit |
| `--json` | boolean | `false` | Output raw JSON |

---

## `forgekit deploy`

Auto-detect your stack and deploy to a hosting provider. See [Deploy](/features/deploy) for full details.

```bash
forgekit deploy [options]
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--provider <name>` | string | Auto-detected | Force provider: `vercel`, `railway`, `fly` |
| `--production` | boolean | `false` | Deploy to production |
| `--dry-run` | boolean | `false` | Show what would happen |

---

## `forgekit env <subcommand>`

Encrypted environment variable management. See [Env Sync](/features/env-sync) for full details.

```bash
forgekit env <push|pull|list|diff> [args]
```

### Subcommands

| Subcommand | Description |
|------------|-------------|
| `push [env]` | Encrypt and store the current `.env` |
| `pull [env]` | Decrypt and restore a stored `.env` |
| `list` | List stored environments |
| `diff <env1> <env2>` | Compare two environments |

---

## `forgekit docs generate`

Auto-generate README from your codebase. See [Docs Generation](/features/docs-generation) for full details.

```bash
forgekit docs generate [options]
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--path <dir>` | string | `.` | Project directory |
| `--output <file>` | string | `README.md` | Output file |
| `--force` | boolean | `false` | Overwrite without prompting |
| `--stdout` | boolean | `false` | Print to stdout |

---

## `forgekit plugin <subcommand>`

Manage plugins. See [Plugin System](/features/plugin-system) for full details.

```bash
forgekit plugin <add|remove|list> [args]
```

### Subcommands

| Subcommand | Description |
|------------|-------------|
| `add <name>` | Install a plugin from npm |
| `remove <name>` | Uninstall a plugin |
| `list` | List installed plugins |

---

## `forgekit publish`

Validate and prepare a template for the community registry. See [Template Marketplace](/features/template-marketplace) for full details.

```bash
forgekit publish
```

---

## `forgekit search [query]`

Search the template marketplace. See [Template Marketplace](/features/template-marketplace) for full details.

```bash
forgekit search [query] [options]
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--community` | boolean | `false` | Include community templates |
| `--sort <field>` | string | `relevance` | Sort by: `relevance`, `name`, `downloads` |
| `--tag <tag>` | string | None | Filter by stack tag |

---

## `forgekit list`

List all available templates.

```bash
forgekit list
```

### Example output

```
  Available Templates

  web-app          Web App (Node + React)
                   Full-stack web application with Node.js backend and React frontend
                   Stack: node, react, typescript, express, vite

  api-service      API Service (Python + FastAPI)
                   REST API service with FastAPI, PostgreSQL, and Docker
                   Stack: python, fastapi, postgresql, docker, pydantic

  ml-pipeline      ML Pipeline (Python + Jupyter)
                   Machine learning workflow with Python, Jupyter, MLflow, and reproducible experiments
                   Stack: python, jupyter, mlflow, scikit-learn, pandas

  next-app         Next.js App
                   Full-stack web app with Next.js, TypeScript, and Tailwind CSS
                   Stack: nextjs, react, typescript, tailwind, node

  go-api           Go API
                   REST API with Go, Gin framework, and PostgreSQL
                   Stack: go, gin, postgresql, docker

  serverless       Serverless
                   AWS Lambda functions with TypeScript and Serverless Framework
                   Stack: serverless, aws, lambda, typescript, node
```

If you have custom templates configured via `FORGEKIT_TEMPLATE_DIR`, they appear alongside the built-in templates.

---

## `forgekit info <template>`

Show detailed information about a specific template.

```bash
forgekit info <template>
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `template` | Yes | Template ID (e.g., `web-app`, `api-service`, `ml-pipeline`, `next-app`, `go-api`, `serverless`). |

### Examples

```bash
forgekit info web-app
forgekit info go-api
forgekit info serverless
```

---

## `forgekit doctor`

Check system prerequisites and verify your environment is ready to use ForgeKit.

```bash
forgekit doctor [options]
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--project` | boolean | `false` | Also run project-level health checks |

### System checks performed

| Tool | Required | Minimum Version | Notes |
|------|----------|----------------|-------|
| Node.js | Yes | 18.0.0 | Required for the CLI and all Node-based templates |
| npm | Yes | 8.0.0 | Required for dependency installation |
| Python 3 | Yes | Any 3.x | Required for `api-service` and `ml-pipeline` templates |
| pip | Yes | Any version | Required for Python template installs |
| Docker | Optional | Any version | Required only for `docker-compose` usage |
| Git | Yes | Any version | Required for version control setup |

### Project checks (with `--project`)

When `--project` is passed, additional checks scan the current directory:

- `.gitignore` exists
- Lockfile present (`package-lock.json`, `yarn.lock`, etc.)
- `README.md` exists
- `LICENSE` file exists
- Test directory or test files present
- CI configuration found
- Dockerfile present
- `.env.example` exists
- No outdated dependencies

### Example output

```
  ForgeKit Doctor

  ✔ Node.js v20.11.0
  ✔ npm v10.2.4
  ✔ Python 3 3.11.7
  ✔ pip 23.3.2
  ○ Docker not found (optional)
  ✔ Git 2.43.0

  5 checks passed, 0 failed
```

Optional checks that fail are shown with a hollow circle (`○`) instead of a cross. They do not cause a non-zero exit code.

---

## `forgekit telemetry <subcommand>`

Manage anonymous usage telemetry.

```bash
forgekit telemetry <enable|disable|status>
```

Telemetry is **disabled by default**. When enabled, ForgeKit sends anonymous usage data (which commands are run, which templates are used) to help prioritize improvements. No personally identifiable information, project names, file contents, or system details are ever sent.

### Subcommands

| Subcommand | Description |
|------------|-------------|
| `enable` | Enable anonymous telemetry |
| `disable` | Disable anonymous telemetry |
| `status` | Show whether telemetry is currently enabled or disabled |

### Examples

```bash
forgekit telemetry status
forgekit telemetry enable
forgekit telemetry disable
```

::: tip Telemetry in CI
Telemetry is automatically disabled when the `CI` environment variable is set (standard in GitHub Actions, CircleCI, and most CI providers). You do not need to configure anything for CI pipelines.
:::

::: tip Environment variable override
Set `FORGEKIT_NO_TELEMETRY=1` to disable telemetry without modifying the config file. This takes precedence over the `enable` subcommand.
:::

See [Configuration](/configuration) for environment variable overrides and config file details.
