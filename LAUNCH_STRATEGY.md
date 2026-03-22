# ForgeKit Launch & Growth Strategy

---

## Section 1: Public vs. Private Decision

**Recommendation: Go public within 1-2 weeks, after the CLI Milestone 1 ships.**

The platform has no code yet but is actively being built. The cost of being public with documentation-only is low and the upside (SEO indexing, early discoverers, contributor interest) is real. However, the first impression must include a working `npx @forgekit/cli new` command. A GitHub repo with only docs and no runnable artifact generates interest but no activation.

**Risk/Benefit:**

| Factor | Private now | Public now | Public after CLI ships |
|--------|------------|-----------|----------------------|
| SEO & discoverability | None | Starts building | Best timing |
| First impression | N/A | "No code yet" | "Works in 60s" |
| Contributor interest | None | Some | High |
| IP risk | Low (no code) | Low | Low (Apache 2.0) |
| Star velocity | None | Slow | Strong launch spike |

**Decision:** Make repo public when `npx @forgekit/cli new` works end-to-end and CI is green. That is the launch moment.

---

## Section 2: Private Staging Checklist

Complete all items before flipping to public:

- [x] Apache 2.0 `LICENSE` file with correct copyright
- [x] `README.md`, compelling hero, quickstart, template table
- [x] `CONTRIBUTING.md`, DCO explained, PR checklist, label guide
- [x] `CODE_OF_CONDUCT.md`, Contributor Covenant v2.1
- [x] `SECURITY.md`, private disclosure via GitHub Security Advisories
- [x] `TRADEMARK.md`, permitted/prohibited use of ForgeKit name
- [x] `NOTICE`, Apache 2.0 NOTICE with trademark notice
- [x] `CHANGELOG.md`, initialized with Unreleased section
- [ ] `@forgekit/cli`, `npx @forgekit/cli new` produces a running project
- [ ] All 3 templates pass smoke test in CI (web-app, api-service, ml-pipeline)
- [ ] GitHub Actions CI green on main (lint, test, smoke test, secret scan)
- [ ] DCO check enforced on PRs
- [ ] `npm audit` clean (no critical/high vulnerabilities)
- [ ] Social preview image (1280×640 OG image with ForgeKit branding)
- [ ] GitHub repo description set: "The engineering acceleration platform for AI, DevOps, and full-stack teams"
- [ ] 5 "good first issue" issues drafted and ready to open on launch day
- [ ] npm package name `@forgekit/cli` reserved

---

## Section 3: Public Launch Checklist

### Launch Day (Day 0)

- [ ] Set repo to public
- [ ] Publish `@forgekit/cli` to npm
- [ ] Add GitHub topics: `developer-tools` `cli` `scaffolding` `devops` `ai` `templates` `typescript` `python` `full-stack` `open-source`
- [ ] Open the 5 pre-drafted "good first issues"
- [ ] Pin a "Welcome to ForgeKit" GitHub Discussion
- [ ] Post Show HN (see Section 7)
- [ ] Post to r/devops and r/MachineLearning (see Section 7)
- [ ] Tweet / LinkedIn: 1 GIF of `forgekit new` in action with link
- [ ] Publish dev.to article: "From zero to full-stack in 30 seconds with ForgeKit"
- [ ] Submit to `awesome-cli-apps`, `awesome-devtools`

### Week 1

- [ ] Reply to every comment on HN, Reddit, and GitHub within 24 hours
- [ ] Submit to Product Hunt (Tuesday 12:01am PT for best visibility)
- [ ] Enable GitHub Sponsors
- [ ] Create `forgekit` GitHub organization and transfer repo
- [ ] Set up Discord server and link from README
- [ ] Post to relevant Slack communities (DevOps, Reactiflux, etc.)
- [ ] First monthly changelog post in GitHub Discussions

---

## Section 4: Positioning

### One-line pitch
> ForgeKit scaffolds production-ready projects for AI, DevOps, and full-stack engineers in under 60 seconds, with the right stack, CI, and infrastructure already wired.

### Positioning angles

**vs. Backstage (Spotify)**
Backstage is powerful but requires a platform team to set up and maintain. ForgeKit works for individual engineers and small teams out of the box. No Kubernetes, no portal infrastructure, no 6-month setup.

**vs. raw CI/CD tools (GitHub Actions, Jenkins)**
CI/CD tools manage what happens after you write code. ForgeKit eliminates the hours you waste before you write the first line, scaffolding the project, wiring the stack, setting up the pipeline.

**vs. GitHub Copilot / AI code assistants**
AI assistants help you write code faster. ForgeKit starts you from a correct, tested, deployable structure so the AI assistant is filling in business logic, not fixing a broken Webpack config.

### Audience segments

| Segment | Their pain | ForgeKit's message |
|---------|-----------|-------------------|
| AI engineers | Environment setup, reproducibility, Jupyter/MLflow wiring | "Your ML pipeline, ready to train in 30 seconds" |
| DevOps / Platform engineers | Teams keep asking for new project setups, onboarding takes days | "Give your team a `forgekit new` and stop writing Dockerfiles for people" |
| Full-stack developers | Every new project is hours of config before writing product code | "Skip the setup. Start shipping." |

---

## Section 5: Growth Loops

### GitHub Discoverability

- Set description: "The engineering acceleration platform for AI, DevOps, and full-stack teams"
- Add all relevant topics (see launch checklist)
- Pin repo to GitHub profile/org
- Social preview image with `npx @forgekit/cli new` terminal output
- Add `forgekit` to README badge: shields.io/npm/v/@forgekit/cli

### Content Strategy (specific titles, mapped to months)

