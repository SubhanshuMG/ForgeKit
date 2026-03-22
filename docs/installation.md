---
title: Installation
description: Install ForgeKit CLI via npx, global install, or from source.
---

# Installation

ForgeKit CLI can be used without installation via `npx`, or installed globally for repeated use.

## Option 1: npx (Recommended)

Use `npx` to run ForgeKit without installing anything permanently:

```bash
npx forgekit-cli new
```

`npx` always fetches the latest published version, so you stay up to date automatically.

## Option 2: Global Install

Install ForgeKit globally to use `forgekit` as a system-wide command:

```bash
npm install -g forgekit-cli
```

After installation, verify it is available:

```bash
forgekit --version
```

Expected output:

```
0.1.0
```

::: tip Updating a global install
To update to the latest version, run `npm install -g forgekit-cli` again. npm replaces the existing installation.
:::

## Verify Your Environment

Run the `doctor` command to check that all prerequisites are installed and meet the minimum version requirements:

```bash
forgekit doctor
```

Example output:

```
  ForgeKit Doctor

  ✔ Node.js v20.11.0
  ✔ npm v10.2.4
  ✔ Python 3 3.11.7
  ✔ pip 23.3.2
  ○ Docker not found (optional)
  ✔ Git 2.43.0

  5 checks passed, 0 failed
```

The `doctor` command checks:

| Tool | Required | Minimum Version |
|------|----------|----------------|
| Node.js | Yes | 18.0.0 |
| npm | Yes | 8.0.0 |
| Python 3 | Yes | Any 3.x |
| pip | Yes | Any version |
| Docker | Optional | Any version |
| Git | Yes | Any version |

::: warning Docker is optional
Docker is only required if you want to run `docker-compose` locally. The scaffold step works without it.
:::

## Next Steps

- Follow the [Quick Start guide](/getting-started) to scaffold your first project
- Browse available [templates](/templates/) to pick the right stack
