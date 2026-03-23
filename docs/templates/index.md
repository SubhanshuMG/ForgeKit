---
title: Templates
description: Overview of all six production-ready templates available in ForgeKit, with a decision guide for choosing the right one.
---

# Templates

ForgeKit ships with six production-ready templates. Each template is fully wired with the right stack, Docker support, CI/CD, tests, and environment configuration from the first scaffold. Nothing is a placeholder; every file runs on day one.

<TemplateGrid />

## Available Templates

| Template | Stack | Language | Use Case |
|----------|-------|----------|----------|
| [`web-app`](#web-app) | Node.js + React + TypeScript + Express + Vite | TypeScript | Full-stack web application |
| [`api-service`](#api-service) | Python + FastAPI + PostgreSQL + SQLAlchemy 2.0 | Python | REST API service |
| [`ml-pipeline`](#ml-pipeline) | Python + Jupyter + MLflow + scikit-learn | Python | Machine learning workflow |
| [`next-app`](#next-app) | Next.js + TypeScript + Tailwind CSS | TypeScript | Full-stack Next.js application |
| [`go-api`](#go-api) | Go + Gin + PostgreSQL + Docker | Go | High-performance REST API |
| [`serverless`](#serverless) | TypeScript + AWS Lambda + Serverless Framework | TypeScript | Serverless functions |

---

## Which template should I choose?

Use this decision guide to pick the right starting point.

### I want to build a web app with a UI

- **I need React and a Node.js API in one repo** → use `web-app`
- **I want Next.js with Tailwind CSS and server-side rendering** → use `next-app`

### I want to build a backend API

- **I'm a Python developer and need a REST API with a database** → use `api-service`
- **I want high performance and am comfortable with Go** → use `go-api`
- **I want functions that run in the cloud without managing servers** → use `serverless`

### I want to do machine learning

- **I need reproducible experiments, Jupyter notebooks, and MLflow tracking** → use `ml-pipeline`

### I'm not sure

Run the interactive wizard and it will prompt you:

```bash
npx forgekit-cli new
```

---

## What every template includes

- `Dockerfile` for building a production container image
- `docker-compose.yml` for local development
- `.env.example` with documented environment variables
- `.gitignore` configured for the stack
- `README.md` with project-specific setup instructions
- A health check endpoint
- Tests for core functionality
- GitHub Actions CI workflow

---

## Template details

### web-app

Full-stack web application with a React 18 frontend (Vite + TypeScript) and an Express 4 backend.

**Best for:** Projects that need both a UI and an API in one repository.

**Quick start:**

```bash
npx forgekit-cli new my-app --template web-app
cd my-app
npm run dev
```

Frontend runs at `http://localhost:5173`. Backend runs at `http://localhost:3000`.

[Full web-app documentation →](/templates/web-app)

---

### api-service

Production-ready REST API with FastAPI, SQLAlchemy 2.0 ORM, Alembic migrations, Pydantic v2 validation, and a PostgreSQL database.

**Best for:** Python developers building standalone REST APIs consumed by other services or frontends.

**Quick start:**

```bash
npx forgekit-cli new my-api --template api-service
cd my-api
docker-compose up --build
```

API runs at `http://localhost:8000`. Auto-generated docs at `http://localhost:8000/docs`.

[Full api-service documentation →](/templates/api-service)

---

### ml-pipeline

Reproducible machine learning workflow with a structured source layout (data loading, feature engineering, training, evaluation), MLflow experiment tracking, Jupyter Lab, and a Makefile for common tasks.

**Best for:** Data scientists and ML engineers who need a structured, reproducible project from day one.

**Quick start:**

```bash
npx forgekit-cli new my-ml-pipeline --template ml-pipeline
cd my-ml-pipeline
pip install -r requirements.txt
make train
```

MLflow UI runs at `http://localhost:5000` when you start it with `mlflow ui`.

[Full ml-pipeline documentation →](/templates/ml-pipeline)

---

### next-app

Full-stack Next.js application with the App Router, TypeScript, Tailwind CSS, and a built-in health API route. Includes Docker support for production deployments.

**Best for:** Teams who prefer the Next.js full-stack model with server components and Tailwind for styling.

**Quick start:**

```bash
npx forgekit-cli new my-next-app --template next-app
cd my-next-app
npm run dev
```

App runs at `http://localhost:3000`.

---

### go-api

High-performance REST API built with Go and the Gin framework. Includes PostgreSQL integration, a Makefile for common Go tasks, and Docker support.

**Best for:** Engineers who want Go's performance and concurrency for a backend API.

**Prerequisites:** Go 1.21 or higher must be installed (`go version`).

**Quick start:**

```bash
npx forgekit-cli new my-go-api --template go-api
cd my-go-api
docker-compose up --build
```

API runs at `http://localhost:8080`.

---

### serverless

AWS Lambda functions written in TypeScript, managed with the Serverless Framework. Includes a health check handler, a sample function, and tests.

**Best for:** Teams deploying event-driven workloads or APIs to AWS Lambda without managing infrastructure.

**Prerequisites:** An AWS account and AWS credentials configured locally for deployment.

**Quick start:**

```bash
npx forgekit-cli new my-functions --template serverless
cd my-functions
npm run dev   # Local invocation via Serverless offline
```

---

## Template Pages

- [Web App](/templates/web-app)
- [API Service](/templates/api-service)
- [ML Pipeline](/templates/ml-pipeline)

::: info next-app, go-api, and serverless detail pages
Dedicated detail pages for these templates are coming. In the meantime, scaffold one locally and read the generated `README.md`, which has full setup and usage instructions for your project.
:::
