---
title: Configuration
description: ForgeKit CLI configuration file, available keys, and environment variable overrides.
---

# Configuration

ForgeKit CLI stores user preferences in a local config file. Most settings can also be overridden with environment variables for CI and scripted use.

## Config File Location

```
~/.forgekit/config.json
```

ForgeKit creates this file automatically on first run. You can edit it directly with any text editor.

## Config File Format

```json
{
  "telemetry": false,
  "userId": "a3f2e1b0-...",
  "firstRun": false
}
```

## Config Keys

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `telemetry` | boolean | `false` | Whether anonymous usage telemetry is enabled |
| `userId` | string | Auto-generated UUID | Anonymous identifier used for telemetry. Never contains personal information. Generated once and stored locally. |
| `firstRun` | boolean | `true` | Whether this is the user's first time running ForgeKit. Used to display onboarding prompts. |

## Telemetry

Telemetry is **off by default**. When enabled, ForgeKit records which commands are run and which templates are used. No project names, file contents, or personal information are collected.

**Enable telemetry:**

```bash
forgekit telemetry enable
```

**Disable telemetry:**

```bash
forgekit telemetry disable
```

**Check current status:**

```bash
forgekit telemetry status
```

## Environment Variables

Environment variables take precedence over config file values. They are useful for CI pipelines and scripted environments where you do not want to modify the config file.

| Variable | Type | Description |
|----------|------|-------------|
| `FORGEKIT_TEMPLATE_DIR` | string | Path to a directory containing custom templates. Templates in this directory are merged with the built-in registry. |
| `FORGEKIT_NO_TELEMETRY` | any | Set to any non-empty value to disable telemetry, regardless of the config file setting. |
| `CI` | any | When set (standard in most CI environments), telemetry is automatically disabled. |

### Example: Use a custom template directory

```bash
export FORGEKIT_TEMPLATE_DIR=/path/to/my-templates
forgekit list
```

Templates in `FORGEKIT_TEMPLATE_DIR` appear alongside the built-in templates in `forgekit list` and `forgekit new`.

### Example: Disable telemetry in CI

Most CI providers set the `CI` variable automatically. ForgeKit detects this and disables telemetry without any configuration.

If your CI environment does not set `CI`, use `FORGEKIT_NO_TELEMETRY` instead:

```bash
export FORGEKIT_NO_TELEMETRY=1
forgekit new my-app --template web-app --skip-install
```

::: info Config file is never required
If `~/.forgekit/config.json` does not exist or cannot be read, ForgeKit falls back to safe defaults (telemetry off, first run mode). The CLI never fails due to a missing or malformed config file.
:::
