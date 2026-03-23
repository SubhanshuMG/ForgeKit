---
title: CLI Reference
description: Complete reference for all ForgeKit CLI commands and options.
---

# CLI Reference

ForgeKit CLI (`forgekit`) provides commands for scaffolding projects, inspecting templates, checking system health, and managing telemetry settings.

All commands work with both the global install (`forgekit`) and via npx (`npx forgekit-cli`). Examples in this reference use `forgekit` for brevity — prepend `npx forgekit-cli` if you are not using a global install.

## Global Options

These options are available on the top-level `forgekit` command:

| Option | Description |
|--------|-------------|
| `-v, --version` | Print the current version and exit |
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

Using the short alias for `--template`:

```bash
forgekit new my-api -t api-service
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
2. The output path is checked — if a directory with that name already exists, the command exits with an error.
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
| `1` | Error — invalid arguments, template not found, or directory already exists |

---

## `forgekit list`

List all available templates.

```bash
forgekit list
```

### Options

None.

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

### Example output

```
  Web App (Node + React)

  ID:          web-app
  Description: Full-stack web application with Node.js backend and React frontend
  Stack:       node, react, typescript, express, vite
  Version:     1.0.0
  Files:       13 template files

  Variables:
    name: Project name (default: my-app)

  Hooks:
    post-scaffold: npm install
```

If the template ID does not exist, the command exits with code `1` and prints an error message listing valid template IDs.

---

## `forgekit doctor`

Check system prerequisites and verify your environment is ready to use ForgeKit.

```bash
forgekit doctor
```

### Options

None.

### Checks performed

| Tool | Required | Minimum Version | Notes |
|------|----------|----------------|-------|
| Node.js | Yes | 18.0.0 | Required for the CLI and all Node-based templates |
| npm | Yes | 8.0.0 | Required for dependency installation |
| Python 3 | Yes | Any 3.x | Required for `api-service` and `ml-pipeline` templates |
| pip | Yes | Any version | Required for Python template installs |
| Docker | Optional | Any version | Required only for `docker-compose` usage |
| Git | Yes | Any version | Required for version control setup |

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

If any **required** checks fail, `forgekit doctor` exits with code `1`. Include the full output when reporting issues.

---

## `forgekit telemetry <subcommand>`

Manage anonymous usage telemetry.

```bash
forgekit telemetry <enable|disable|status>
```

Telemetry is **disabled by default**. When enabled, ForgeKit sends anonymous usage data — which commands are run and which templates are used — to help prioritize improvements. No personally identifiable information, project names, file contents, or system details are ever sent.

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

### Example output for `status`

```
  Telemetry: disabled

  Run `forgekit telemetry enable` to opt in.
  No personal data is ever collected.
```

::: tip Telemetry in CI
Telemetry is automatically disabled when the `CI` environment variable is set (standard in GitHub Actions, CircleCI, and most CI providers). You do not need to configure anything for CI pipelines.
:::

::: tip Environment variable override
Set `FORGEKIT_NO_TELEMETRY=1` to disable telemetry without modifying the config file. This takes precedence over the `enable` subcommand.
:::

See [Configuration](/configuration) for environment variable overrides and config file details.
