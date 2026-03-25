---
title: Docs Generation
description: Auto-generate README and documentation from your codebase.
---

# Docs Generation

ForgeKit can analyze your project and generate a complete README with badges, prerequisites, scripts table, project structure, and more.

## Usage

```bash
forgekit docs generate
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--path <dir>` | string | `.` | Project directory to analyze |
| `--output <file>` | string | `README.md` | Output file path |
| `--force` | boolean | `false` | Overwrite existing file without prompting |
| `--stdout` | boolean | `false` | Print to stdout instead of writing a file |

### Examples

```bash
# Generate README.md in current directory
forgekit docs generate

# Generate for a specific project
forgekit docs generate --path ~/projects/my-api

# Preview without writing
forgekit docs generate --stdout

# Write to a different file
forgekit docs generate --output DOCS.md

# Overwrite existing README
forgekit docs generate --force
```

## What Gets Generated

ForgeKit analyzes your project and produces a README with these sections:

### 1. Title and Badges

Project name from `package.json` with relevant badges (npm version, license, Node.js version, TypeScript).

### 2. Description

Pulled from `package.json` description field.

### 3. Prerequisites

Auto-detected based on your stack:
- Node.js version (from `engines` field or detected)
- Package manager (npm, yarn, pnpm)
- Docker (if Dockerfile present)
- Python (if `requirements.txt` present)

### 4. Installation

```markdown
git clone <repo-url>
cd <project-name>
npm install
```

### 5. Available Scripts

A table of all scripts from `package.json`:

| Script | Command |
|--------|---------|
| `dev` | `npm run dev` |
| `build` | `npm run build` |
| `test` | `npm test` |

### 6. Project Structure

An auto-generated directory tree showing key files and folders.

### 7. Environment Variables

If `.env.example` exists, lists all variables with descriptions.

### 8. License

Detected from `package.json` or `LICENSE` file.

## Framework Detection

ForgeKit detects and customizes the README for these frameworks:

| Framework | Detection |
|-----------|-----------|
| Next.js | `next` in dependencies |
| React | `react` in dependencies |
| Vue | `vue` in dependencies |
| Express | `express` in dependencies |
| Fastify | `fastify` in dependencies |
| NestJS | `@nestjs/core` in dependencies |

## Example Output

```markdown
# my-api

A REST API service for user management.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- Docker (optional)

## Installation

git clone https://github.com/user/my-api.git
cd my-api
npm install

## Available Scripts

| Script | Command |
|--------|---------|
| dev | npm run dev |
| build | npm run build |
| test | npm test |
| lint | npm run lint |

## License

MIT
```
