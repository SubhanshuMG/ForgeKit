# CLI Reference

Full reference for `@forgekit/cli`.

## Installation

```bash
# One-off usage (no install)
npx @forgekit/cli <command>

# Global install
npm install -g @forgekit/cli
forgekit <command>
```

## Commands

### `forgekit new [name]`

Scaffold a new project from a template.

```
Usage: forgekit new [name] [options]

Arguments:
  name              Project name (prompted if omitted)

Options:
  -t, --template <id>   Template ID (prompted if omitted)
  -d, --dir <path>      Output directory (default: current directory)
  --skip-install        Skip running npm/pip install after scaffold
  -h, --help            Show help
```

**Examples:**
```bash
forgekit new                              # fully interactive
forgekit new my-app                       # specify name, choose template interactively
forgekit new my-app --template web-app    # fully non-interactive
forgekit new my-api --template api-service --dir ~/projects
forgekit new my-app --template web-app --skip-install
```

**Exit codes:**
| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | User cancelled |
| 2 | Template not found |
| 3 | File write error |

---

### `forgekit list`

List all available templates.

```
Usage: forgekit list

Options:
  -h, --help   Show help
```

**Example output:**
```
  Available Templates

  web-app          Web App (Node + React)
                   Full-stack web application with Node.js backend and React frontend
                   Stack: node, react, typescript, express, vite

  api-service      API Service (Python + FastAPI)
                   REST API service with FastAPI, PostgreSQL, and Docker
                   Stack: python, fastapi, postgresql, docker

  ml-pipeline      ML Pipeline (Python + Jupyter)
                   Machine learning workflow with Python, Jupyter, MLflow
                   Stack: python, jupyter, mlflow
```

---

### `forgekit info <template>`

Show details about a specific template.

```
Usage: forgekit info <template>

Arguments:
  template    Template ID (see: forgekit list)
```

**Example:**
```bash
forgekit info web-app
```

---

### `forgekit --version`

Print the installed version.

```bash
forgekit --version
# 0.1.0
```

---

## Template IDs

| ID | Name | Stack |
|----|------|-------|
| `web-app` | Web App (Node + React) | Node.js, React, TypeScript, Express, Vite |
| `api-service` | API Service (Python + FastAPI) | Python, FastAPI, PostgreSQL, Docker |
| `ml-pipeline` | ML Pipeline (Python + Jupyter) | Python, Jupyter, MLflow, scikit-learn |
