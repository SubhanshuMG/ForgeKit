---
title: Installation
description: Install ForgeKit CLI via npx, global install, GitHub Codespaces, or from source. Includes verify and uninstall steps.
---

# Installation

ForgeKit CLI can be run instantly with `npx` (no install needed), installed globally for repeated use, or tried in the browser via GitHub Codespaces.

---

## Try without installing: GitHub Codespaces

The fastest way to try ForgeKit with zero local setup is to open it in a Codespace:

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/SubhanshuMG/ForgeKit)

The Codespace has Node.js, Python, and Go pre-installed. Once it opens, run:

```bash
npx forgekit-cli new my-app --template web-app
```

---

## Option 1: npx (Recommended)

Run ForgeKit without installing anything permanently:

```bash
npx forgekit-cli new my-app --template web-app
```

`npx` downloads and runs the latest published version automatically. You do not need a global install to get started. Subsequent runs use the cached package and are instant.

**One-liner scaffold:**

```bash
npx forgekit-cli new my-app --template web-app && cd my-app && npm run dev
```

---

## Option 2: Global Install

Install ForgeKit globally to use the shorter `forgekit` command system-wide:

```bash
npm install -g forgekit-cli
```

After installation, verify it is available:

```bash
forgekit --version
```

Expected output:

```
0.5.1
```

::: tip Updating a global install
To update to the latest version, run `npm install -g forgekit-cli` again. npm replaces the existing installation in place.
:::

::: warning Permission errors?
If you see `EACCES: permission denied`, do not use `sudo`. See the [Troubleshooting guide](/troubleshooting#eacces-permission-denied-when-installing-globally) for the correct fix using `~/.npm-global`.
:::

---

## Verify Your Environment

Run the `doctor` command to check that all prerequisites meet the minimum version requirements:

```bash
forgekit doctor
# or without global install:
npx forgekit-cli doctor
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

Prerequisites by template:

| Tool | Minimum Version | Required For |
|------|----------------|--------------|
| Node.js | 18.0.0 | CLI + `web-app`, `next-app`, `serverless` |
| npm | 8.0.0 | All templates |
| Python 3 | 3.9+ | `api-service`, `ml-pipeline` |
| Go | 1.21+ | `go-api` |
| Docker | Any | Running `docker-compose` (optional) |
| Git | Any | Version control setup |

::: info Docker is optional
Docker is only needed if you want to run `docker-compose up` locally. All templates scaffold and run without it.
:::

---

## Uninstall

### Uninstall the global package

```bash
npm uninstall -g forgekit-cli
```

Verify it was removed:

```bash
which forgekit   # Should print nothing
```

### Remove the config file

ForgeKit stores preferences at `~/.forgekit/config.json`. To remove it:

```bash
rm -rf ~/.forgekit
```

This removes your telemetry preference and anonymous user ID. It does not affect any projects you have already scaffolded.

---

## Next Steps

- Follow the [Quick Start guide](/getting-started) to scaffold your first project
- Browse available [templates](/templates/) to pick the right stack
- See the [CLI Reference](/cli-reference) for all commands and flags
