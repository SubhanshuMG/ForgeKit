---
title: AI Scaffolding
description: Describe your project in plain English and let AI pick the best template.
---

# AI Scaffolding

ForgeKit can use AI to analyze a plain-English description of your project and recommend the best template, project name, and configuration.

## Usage

```bash
forgekit new --ai "describe your project"
```

### Examples

```bash
forgekit new --ai "REST API with PostgreSQL and JWT auth"
forgekit new --ai "Next.js dashboard with Tailwind CSS"
forgekit new --ai "ML pipeline for sentiment analysis"
forgekit new --ai "serverless webhook handler for Stripe"
```

## How It Works

1. You provide a natural language description with the `--ai` flag
2. ForgeKit sends your description to the configured AI provider along with the available templates
3. The AI returns a recommendation: template ID, project name, and explanation
4. You review the recommendation and confirm or cancel
5. If confirmed, scaffolding proceeds as normal

```
$ forgekit new --ai "REST API with PostgreSQL and JWT auth"

  ForgeKit AI

  ◐ Analyzing your project description...
  ✔ AI recommendation ready!

  ╭─── AI Recommendation ──────────────────────────╮
  │                                                │
  │  Template:  api-service                        │
  │  Name:      jwt-api                            │
  │                                                │
  │  FastAPI provides built-in JWT support and     │
  │  the api-service template includes PostgreSQL  │
  │  with SQLAlchemy out of the box.               │
  │                                                │
  ╰────────────────────────────────────────────────╯

  ◆ Use this recommendation? (Y/n)
```

## Supported Providers

ForgeKit supports two AI providers. Set the appropriate API key as an environment variable:

| Provider | Environment Variable | Default Model |
|----------|---------------------|---------------|
| OpenAI | `OPENAI_API_KEY` | `gpt-4o` |
| Anthropic | `ANTHROPIC_API_KEY` | `claude-sonnet-4-6` |

If both keys are set, Anthropic is preferred by default. You can override this in your config:

```json
// ~/.forgekit/config.json
{
  "ai": {
    "provider": "openai",
    "model": "gpt-4o"
  }
}
```

## Configuration

| Config Key | Type | Description |
|-----------|------|-------------|
| `ai.provider` | `"openai"` \| `"anthropic"` | Which AI provider to use |
| `ai.model` | string | Model ID override (e.g., `gpt-4o`, `claude-sonnet-4-6`) |

::: tip No API key? No problem
If no API key is found, ForgeKit shows a helpful error explaining how to set one. The `--ai` flag is entirely optional. You can always use the interactive wizard instead.
:::

## Privacy

- Your project description is sent to the AI provider's API
- No other data (file contents, environment variables, system info) is sent
- API keys are never logged or stored beyond your environment variables
- The AI response is validated before use; invalid template IDs are rejected
