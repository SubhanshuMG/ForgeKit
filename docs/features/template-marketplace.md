---
title: Template Marketplace
description: Search, publish, and validate community templates.
---

# Template Marketplace

ForgeKit includes a searchable template marketplace that combines official templates with community contributions.

## Searching Templates

```bash
forgekit search [query]
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--community` | boolean | `false` | Include community templates in results |
| `--sort <field>` | string | `relevance` | Sort by: `relevance`, `name`, `downloads` |
| `--tag <tag>` | string | None | Filter by stack tag (e.g., `python`, `react`) |

### Examples

```bash
# Search all templates
forgekit search

# Search by keyword
forgekit search "react api"

# Filter by tag
forgekit search --tag python

# Include community templates
forgekit search --community

# Sort by downloads
forgekit search --community --sort downloads
```

## Publishing Templates

Share your templates with the community using the publish command:

```bash
forgekit publish
```

### What It Does

1. **Detects manifest**: Looks for a `forgekit.json` manifest in your project
2. **Generates if missing**: Interactively creates a manifest by analyzing your project
3. **Validates**: Checks the manifest for required fields, valid semver, and safe file paths
4. **Creates tarball**: Packages your template for submission
5. **Prints instructions**: Shows how to submit to the community registry

### Manifest Format (forgekit.json)

```json
{
  "id": "my-template",
  "name": "My Custom Template",
  "description": "A description of what this template sets up",
  "version": "1.0.0",
  "author": "Your Name",
  "stack": ["node", "typescript", "express"],
  "tags": ["backend", "api"],
  "files": [
    { "src": "package.json.hbs", "dest": "package.json" },
    { "src": "src/index.ts", "dest": "src/index.ts" }
  ]
}
```

### Validation Checks

The publish command validates:

- Required fields: `id`, `name`, `description`, `version`, `author`, `stack`, `files`
- Version is valid semver
- File paths don't contain traversal attacks (`../`)
- All referenced files exist
- Template ID follows naming conventions

### Auto-Detection

If no `forgekit.json` exists, ForgeKit infers metadata from:

| File | Detected Info |
|------|---------------|
| `package.json` | Name, description, author, Node.js stack |
| `go.mod` | Module name, Go stack |
| `requirements.txt` | Python stack |
| Source files | Language and framework detection |

## Example Publish Flow

```
$ forgekit publish

  No forgekit.json found. Generate one?
  ◆ Template ID: my-express-api
  ◆ Display name: Express REST API
  ◆ Description: Production-ready Express API with TypeScript
  ◆ Author: Jane Developer
  ◆ Tags: backend, api, express

  ✔ forgekit.json generated
  ✔ Validation passed (12 checks)

  ╭─ Template Summary ─────────────────────────╮
  │  ID:      my-express-api                    │
  │  Name:    Express REST API                  │
  │  Stack:   node, typescript, express         │
  │  Files:   8 template files                  │
  ╰─────────────────────────────────────────────╯

  📦 Tarball created: my-express-api-1.0.0.tgz

  To submit to the registry, open a PR at:
  https://github.com/SubhanshuMG/ForgeKit
```
