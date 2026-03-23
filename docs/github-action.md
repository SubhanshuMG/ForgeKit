---
title: GitHub Action
description: Use ForgeKit Scaffold to scaffold production-ready projects inside your GitHub Actions workflows.
---

# GitHub Action

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-ForgeKit%20Scaffold-blue?logo=github)](https://github.com/marketplace/actions/forgekit-scaffold)
[![CI](https://github.com/SubhanshuMG/forgekit-action/actions/workflows/ci.yml/badge.svg)](https://github.com/SubhanshuMG/forgekit-action/actions/workflows/ci.yml)

The **ForgeKit Scaffold** action lets you scaffold production-ready projects inside your GitHub Actions workflows. One step gives you a fully wired project with the right stack, Dockerfile, CI/CD, tests, and environment config.

## Usage

```yaml
- uses: SubhanshuMG/forgekit-action@v1
  with:
    template: web-app
    name: my-app
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `template` | Template ID to scaffold | Yes | |
| `name` | Project name | Yes | |
| `output-dir` | Directory to scaffold into, relative to workspace root | No | `.` |
| `skip-install` | Skip `npm install` or `pip install` after scaffolding | No | `false` |
| `version` | Version of `forgekit-cli` to use | No | `latest` |

## Outputs

| Output | Description |
|--------|-------------|
| `project-path` | Absolute path to the scaffolded project |

## Examples

### Scaffold and test

```yaml
name: Scaffold and test

on: [push]

jobs:
  scaffold:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Scaffold project
        id: forge
        uses: SubhanshuMG/forgekit-action@v1
        with:
          template: web-app
          name: my-app
          skip-install: 'false'

      - name: Run tests
        working-directory: ${{ steps.forge.outputs.project-path }}
        run: |
          npm install
          npm test
```

### Scaffold into a subdirectory

```yaml
- uses: SubhanshuMG/forgekit-action@v1
  with:
    template: go-api
    name: backend
    output-dir: services
```

### Matrix scaffold across templates

```yaml
strategy:
  matrix:
    template: [web-app, api-service, next-app]

steps:
  - uses: SubhanshuMG/forgekit-action@v1
    with:
      template: ${{ matrix.template }}
      name: test-${{ matrix.template }}
      skip-install: 'true'
```

## Templates

All [ForgeKit templates](/templates/) are supported:

| Template | Stack |
|----------|-------|
| `web-app` | Node.js + React + TypeScript + Express |
| `api-service` | Python + FastAPI + PostgreSQL |
| `ml-pipeline` | Python + Jupyter + MLflow |
| `next-app` | Next.js + TypeScript + Tailwind CSS |
| `go-api` | Go + Gin + PostgreSQL |
| `serverless` | TypeScript + AWS Lambda |

## Source

[github.com/SubhanshuMG/forgekit-action](https://github.com/SubhanshuMG/forgekit-action)
