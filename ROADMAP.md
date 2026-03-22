# ForgeKit Roadmap

## Vision

ForgeKit is building toward a unified AI-augmented engineering platform that helps every type of engineer, AI, DevOps, backend, frontend, full-stack, ship faster from day one.

Think: **Backstage + Codespaces + Copilot** in one open-source platform.

---

## Milestone 1: CLI Scaffolding Engine *(current)*

**Goal:** `npx @forgekit/cli new` produces a running project in under 60 seconds.

### Delivered
- [x] CLI core (`@forgekit/cli`), `new`, `list`, `info` commands
- [x] Template: `web-app` (Node.js + React + TypeScript)
- [x] Template: `api-service` (Python + FastAPI + PostgreSQL)
- [x] Template: `ml-pipeline` (Python + Jupyter + MLflow)
- [x] Security sandbox (path containment, hook allowlist)
- [x] GitHub Actions CI (lint, type-check, test, smoke test)
- [x] DCO enforcement on PRs
- [x] Web dashboard (`packages/web`), template browser + CLI command generator
- [x] Governance: Apache 2.0, TRADEMARK.md, SECURITY.md, CODE_OF_CONDUCT.md

---

## Milestone 2: Web Dashboard + Direct Scaffold

**Goal:** Create and scaffold a project from the browser without using a terminal.

- [ ] REST API server (`packages/api`), `/templates`, `/scaffold` endpoints
- [ ] Web dashboard connects to API (replaces CLI-command-generator approach)
- [ ] Real-time scaffold progress (WebSocket or SSE)
- [ ] Project history and management UI
- [ ] Template search and filtering
- [ ] Auth: GitHub OAuth (optional, for project persistence)

---

## Milestone 3: AI-Assisted Workflows

**Goal:** Engineers can ask questions about their scaffolded project and get AI-powered help.

- [ ] AI assistant panel in web dashboard
- [ ] "Explain this architecture", AI describes the scaffolded project
- [ ] "Generate tests for X", AI writes tests for a given module
- [ ] "How do I deploy this?", context-aware deployment guidance
- [ ] Code Q&A backed by project context
- [ ] Powered by Claude API (Anthropic)

---

## Milestone 4: Ephemeral Dev Environments

**Goal:** Every PR gets a live preview URL. AI engineers get GPU sandboxes on demand.

- [ ] GitHub webhook integration, trigger on PR open/push
- [ ] Kubernetes namespace provisioning per environment
- [ ] Preview URL per PR (e.g. `https://pr-123.preview.forgekit.build`)
- [ ] Environment teardown on PR close
- [ ] GPU allocation for ML templates
- [ ] One-click "Scale up" / "Tear down" buttons

---

## Milestone 5: Knowledge Hub

**Goal:** Engineers can query their codebase in natural language.

- [ ] Repo ingestion, crawl code, docs, infra configs
- [ ] Vector search index (embeddings)
- [ ] Chat interface: "Which services have public internet access?"
- [ ] Plugin marketplace (community-contributed tools, scripts, workflows)
- [ ] "Add to Slack" integration

---

## Milestone 6: Enterprise & SaaS

**Goal:** Self-hosted enterprise deployment and managed SaaS offering.

- [ ] Multi-user workspaces
- [ ] Role-based access control (RBAC)
- [ ] Audit logs visible in UI
- [ ] SSO (SAML/OIDC)
- [ ] Usage metrics and billing
- [ ] Enterprise deployment guide (Helm chart, Terraform)

---

## Success Metrics

| Metric | Target (Month 3) |
|--------|-----------------|
| GitHub stars | 500+ |
| npm weekly downloads | 1,000+ |
| Contributors | 20+ |
| Templates | 10+ |
| Time to first scaffold | <60 seconds |
| CI pass rate | >95% |
