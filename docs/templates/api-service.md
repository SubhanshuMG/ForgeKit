---
title: API Service Template
description: REST API service with Python, FastAPI, PostgreSQL, SQLAlchemy 2.0, and Docker.
---

# API Service Template

**ID:** `api-service`

A production-ready REST API template built with FastAPI and PostgreSQL. Includes SQLAlchemy 2.0 models, Alembic migrations, Pydantic validation, and a full Docker setup for local development.

## What's Included

```
my-api/
  requirements.txt          # Python dependencies
  README.md                 # Project-specific setup guide
  .gitignore
  .env.example              # Documented environment variables
  Dockerfile                # Production container image
  docker-compose.yml        # App + PostgreSQL for local dev
  main.py                   # FastAPI application entry point
  app/
    __init__.py
    config.py               # Settings loaded from environment
    database.py             # SQLAlchemy engine and session setup
    models.py               # ORM model definitions
    routes/
      health.py             # GET /health endpoint
  tests/
    __init__.py
    test_health.py          # Health endpoint test
```

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Language | Python | 3.11+ |
| Web framework | FastAPI | Latest |
| ORM | SQLAlchemy | 2.0 |
| Validation | Pydantic | v2 |
| Database | PostgreSQL | 15+ |
| Migrations | Alembic | Latest |
| Container | Docker | Any |

## Usage

Scaffold a new API service:

```bash
npx forgekit-cli new my-api --template api-service
```

Or run the interactive wizard:

```bash
npx forgekit-cli new
```

## Running Locally with docker-compose

The template includes a `docker-compose.yml` that starts both the API and a PostgreSQL database:

```bash
cd my-api
docker-compose up --build
```

Your API will be available at `http://localhost:8000`.

Interactive API documentation is served automatically at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Running Without Docker

If you prefer to run directly with Python:

```bash
cd my-api
pip install -r requirements.txt
# Set your DATABASE_URL in .env
uvicorn main:app --reload
```

## Health Check

The template includes a health endpoint:

```
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

## Environment Variables

Copy `.env.example` to `.env` and configure the following:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/mydb` |
| `APP_ENV` | Environment name (`development`, `production`) | `development` |
| `SECRET_KEY` | Secret key for signing | No default, must be set |

::: warning Set SECRET_KEY before deploying
The `SECRET_KEY` value must be set to a secure random string before running in any non-local environment. Never commit the `.env` file.
:::

## Customization Tips

**Add a new endpoint:**
Create a new file in `app/routes/`, define your router, and include it in `main.py` using `app.include_router()`.

**Add a new model:**
Define your model class in `app/models.py` using SQLAlchemy 2.0 mapped column syntax. Then create a migration with `alembic revision --autogenerate`.

**Add authentication:**
Add `python-jose` and `passlib` to `requirements.txt`. Implement a JWT dependency in `app/auth.py` and apply it as a FastAPI dependency to protected routes.
