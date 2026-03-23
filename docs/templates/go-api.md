---
title: Go API Template
description: High-performance REST API built with Go, Gin, PostgreSQL, and Docker.
---

# Go API Template

**ID:** `go-api`

A high-performance REST API built with Go and the Gin framework. Includes PostgreSQL integration via `database/sql`, a Makefile for common Go tasks, and Docker support.

## Prerequisites

Go 1.21 or higher must be installed. Check with:

```bash
go version
```

## What's Included

```
my-go-api/
  go.mod                  # Go module definition
  go.sum                  # Dependency checksums
  Makefile                # Common tasks: build, test, lint, run
  README.md               # Project-specific setup guide
  .gitignore
  .env.example            # Documented environment variables
  Dockerfile              # Production container image
  docker-compose.yml      # Local development stack with PostgreSQL
  cmd/
    server/
      main.go             # Application entry point
  internal/
    handler/
      health.go           # GET /health handler
    router/
      router.go           # Gin router setup
    db/
      db.go               # Database connection
```

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Language | Go | 1.21+ |
| HTTP framework | Gin | Latest |
| Database | PostgreSQL | 14+ |
| Container | Docker | Any |

## Usage

Scaffold a new Go API project:

```bash
npx forgekit-cli new my-go-api --template go-api
```

Or use the interactive wizard:

```bash
npx forgekit-cli new
```

## Running After Scaffold

**With Docker (recommended):**

```bash
cd my-go-api
docker-compose up --build
```

API runs at `http://localhost:8080`.

**Without Docker:**

```bash
cd my-go-api
cp .env.example .env   # configure DATABASE_URL
make run
```

## Makefile Targets

| Target | Description |
|--------|-------------|
| `make run` | Run the server locally |
| `make build` | Compile the binary to `./bin/server` |
| `make test` | Run the test suite |
| `make lint` | Run `golangci-lint` |
| `make tidy` | Run `go mod tidy` |

## Health Check

```
GET /health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-03-22T10:00:00.000Z"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port the server listens on | `8080` |
| `DATABASE_URL` | PostgreSQL connection string | See `.env.example` |
| `GIN_MODE` | Gin mode: `debug` or `release` | `debug` |

## Customization Tips

**Add a new endpoint:**
Create a handler function in `internal/handler/`, define the route in `internal/router/router.go`, and write a corresponding test.

**Add database migrations:**
Use `golang-migrate` or `goose`. Add migration files to a `migrations/` directory and wire the migration step into `main.go`.

**Deploy to production:**
Set `GIN_MODE=release` and `DATABASE_URL` in your deployment environment. The `Dockerfile` uses a multi-stage build to produce a minimal final image.
