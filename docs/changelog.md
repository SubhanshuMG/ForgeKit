# Changelog

All notable changes to ForgeKit are documented here and on [GitHub Releases](https://github.com/SubhanshuMG/ForgeKit/releases).

---

## v0.5.0

**Released:** March 25, 2026

### New Commands

- **`forgekit health`** - Gamified 0-100 project health score across security, quality, testing, docs, and DevOps (21 automated checks)
- **`forgekit audit`** - Dependency vulnerability scanning and outdated package detection with severity scoring
- **`forgekit deploy`** - One-command deploy with auto-detected provider (Vercel, Railway, Fly.io)
- **`forgekit env push/pull`** - Encrypted .env file sync across environments using AES-256-GCM
- **`forgekit docs generate`** - Auto-generate README from your codebase structure
- **`forgekit plugin add/remove`** - Extend ForgeKit with community plugins (sandboxed execution)
- **`forgekit publish`** - Validate and publish templates to the community registry
- **`forgekit search`** - Search official and community templates

### Enhanced Commands

- **`forgekit new --ai`** - Describe your project in plain English, AI picks the best template (OpenAI / Anthropic)
- **`forgekit new --dry-run`** - Preview what files would be created without writing anything
- **`forgekit doctor --project`** - Diagnose project health issues alongside system prerequisite checks

### Documentation

- 8 new feature documentation pages
- Clickable feature cards on the homepage
- Expanded CLI reference with all new commands
- Mobile responsive polish for code blocks and tables

### Repository

- Fork compliance monitoring (weekly automated scan)
- npm package squatting detection (41 watched names)
- License compliance check on every PR
- Expanded CODEOWNERS protection
- Apache 2.0 NOTICE file with attribution obligations
- X/Twitter and LinkedIn social links

### Fixes

- Fixed inquirer ESM crash by pinning to v8 (CJS-compatible)
- Fixed lint errors (unused imports/variables)
- Fixed README badge alignment

---

## v0.4.2

**Released:** March 23, 2026

- Fix: Rename template `.gitignore` to `gitignore` to survive npm pack stripping
- Service worker `skipWaiting` and `clientsClaim` for immediate activation

---

## v0.4.0

**Released:** March 22, 2026

- Initial public release
- Project scaffolding with interactive wizard
- 6 starter templates: web-app, next-app, api-service, go-api, ml-pipeline, serverless
- Template validation and listing
- System doctor checks
- Telemetry (opt-in)
- GitHub Action for CI/CD scaffolding
- VitePress documentation site at [forgekit.build](https://forgekit.build)