**Month 1: Proof it works**
- "From zero to full-stack app in 30 seconds with ForgeKit" (dev.to + Medium)
- "How we built a 3-template CLI that runs on first install" (technical deep-dive)
- "Show HN: ForgeKit, scaffold any stack without touching config files"

**Month 2: Expanding the narrative**
- "Why 80% of internal developer platforms fail, and what ForgeKit does differently"
- "Building a FastAPI service in 2 minutes: ForgeKit api-service template walkthrough"
- "The engineering onboarding problem: how scaffolding tools change Day 1 for new hires"

**Month 3: Community and ecosystem**
- "How to build a custom ForgeKit template for your stack" (tutorial)
- "ForgeKit community templates: 10 stacks contributed in 30 days"

### Demo Strategy

- **Asciinema recording**, `forgekit new my-app` full terminal session (30 seconds), embed in README
- **Loom video**, 3-minute walkthrough for dev.to and Product Hunt
- **GIF**, optimized 15-second loop for Twitter/LinkedIn

### Community Loop

- GitHub Discussions: questions, ideas, template requests, show-and-tell
- Monthly "What shipped" post in Discussions (drives return visits)
- Discord: real-time help, contributor coordination
- Weekly "good first issue" triage to keep contribution queue fresh
- RFC process for significant changes (GitHub Discussion tagged `RFC`)

### Contribution Momentum

- Launch with 5 labeled `good first issue` items (docs, template tweaks, new template)
- Register for Hacktoberfest (October, massive contributor spike)
- Monthly contributor office hours (30-min Zoom, posted in Discussions)
- Credit contributors in CHANGELOG and release notes

---

## Section 6: Metrics

### North Star Metric
**Weekly Active Scaffolds**, number of distinct `forgekit new` invocations per week (tracked via opt-in telemetry or npm download proxy)

### Milestone Table

| Metric | Week 1 | Month 1 | Month 3 |
|--------|--------|---------|---------|
| GitHub stars | 50 | 200 | 1,000 |
| npm weekly downloads | 100 | 500 | 2,000 |
| Contributors | 3 | 10 | 30 |
| Templates | 3 | 5 | 15 |
| Open issues | 10 | 30 | 80 |
| Forks | 5 | 25 | 100 |

### Star Velocity Benchmarks
- Week 1: 50 stars = healthy launch
- Week 1: 200+ stars = viral moment (HN front page or large Twitter share)
- Month 1: <100 stars = messaging or demo problem, revisit positioning

### Activation Funnel

```
1. Discovers repo (GitHub, HN, Google, Twitter)
2. Reads README, understands the value in <30 seconds
3. Runs npx @forgekit/cli new, scaffold succeeds
4. Project runs on first try
5. Returns to scaffold a second project (retained)
6. Opens a PR (contributor)
```

Fix the funnel at the earliest broken step. If stars are high but npm downloads are low: fix README. If downloads are high but issues report failures: fix templates.

### Contributor Health Metrics
- Issue-to-PR conversion rate (target: >20%)
- Median time to first response on issues (target: <48 hours)
- PR merge time (target: <7 days for docs/templates, <14 days for features)

---

## Section 7: Post Templates

### Show HN

```
Show HN: ForgeKit, scaffold any stack in 60 seconds (AI, DevOps, full-stack)

I built ForgeKit because I was tired of spending the first hour of every new project
wiring up TypeScript configs, Dockerfiles, CI pipelines, and database connections
before writing a single line of product code.

ForgeKit is a CLI that scaffolds production-ready projects from battle-tested templates:

  npx @forgekit/cli new my-app --template web-app    # Node + React
  npx @forgekit/cli new my-api --template api-service # Python + FastAPI + PostgreSQL
  npx @forgekit/cli new my-ml  --template ml-pipeline # Jupyter + MLflow

Every scaffolded project:
- Runs on first scaffold (tested in CI)
- Includes working CI config
- Includes Dockerfile + docker-compose
- Includes tests
- Includes a health endpoint

The architecture is modular, adding a template is ~20 files + a registry entry.
No core changes needed.

Apache 2.0. Built in TypeScript. Feedback welcome.

GitHub: https://github.com/forgekit/forgekit
```

### r/devops

```
Title: ForgeKit, open-source CLI that scaffolds DevOps-ready projects in 60 seconds

Tired of writing the same Dockerfile, CI config, and docker-compose.yml for every
new project? ForgeKit scaffolds it all from one command.

`npx @forgekit/cli new my-api --template api-service` gives you:
✅ FastAPI app with async SQLAlchemy + PostgreSQL
✅ Working CI (GitHub Actions)
✅ Dockerfile + docker-compose
✅ Health endpoint
✅ Tests

Open source (Apache 2.0). Templates are easy to add, 20 files + a registry entry.

Repo: https://github.com/forgekit/forgekit

What stacks do you wish had a good scaffold template? Happy to add them.
```

### r/MachineLearning

```
Title: ForgeKit, scaffold a reproducible ML pipeline in 30 seconds

`npx @forgekit/cli new my-project --template ml-pipeline` scaffolds:
- Python project structure with src layout
- MLflow experiment tracking pre-configured
- Jupyter Lab notebooks
- scikit-learn preprocessing pipeline
- Makefile (make train, make evaluate)
- config.yaml for hyperparameters
- pytest setup

The goal is to eliminate the "what structure do I use for this ML project?" question
and give you a reproducible, trackable starting point immediately.

Open source (Apache 2.0): https://github.com/forgekit/forgekit

Feedback from ML engineers especially welcome, what does a great ML project scaffold look like to you?
```
