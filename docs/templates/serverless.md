---
title: Serverless Template
description: TypeScript AWS Lambda functions managed with the Serverless Framework, including offline development and tests.
---

# Serverless Template

**ID:** `serverless`

AWS Lambda functions written in TypeScript, managed with the Serverless Framework. Includes a health check handler, a sample function, offline development support, and tests.

## Prerequisites

- An AWS account with credentials configured locally (for deployment)
- Node.js 18+

Configure AWS credentials:

```bash
aws configure
```

Or set the environment variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

## What's Included

```
my-functions/
  package.json            # Dependencies and scripts
  tsconfig.json           # TypeScript configuration
  serverless.yml          # Serverless Framework configuration
  README.md               # Project-specific setup guide
  .gitignore
  .env.example            # Documented environment variables
  src/
    handlers/
      health.ts           # GET /health Lambda handler
      hello.ts            # Sample Lambda handler
    types/
      index.ts            # Shared TypeScript types
  tests/
    health.test.ts        # Health handler tests
    hello.test.ts         # Sample handler tests
```

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 18 |
| Language | TypeScript | 5+ |
| Framework | Serverless Framework | v3 |
| Cloud provider | AWS Lambda | - |
| Testing | Jest | Latest |

## Usage

Scaffold a new serverless project:

```bash
npx forgekit-cli new my-functions --template serverless
```

Or use the interactive wizard:

```bash
npx forgekit-cli new
```

## Running After Scaffold

**Run locally (no AWS required):**

```bash
cd my-functions
npm install        # if you used --skip-install
npm run dev
```

This starts `serverless-offline`, which emulates API Gateway locally. Handlers are available at `http://localhost:3000`.

**Run tests:**

```bash
npm test
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start serverless-offline for local development |
| `npm run build` | Compile TypeScript |
| `npm test` | Run the test suite with Jest |
| `npm run deploy` | Deploy all functions to AWS |
| `npm run deploy:prod` | Deploy to the production stage |
| `npm run remove` | Remove the deployed stack from AWS |

## Health Check

```
GET /health
```

Response:

```json
{
  "statusCode": 200,
  "body": "{\"status\":\"ok\",\"timestamp\":\"2026-03-22T10:00:00.000Z\"}"
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `STAGE` | Deployment stage (`dev`, `prod`) |
| `AWS_REGION` | AWS region for deployment |

Define additional variables in `serverless.yml` under `provider.environment` and document them in `.env.example`.

## Deploying to AWS

```bash
npx serverless deploy --stage prod
```

After deployment, the CLI outputs the API Gateway endpoint URLs for each function.

## Customization Tips

**Add a new function:**
Create a handler file in `src/handlers/`, export an async handler function, and register it in `serverless.yml` under `functions`.

**Add a database:**
For simple key-value storage, use AWS DynamoDB and configure the table in `serverless.yml` under `resources`. For relational workloads, use RDS Proxy to manage connection pooling across Lambda invocations.

**Add scheduled events:**
Use `schedule` events in `serverless.yml` to run a handler on a cron schedule without an API Gateway trigger.
