---
title: Web App Template
description: Full-stack web application with Node.js, React 18, TypeScript, Vite, and Express.
---

# Web App Template

**ID:** `web-app`

A full-stack web application template with a React frontend and an Express backend, both written in TypeScript. Vite handles the frontend build for fast development cycles.

## What's Included

```
my-app/
  package.json          # Workspace dependencies and scripts
  tsconfig.json         # TypeScript configuration
  README.md             # Project-specific setup guide
  .gitignore
  .env.example          # Documented environment variables
  Dockerfile            # Production container image
  docker-compose.yml    # Local development stack
  src/
    server/
      index.ts          # Express server entry point
      routes/
        health.ts       # GET /health endpoint
    client/
      index.html        # Vite HTML entry
      main.tsx          # React entry point
      App.tsx           # Root React component
      App.css           # Base styles
```

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 18+ |
| Frontend framework | React | 18 |
| Language | TypeScript | 5+ |
| Frontend build tool | Vite | Latest |
| Backend framework | Express | 4 |
| Container | Docker | Any |

## Usage

Scaffold a new web app project:

```bash
npx forgekit-cli new my-app --template web-app
```

Or run the interactive wizard and select `web-app` when prompted:

```bash
npx forgekit-cli new
```

## Running After Scaffold

```bash
cd my-app
npm install        # if you used --skip-install
npm run dev
```

Your application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Compile TypeScript and build the frontend bundle |
| `npm start` | Start the production server |
| `npm test` | Run the test suite |

## Health Check

The template includes a health endpoint you can use with load balancers and uptime monitors:

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

## Customization Tips

**Add a database:**
Add your preferred ORM (Prisma, Drizzle, or TypeORM) to `package.json` and create a connection module in `src/server/`.

**Add environment variables:**
Copy `.env.example` to `.env` and update the values. Add new variables to `.env.example` with a comment describing each one.

**Add API routes:**
Create new route files in `src/server/routes/` and register them in `src/server/index.ts`.

**Extend the frontend:**
The React setup is intentionally minimal. Add your preferred state management, routing, or component library to `package.json`.
