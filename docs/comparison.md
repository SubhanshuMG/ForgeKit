---
title: ForgeKit vs. Alternatives
description: How ForgeKit compares to create-next-app, Cookiecutter, Yeoman, and degit.
---

# ForgeKit vs. Alternatives

If you're evaluating ForgeKit against tools you already know, here's an honest comparison.

## Feature comparison

| | ForgeKit | create-next-app | Cookiecutter | Yeoman | degit |
|---|---|---|---|---|---|
| **Multi-stack** | ✅ 6 templates | ❌ Next.js only | ✅ Yes | ✅ Yes | ✅ Yes |
| **CI/CD included** | ✅ GitHub Actions | ❌ No | ❌ No | ❌ No | ❌ No |
| **Docker included** | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| **Tests wired** | ✅ Green from day one | ❌ No | ❌ No | ❌ No | ❌ No |
| **Runs with** | `npx` | `npx` | `pip` | `npm -g` | `npx` |
| **Language support** | TS, Python, Go | JS/TS | Any | JS/TS | Any |
| **Security scanning** | ✅ CodeQL + Gitleaks | ❌ No | ❌ No | ❌ No | ❌ No |

## vs. create-next-app / create-react-app

`create-next-app` is excellent for Next.js projects. ForgeKit is not a replacement — it's a different scope. ForgeKit adds the layer above the framework: CI/CD, Docker, `.env` setup, and tests. If you need a Python API, a Go service, or an ML pipeline alongside your Next.js app, ForgeKit has templates for all of them.

## vs. Cookiecutter

Cookiecutter is template-first and Python-native. ForgeKit is CLI-first and language-agnostic. Cookiecutter templates require separate maintenance and don't include the infrastructure layer (CI, Docker). ForgeKit templates are opinionated about the full project setup, not just the file structure.

## vs. Yeoman

Yeoman requires installing a global generator and writing a generator class with a custom DSL. ForgeKit templates are just files with Handlebars variables — any developer can contribute a template without learning a generator framework.

## vs. degit

degit copies a git repo's file structure. It is fast and simple. ForgeKit uses the same approach internally but adds: variable substitution, a registry of curated templates, and pre-wired CI/CD and Docker in every template. You get more than a file copy.

## When to use something else

- **You only need a Next.js app with no infrastructure**: use `create-next-app`
- **You have an existing Cookiecutter template ecosystem**: keep using Cookiecutter
- **You need a totally custom generator with complex prompts and logic**: Yeoman or Plop

For everything else: ForgeKit.

::: warning When ForgeKit is NOT the right choice
ForgeKit makes deliberate tradeoffs. It may not be the right fit if:

- **You need zero-opinion scaffolding.** ForgeKit's templates are opinionated about CI/CD, Docker, and testing. If your organization has non-standard infrastructure or a locked-down CI environment, the generated config may require significant modification.
- **You're working in a language or framework not yet covered.** The current template set covers TypeScript, Python, and Go. Ruby, Rust, Java, and PHP are not yet supported.
- **You need deep interactive prompt trees.** ForgeKit keeps prompts minimal. For generators that ask 20+ questions and branch on each answer, Yeoman or Plop are better suited.
- **You have strict supply-chain policies around `npx`.** ForgeKit is distributed via npm. If your environment restricts `npx` execution or requires internal registry mirroring, plan for that upfront.
- **You already have a mature internal scaffolding system.** Adding ForgeKit on top of an existing, working internal tool adds complexity without benefit.

Knowing the limits of a tool is just as useful as knowing its strengths.
:::

