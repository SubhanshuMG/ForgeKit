---
title: Configuration
description: ForgeKit CLI configuration file, custom template directories, environment variables, and telemetry opt-out.
---

# Configuration

ForgeKit CLI stores user preferences in a local config file. Custom template directories are loaded via an environment variable. All settings can be overridden for CI and scripted environments.

---

## Config File Location

```
~/.forgekit/config.json
```

ForgeKit creates this file automatically on first run. You can edit it directly with any text editor or delete it; ForgeKit falls back to safe defaults if it is missing or malformed.

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
| `telemetry` | boolean | `false` | Whether anonymous usage telemetry is enabled. Managed via `forgekit telemetry enable/disable`. |
| `userId` | string | Auto-generated UUID | Anonymous identifier used for telemetry. Never contains personal information. Generated once on first run and stored locally. |
| `firstRun` | boolean | `true` | Tracks whether this is the first time ForgeKit has run. Used to display the onboarding message. |

::: info Config file is never required
If `~/.forgekit/config.json` does not exist or cannot be read, ForgeKit uses safe defaults: telemetry off, first-run mode active. The CLI never fails due to a missing or malformed config file.
:::

---

## Custom Template Directories

You can load your own templates alongside the built-in ones by pointing ForgeKit at a local directory:

```bash
export FORGEKIT_TEMPLATE_DIR=/path/to/my-templates
forgekit list   # your templates appear alongside built-in ones
forgekit new my-project --template my-custom-template
```

### Directory structure

Your template directory must contain a `registry.json` file that follows the same schema as the [built-in registry](https://github.com/SubhanshuMG/ForgeKit/blob/main/templates/registry.json):

```
/path/to/my-templates/
  registry.json
  my-custom-template/
    README.md.hbs
    package.json.hbs
    src/
      index.ts
    ...
```

### registry.json format

```json
{
  "version": "1.0.0",
  "templates": [
    {
      "id": "my-custom-template",
      "name": "My Custom Template",
      "description": "A custom project template",
      "stack": ["node", "typescript"],
      "version": "1.0.0",
      "author": "Your Name",
      "files": [
        { "src": "README.md.hbs", "dest": "README.md" },
        { "src": "package.json.hbs", "dest": "package.json" },
        { "src": "src/index.ts", "dest": "src/index.ts" }
      ],
      "hooks": [
        { "type": "post-scaffold", "command": "npm", "args": ["install"] }
      ],
      "variables": [
        { "name": "name", "prompt": "Project name", "type": "string", "default": "my-project" }
      ]
    }
  ]
}
```

### Variable substitution

Files with the `.hbs` extension are processed as Handlebars templates. Use <span v-pre>`{{name}}`</span> anywhere the project name should appear. Other variables defined in `variables` are also available.

For example, in `README.md.hbs`:

```markdown
# {{name}}

This project was scaffolded with ForgeKit.
```

Non-`.hbs` files are copied as-is without any substitution.

### Template naming

Template IDs in your custom registry must not conflict with built-in template IDs (`web-app`, `api-service`, `ml-pipeline`, `next-app`, `go-api`, `serverless`). If there is a conflict, the built-in template takes precedence and a warning is shown.

---

## Telemetry

Telemetry is **off by default**. When enabled, ForgeKit records anonymous usage events: which commands are run and which templates are used. No project names, file contents, or personal information are collected.

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

---

## Environment Variables

Environment variables take precedence over config file values. They are the recommended approach for CI pipelines and scripted environments.

| Variable | Type | Description |
|----------|------|-------------|
| `FORGEKIT_TEMPLATE_DIR` | string (path) | Path to a directory containing custom templates. Templates here are merged with the built-in registry. |
| `FORGEKIT_NO_TELEMETRY` | any non-empty value | Disables telemetry regardless of the config file setting. Useful in scripts and automation. |
| `CI` | any non-empty value | When set (standard in GitHub Actions, CircleCI, etc.), telemetry is automatically disabled. You do not need to set `FORGEKIT_NO_TELEMETRY` separately. |

### Use a custom template directory

```bash
export FORGEKIT_TEMPLATE_DIR=/path/to/my-templates
forgekit list
forgekit new my-project --template my-custom-template
```

### Disable telemetry in CI

Most CI providers set the `CI` variable automatically. ForgeKit detects it and disables telemetry without any configuration.

If your CI environment does not set `CI`, use `FORGEKIT_NO_TELEMETRY` instead:

```bash
export FORGEKIT_NO_TELEMETRY=1
forgekit new my-app --template web-app --skip-install
```

### Combine options for fully non-interactive CI scaffold

```bash
export CI=true
export FORGEKIT_NO_TELEMETRY=1
npx forgekit-cli new my-app --template web-app --skip-install --dir /tmp/scaffold-test
```
