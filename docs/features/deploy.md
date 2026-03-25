---
title: One-Command Deploy
description: Auto-detect your stack and deploy to Vercel, Railway, or Fly.io.
---

# One-Command Deploy

ForgeKit can detect your project's stack and deploy it to a supported hosting provider with a single command.

## Usage

```bash
forgekit deploy
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--provider <name>` | string | Auto-detected | Force a specific provider (`vercel`, `railway`, `fly`) |
| `--production` | boolean | `false` | Deploy to production environment |
| `--dry-run` | boolean | `false` | Show what would happen without deploying |

### Examples

```bash
forgekit deploy
forgekit deploy --provider vercel --production
forgekit deploy --dry-run
```

## Stack Detection

ForgeKit checks your project for these files to determine the best provider:

| File | Detected As | Default Provider |
|------|-------------|-----------------|
| `next.config.*` | Next.js | Vercel |
| `vercel.json` | Vercel project | Vercel |
| `fly.toml` | Fly.io project | Fly |
| `Procfile` | Heroku-style | Railway |
| `serverless.yml` | Serverless Framework | AWS |
| `Dockerfile` | Container | Railway |

## Supported Providers

### Vercel

Deploys using the Vercel CLI (`vercel --yes`).

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
forgekit deploy --provider vercel
```

### Railway

Deploys using the Railway CLI (`railway up`).

```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
forgekit deploy --provider railway
```

### Fly.io

Deploys using the Fly CLI (`fly deploy`).

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy
forgekit deploy --provider fly
```

## How It Works

1. Scans your project for config files to detect the stack
2. Determines the appropriate provider
3. Checks if the provider's CLI tool is installed
4. If missing, shows install instructions and exits
5. Runs the deploy command with a 5-minute timeout
6. Reports success or failure

::: warning CLI tools required
ForgeKit delegates to the provider's own CLI. You must have the relevant CLI installed and authenticated before deploying.
:::
