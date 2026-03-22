---
title: CLI Reference
description: Complete reference for all ForgeKit CLI commands and options.
---

# CLI Reference

ForgeKit CLI (`forgekit`) provides commands for scaffolding projects, inspecting templates, checking system health, and managing settings.

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
| `name` | No | Project name. If omitted, you will be prompted interactively. |

### Options

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--template <id>` | `-t` | string | None | Template ID to use. Skips the interactive template selection prompt. |
| `--dir <path>` | `-d` | string | `.` | Output directory. The project is created inside this path. |
| `--skip-install` | | boolean | `false` | Skip running `npm install` or `pip install` after scaffolding. |

### Examples

Interactive scaffold (prompts for name and template):

```bash
forgekit new
```

Scaffold with a name, interactive template selection:

```bash
forgekit new my-app
```

Scaffold with both name and template specified:

```bash
forgekit new my-app --template web-app
```

Scaffold into a specific directory:

```bash
forgekit new my-api --template api-service --dir ~/projects
```

Scaffold without running the install step:

```bash
forgekit new my-app --template web-app --skip-install
```

### What Happens

1. The project name is validated and sanitized.
2. Template files are copied to the output directory, with <span v-pre>`{{name}}`</span> tokens replaced with your project name.
3. Unless `--skip-install` is passed, the post-scaffold hook runs automatically (`npm install` for `web-app`, `pip install -r requirements.txt` for Python templates).
4. The CLI prints a numbered list of next steps.

---

## `forgekit list`

List all available templates.

```bash
forgekit list
```

### Example Output

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
```

---

## `forgekit info <template>`

Show detailed information about a specific template.

```bash
forgekit info <template>
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `template` | Yes | Template ID (e.g., `web-app`, `api-service`, `ml-pipeline`). |

### Example

```bash
forgekit info web-app
```

### Example Output

```
  Web App (Node + React)

  ID:          web-app
  Description: Full-stack web application with Node.js backend and React frontend
  Stack:       node, react, typescript, express, vite
  Version:     1.0.0
  Files:       13 template files

  Variables:
    name: Project name (default: my-app)
```

If the template ID does not exist, the command exits with a non-zero code and prints an error message.

---

## `forgekit doctor`

Check system prerequisites and verify your environment is ready to use ForgeKit.

```bash
forgekit doctor
```

### Checks Performed

| Tool | Required | Minimum Version |
|------|----------|----------------|
| Node.js | Yes | 18.0.0 |
| npm | Yes | 8.0.0 |
| Python 3 | Yes | Any 3.x |
| pip | Yes | Any version |
| Docker | Optional | Any version |
| Git | Yes | Any version |

### Example Output

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

If any required checks fail, `forgekit doctor` exits with code `1`.

---

## `forgekit telemetry <subcommand>`

Manage anonymous usage telemetry.

```bash
forgekit telemetry <enable|disable|status>
```

Telemetry is **disabled by default**. When enabled, ForgeKit sends anonymous usage data (which commands are run and which templates are used) to help prioritize improvements. No personally identifiable information, project names, or file contents are ever sent.

### Subcommands

| Subcommand | Description |
|------------|-------------|
| `enable` | Enable anonymous telemetry |
| `disable` | Disable anonymous telemetry |
| `status` | Show whether telemetry is currently enabled or disabled |

### Examples

```bash
forgekit telemetry enable
forgekit telemetry disable
forgekit telemetry status
```

::: tip Telemetry in CI
Telemetry is automatically disabled when the `CI` environment variable is set. You do not need to configure anything for CI pipelines.
:::

See [Configuration](/configuration) for environment variable overrides.
