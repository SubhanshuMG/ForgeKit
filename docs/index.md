---
title: ForgeKit
description: Engineering acceleration platform for AI, DevOps, and full-stack teams.
layout: home

hero:
  name: "ForgeKit"
  text: "Engineering Acceleration Platform"
  tagline: "Scaffold, audit, deploy, and manage production-ready projects for AI, DevOps, and full-stack teams. One CLI, zero config."
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: View Templates
      link: /templates/

features:
  - title: Ship in 60 Seconds
    details: Run one command and get a fully wired project with the right stack, Dockerfile, CI/CD, and environment config already connected. No config files to touch.
    link: /getting-started
    linkText: Get started
  - title: AI-Powered Scaffolding
    details: Describe your project in plain English with --ai and let AI pick the best template, suggest a name, and explain why. Supports OpenAI and Anthropic.
    link: /features/ai-scaffolding
    linkText: Learn more
  - title: 6 Battle-Tested Templates
    details: web-app, next-app, api-service, go-api, ml-pipeline, and serverless. All production-ready with tests, linting, health checks, and Docker included.
    link: /templates/
    linkText: Browse templates
  - title: Project Health Score
    details: Gamified 0 to 100 score across security, quality, testing, documentation, and DevOps. 21 automated checks with actionable suggestions to level up your project.
    link: /features/health-score
    linkText: Learn more
  - title: One-Command Deploy
    details: Auto-detect your stack and deploy to Vercel, Railway, or Fly.io. Checks for installed CLIs and provides install hints. Supports dry-run mode.
    link: /features/deploy
    linkText: Learn more
  - title: Dependency Audit
    details: Security vulnerability scanning with color-coded severity. Detects outdated packages grouped by major, minor, and patch. Gives you a trackable security score.
    link: /features/dependency-audit
    linkText: Learn more
  - title: Encrypted Env Sync
    details: AES-256-GCM encrypted .env management. Push and pull environments across machines, diff between them, all protected by passphrase. No cloud required.
    link: /features/env-sync
    linkText: Learn more
  - title: Auto Docs Generation
    details: Generate a complete README with badges, prerequisites, scripts table, project structure tree, and license info, all inferred from your codebase.
    link: /features/docs-generation
    linkText: Learn more
  - title: Plugin System
    details: Extend ForgeKit with community plugins installed from npm. Plugins register new commands automatically. Safe loading; bad plugins never crash the CLI.
    link: /features/plugin-system
    linkText: Learn more
  - title: Template Marketplace
    details: Search, publish, and validate templates for the community registry. Filter by tags, sort by downloads, and contribute your own stacks.
    link: /features/template-marketplace
    linkText: Learn more
  - title: Security by Default
    details: Path containment, input sanitization, secret scanning, CodeQL analysis, Gitleaks, npm audit, and DCO enforcement. OpenSSF Best Practices certified.
    link: /security
    linkText: Learn more
  - title: CI/CD from Day One
    details: GitHub Actions workflows are wired and green from your first commit. Matrix tested across Node 18 and 20. Plus a reusable GitHub Action for your own pipelines.
    link: /github-action
    linkText: Learn more
---

<div style="padding:56px 24px 8px">
  <p class="fk-demo-label">See it in action</p>
  <DemoVideo />
</div>

<div style="padding:40px 24px 56px; text-align:center;">
  <p style="font-size:13px; text-transform:uppercase; letter-spacing:2px; color:var(--vp-c-text-3); margin-bottom:16px;">From the blog</p>
  <a href="https://blogs.subhanshumg.com/forgekit" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:10px; padding:14px 28px; background:var(--vp-c-bg-soft); border:1px solid var(--vp-c-border); border-radius:10px; text-decoration:none; color:var(--vp-c-text-1); font-weight:600; font-size:15px; transition:border-color 0.2s;">
    Read: Why I built ForgeKit &nbsp;→
  </a>
</div>
