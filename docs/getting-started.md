---
title: Quick Start
description: Scaffold your first ForgeKit project in under 60 seconds.
---

# Quick Start

This guide walks you through creating your first project with ForgeKit. You will have a running application in under 60 seconds.

<DemoVideo :inline="true" />

## Prerequisites

Before you begin, make sure you have the following installed:

| Tool | Minimum Version | Notes |
|------|----------------|-------|
| Node.js | 18.0.0 | Required for the CLI and web-app template |
| npm | 8.0.0 | Comes with Node.js |
| Python 3 | 3.11+ | Required for api-service and ml-pipeline templates |
| Git | Any recent version | Required for version control setup |
| Docker | Any recent version | Optional, needed to run docker-compose |

Not sure what you have installed? Run the doctor command:

```bash
npx forgekit-cli doctor
```

## Scaffold Your First Project

Run the following command to start an interactive scaffold:

```bash
npx forgekit-cli new my-app
```

::: tip No global install needed
`npx` downloads and runs the CLI automatically. You do not need to install ForgeKit globally to get started.
:::

### Interactive Prompts

When you run `forgekit new`, the CLI walks you through two prompts:

**1. Project name**

If you did not pass a name as an argument, you will be prompted:

```
? Project name: my-app
```

**2. Template selection**

Choose from the available templates using your arrow keys:

```
? Choose a template:
  Web App (Node + React)      Full-stack web application with Node.js backend and React frontend
  API Service (Python + FastAPI)  REST API service with FastAPI, PostgreSQL, and Docker
  ML Pipeline (Python + Jupyter)  Machine learning workflow with Python, Jupyter, MLflow, and reproducible experiments
```

After you select a template, ForgeKit scaffolds the project and runs the post-scaffold install step automatically.

## What Gets Created

For the `web-app` template, your project directory looks like this:

```
my-app/
  package.json
  tsconfig.json
  README.md
  .gitignore
  .env.example
  Dockerfile
  docker-compose.yml
  src/
    server/
      index.ts
      routes/
        health.ts
    client/
      index.html
      main.tsx
      App.tsx
      App.css
```

Every file is real and runnable. Nothing is left as a placeholder.

## Run Your Project

After scaffolding completes, start your application:

```bash
cd my-app
npm install   # if you used --skip-install
npm run dev
```

Your app will be running at `http://localhost:3000`.

::: info Dependencies
If you did not pass `--skip-install`, npm install runs automatically during scaffolding. You can go straight to `npm run dev`.
:::

## AI-Powered Scaffolding

Don't know which template to use? Let AI decide:

```bash
npx forgekit-cli new --ai "REST API with PostgreSQL and JWT auth"
```

ForgeKit sends your description to an AI provider (OpenAI or Anthropic), which recommends the best template and project name. You review and confirm before scaffolding. See [AI Scaffolding](/features/ai-scaffolding) for setup.

## Next Steps

- Learn about all available [templates](/templates/)
- Try [AI scaffolding](/features/ai-scaffolding) — describe your project in plain English
- Check your [project health score](/features/health-score) — `forgekit health`
- [Audit dependencies](/features/dependency-audit) — `forgekit audit`
- [Deploy](/features/deploy) with one command — `forgekit deploy`
- See the full [CLI reference](/cli-reference) for all 13 commands
- Read the [configuration guide](/configuration) to customize ForgeKit's behavior
