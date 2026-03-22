# Quick Start

Get from zero to a running project in under 2 minutes.

## Prerequisites

- Node.js 18+ ([install](https://nodejs.org))
- npm 9+ (comes with Node.js)

## Step 1: Scaffold a project

```bash
npx @forgekit/cli new
```

This opens an interactive prompt. Choose:
- **Project name** — e.g., `my-app`
- **Template** — e.g., `web-app`

ForgeKit writes all files and runs `npm install` automatically.

## Step 2: Run it

```bash
cd my-app
npm run dev
```

Your app is live at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/health

## Non-interactive mode

```bash
npx @forgekit/cli new my-app --template web-app
npx @forgekit/cli new my-api --template api-service
npx @forgekit/cli new my-pipeline --template ml-pipeline
```

## Skip dependency install

```bash
npx @forgekit/cli new my-app --template web-app --skip-install
```

## List all templates

```bash
npx @forgekit/cli list
```

## Get template details

```bash
npx @forgekit/cli info web-app
```

## Troubleshooting

**Error: Template not found**
Run `npx @forgekit/cli list` to see available template IDs.

**Error: Permission denied writing files**
Ensure you have write access to the target directory.

**npm install fails after scaffold**
Use `--skip-install` and run `npm install` manually after reviewing the generated `package.json`.
