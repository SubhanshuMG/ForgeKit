---
title: Next App Template
description: Full-stack Next.js application with the App Router, TypeScript, Tailwind CSS, and Docker support.
---

# Next App Template

**ID:** `next-app`

A full-stack Next.js application using the App Router, TypeScript, and Tailwind CSS. Includes a built-in health API route and Docker support for production deployments.

## What's Included

```
my-next-app/
  package.json            # Dependencies and scripts
  tsconfig.json           # TypeScript configuration
  tailwind.config.ts      # Tailwind CSS configuration
  next.config.ts          # Next.js configuration
  README.md               # Project-specific setup guide
  .gitignore
  .env.example            # Documented environment variables
  Dockerfile              # Production container image
  docker-compose.yml      # Local development stack
  app/
    layout.tsx            # Root layout with Tailwind base styles
    page.tsx              # Home page component
    api/
      health/
        route.ts          # GET /api/health endpoint
  public/                 # Static assets
```

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 14+ |
| Language | TypeScript | 5+ |
| Styling | Tailwind CSS | 3+ |
| Runtime | Node.js | 18+ |
| Container | Docker | Any |

## Usage

Scaffold a new Next.js project:

```bash
npx forgekit-cli new my-next-app --template next-app
```

Or use the interactive wizard:

```bash
npx forgekit-cli new
```

## Running After Scaffold

```bash
cd my-next-app
npm install        # if you used --skip-install
npm run dev
```

App runs at `http://localhost:3000`.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build the production bundle |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run the test suite |

## Health Check

The template includes a health endpoint compatible with load balancers and uptime monitors:

```
GET /api/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-03-22T10:00:00.000Z"
}
```

## Docker

Build and run the production image:

```bash
docker-compose up --build
```

The app is available at `http://localhost:3000`.

## Customization Tips

**Add a database:**
Install Prisma or Drizzle and configure a connection string in `.env`. Next.js App Router server components and route handlers can query the database directly.

**Add authentication:**
NextAuth.js integrates cleanly with the App Router. Add it to `package.json` and configure a provider in `app/api/auth/[...nextauth]/route.ts`.

**Add environment variables:**
Copy `.env.example` to `.env` and update the values. Prefix client-side variables with `NEXT_PUBLIC_`.

**Extend the UI:**
Tailwind CSS is already configured. Add components to the `components/` directory or use a component library like shadcn/ui.
