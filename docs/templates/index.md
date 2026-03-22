---
title: Templates
description: Overview of all production-ready templates available in ForgeKit.
---

# Templates

ForgeKit ships with three production-ready templates. Each template is fully wired with the right stack, Docker support, CI/CD, and tests from the first scaffold.

## Available Templates

| Template | Stack | Use Case | Language |
|----------|-------|----------|----------|
| `web-app` | Node.js + React + TypeScript + Vite + Express | Full-stack web application | TypeScript |
| `api-service` | Python + FastAPI + PostgreSQL + SQLAlchemy | REST API service | Python |
| `ml-pipeline` | Python + Jupyter + MLflow + scikit-learn | Machine learning workflow | Python |

## Choosing a Template

**Use `web-app` if you are building:**
- A full-stack web application with a React frontend
- A TypeScript-first project
- An app that needs both a UI and an API in one repo

**Use `api-service` if you are building:**
- A standalone REST API
- A Python backend with a relational database
- A service that other apps will consume

**Use `ml-pipeline` if you are building:**
- A machine learning experiment or model
- A reproducible data science workflow
- A project that needs MLflow experiment tracking and Jupyter notebooks

## What Every Template Includes

- `Dockerfile` for building a production container image
- `docker-compose.yml` for local development
- `.env.example` with documented environment variables
- `.gitignore` configured for the stack
- `README.md` with project-specific setup instructions
- A health check endpoint
- Tests for core functionality
- GitHub Actions CI workflow

## Template Pages

- [Web App](/templates/web-app)
- [API Service](/templates/api-service)
- [ML Pipeline](/templates/ml-pipeline)
