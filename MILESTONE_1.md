# MILESTONE 1: `forgekit init` -- Zero-to-Running-Project in One Command

---

### Milestone
**CLI-First Project Scaffolding: `forgekit init`**

### Why This Matters

The single most valuable thing ForgeKit can do on day one is eliminate the 30-60 minutes of boilerplate, config-wrangling, and decision fatigue that every developer faces when starting a new project. Of the three validated product directions (unified developer portal, ephemeral environments, knowledge hub), none of them matter if there is no working software to build on top of. The scaffolding CLI is the atomic unit of value for ForgeKit -- it is the thing a developer can run in their terminal in under 60 seconds and immediately see a working project with correct structure, dependencies, tests, CI config, linting, and a README. It is also the only milestone that can be completed in 2-4 weeks from zero code, produces a tangible artifact that contributors can extend (adding templates), and creates the extensible architecture (CLI + template engine + plugin system) that every future feature (AI workflows, DevOps automation, observability) will build on. Without this, ForgeKit is a planning document. With this, it is a tool.

### Task Breakdown

#### Backend Tasks

1. **CLI Framework Setup**
   - Description: Initialize the Node.js/TypeScript project with a CLI framework (Commander.js or oclif). Set up the monorepo structure with `packages/cli` and `packages/core`. Configure TypeScript, ESLint, Prettier, and the build pipeline.
   - Acceptance Criteria: `npx forgekit --version` prints a version. `npx forgekit --help` prints usage. Project builds from source with `npm run build`. TypeScript strict mode enabled. Linting passes with zero warnings.
   - Estimated Complexity: **M**

2. **Template Engine Core**
   - Description: Build the template rendering engine in `packages/core`. It must read a template manifest (YAML), copy/render files using variable substitution (project name, author, license, etc.), and produce a fully resolved project directory. Templates are directories with a `forgekit.template.yaml` manifest and file trees. Support conditionals (e.g., include Docker config only if user opts in).
   - Acceptance Criteria: Given a template directory and a set of variables, the engine produces the correct output directory. Variable substitution works in file names and file contents. Conditional file inclusion works. Engine is independently unit-testable with no CLI dependency.
   - Estimated Complexity: **L**

3. **`forgekit init` Command Implementation**
   - Description: Implement the interactive `forgekit init` command. It prompts the user to select a template (from a bundled registry), enter a project name, choose options (language, framework, Docker, CI provider), then runs the template engine and writes the output. Support `--yes` flag for non-interactive defaults. Support `--template <name>` for direct selection.
   - Acceptance Criteria: Running `forgekit init` in an empty directory produces a working project. Running `forgekit init --yes` produces a project with sensible defaults and no prompts. Running `forgekit init --template node-api` selects the template directly. Output includes a success message with next steps. Exit code is 0 on success, non-zero on failure with an actionable error message.
   - Estimated Complexity: **M**

4. **Template Registry and Bundled Templates**
   - Description: Create a local template registry (JSON manifest listing available templates with metadata: name, description, tags, supported languages). Bundle 3 starter templates: (a) `node-api` -- Express/Fastify REST API with TypeScript, tests, and health endpoint; (b) `react-app` -- React + Vite + TypeScript with basic routing and tests; (c) `python-ml` -- Python ML project with virtualenv, pytest, and a sample training script. Each template must produce a project that passes its own tests on first run.
   - Acceptance Criteria: `forgekit init` lists all 3 templates with descriptions. Each generated project has a working `npm test` or `pytest` command. Each generated project has a README explaining what it is and how to run it. Each generated project includes a `.gitignore`, a license file, and basic CI config (GitHub Actions).
   - Estimated Complexity: **L**

5. **Error Handling and Validation Layer**
   - Description: Implement input validation for all user-provided values (project name must be valid directory name, no path traversal, no overwriting existing directories). Add structured error types with user-friendly messages. Add a `--verbose` flag for debug output. Validate template integrity before rendering.
   - Acceptance Criteria: Invalid project names produce clear error messages. Attempting to scaffold into an existing non-empty directory warns the user and exits (unless `--force`). Corrupted or missing template manifests produce actionable errors. Verbose mode shows each file being written.
   - Estimated Complexity: **S**

#### Frontend Tasks

1. **Terminal UX Design for Interactive Prompts**
   - Description: Design and implement the interactive prompt flow using Inquirer.js or Prompts. The flow must feel polished: colored output, spinners during file generation, a clear summary of what was created, and "what to do next" instructions. Support terminal width detection for responsive output.
   - Acceptance Criteria: The prompt flow is completable in under 30 seconds for an experienced user. Colors and formatting work in standard terminals (iTerm, Terminal.app, Windows Terminal, VS Code terminal). A spinner shows during template rendering. Final output shows a boxed summary with file count, project path, and next-steps commands.
   - Estimated Complexity: **M**

2. **Template Preview / Dry-Run Mode**
   - Description: Implement `forgekit init --dry-run` that shows what files would be created without actually writing them. Output a tree-view of the planned directory structure. This lets users verify before committing.
   - Acceptance Criteria: `--dry-run` produces a tree output showing all files that would be created. No files are written to disk. Output includes total file count and estimated disk usage.
   - Estimated Complexity: **S**

#### DevOps Tasks

1. **CI/CD Pipeline for ForgeKit Itself**
   - Description: Set up GitHub Actions workflows for the ForgeKit repository: (a) `ci.yml` -- runs on every PR and push to main: lint, type-check, unit tests, integration tests; (b) `release.yml` -- triggered on version tags: builds, tests, and publishes to npm. Include caching for node_modules. Pin all action versions.
   - Acceptance Criteria: PRs cannot be merged without passing CI. CI runs in under 3 minutes. Release workflow publishes a working npm package. All action versions are pinned to SHA, not tags.
   - Estimated Complexity: **M**

2. **Generated Project CI Templates**
   - Description: Each bundled template must include a working GitHub Actions CI config that runs tests, linting, and type-checking for the generated project. These are the CI configs that ship inside the templates, not ForgeKit's own CI.
   - Acceptance Criteria: A project generated from `node-api` template has a working `.github/workflows/ci.yml`. A project generated from `react-app` has a working CI config. A project generated from `python-ml` has a working CI config. Each generated CI config passes when run in a fresh GitHub repo.
   - Estimated Complexity: **S**

3. **npm Package Configuration and Publishing**
   - Description: Configure `package.json` for npm publishing. Set up the `bin` field for the `forgekit` command. Ensure `npx forgekit` works without prior installation. Add `.npmignore` to exclude test fixtures and dev files from the published package. Target package size under 500KB.
   - Acceptance Criteria: `npx forgekit@latest --version` works from any machine with Node 18+. Published package size is under 500KB. `npm audit` shows zero high/critical vulnerabilities in production dependencies.
   - Estimated Complexity: **S**

#### Security Tasks

1. **Input Sanitization and Path Traversal Prevention**
   - Description: Audit and harden all user input paths. Ensure project names cannot escape the target directory (no `../`, no absolute paths, no symlink attacks). Validate template manifests against a JSON schema. Ensure no template can write outside its output directory.
   - Acceptance Criteria: Attempting `forgekit init --name "../../../etc/malicious"` fails with a clear error. Templates cannot reference files outside their own directory tree. All file write operations are constrained to the output directory. Symlink attacks are blocked.
   - Estimated Complexity: **M**

2. **Dependency Supply Chain Audit**
   - Description: Audit all direct and transitive npm dependencies. Pin exact versions in lockfile. Ensure no dependency has known critical CVEs. Set up `npm audit` as a CI step. Document the dependency policy (minimal dependencies, well-maintained packages only).
   - Acceptance Criteria: `npm audit --production` reports zero critical/high vulnerabilities. All production dependencies are well-maintained (last publish within 12 months). Total production dependency count is under 50 packages. Lockfile is committed and integrity-checked in CI.
   - Estimated Complexity: **S**

3. **Secrets and Credential Safety in Templates**
   - Description: Ensure no bundled template includes hardcoded secrets, API keys, or credentials. All templates must use environment variable patterns (`.env.example` with dummy values, `.env` in `.gitignore`). Add a pre-commit check that scans generated output for secret patterns.
   - Acceptance Criteria: No template file contains strings matching common secret patterns (API keys, tokens, passwords). Every template that needs configuration ships with `.env.example` and a `.gitignore` that excludes `.env`. Documentation in each template explains how to configure secrets safely.
   - Estimated Complexity: **S**

#### Docs Tasks

1. **README.md for the Repository**
   - Description: Write a production-quality README with: project description, a 3-line quick start (`npm install -g forgekit && forgekit init && cd my-project`), a GIF/screenshot of the CLI in action (placeholder for now), feature list, available templates table, architecture overview (brief), contributing link, and license.
   - Acceptance Criteria: A new visitor can understand what ForgeKit does and try it within 60 seconds of reading the README. README includes badges (CI status, npm version, license). README includes a "Why ForgeKit?" section that differentiates from create-react-app, Yeoman, and Cookiecutter.
   - Estimated Complexity: **M**

2. **`forgekit init` Command Documentation**
   - Description: Write complete CLI reference documentation for the `init` command: all flags, all options, examples for each template, troubleshooting section. Include a "Creating Your Own Template" guide with the template manifest schema and a walkthrough.
   - Acceptance Criteria: Every CLI flag is documented with a description and example. Template manifest schema is fully documented. A developer can create and test a custom template by following the guide. Troubleshooting section covers the 5 most likely failure modes.
   - Estimated Complexity: **M**

3. **CONTRIBUTING.md Update**
   - Description: Update CONTRIBUTING.md with: local development setup (clone, install, build, test, link), how to add a new template, how to modify the CLI, how to run the test suite, and a list of good-first-issue areas. Include the architecture diagram showing CLI -> Core -> Template Engine -> Output.
   - Acceptance Criteria: A new contributor can go from clone to running tests in under 5 minutes by following the guide. The guide covers all three contribution paths: adding templates, modifying CLI behavior, and improving the core engine.
   - Estimated Complexity: **S**

4. **Architecture Decision Record (ADR) for Tech Choices**
   - Description: Write an ADR documenting: why TypeScript (type safety, contributor DX), why the chosen CLI framework, why YAML for template manifests (human-readable, widely known), why the monorepo structure, and why minimal dependencies. This is the foundation for future architectural consistency.
   - Acceptance Criteria: ADR covers all five decisions. Each decision includes context, decision, and consequences. ADR is linked from the main README.
   - Estimated Complexity: **S**

### Agent Assignments

| Agent | Task | Output | Interface Contract |
|-------|------|--------|-------------------|
| backend-api-db | CLI Framework Setup | `packages/cli/` and `packages/core/` with build pipeline | Exports: `createProject(options: CreateProjectOptions): Promise<CreateProjectResult>` |
| backend-api-db | Template Engine Core | `packages/core/src/template-engine/` | Input: `TemplateManifest` + `TemplateVariables` -> Output: `RenderedFileTree` |
| backend-api-db | `forgekit init` Command | `packages/cli/src/commands/init.ts` | CLI args/flags parsed to `CreateProjectOptions`, delegates to core |
| backend-api-db | Template Registry + Bundled Templates | `templates/{node-api,react-app,python-ml}/` | Each template has `forgekit.template.yaml` conforming to `TemplateManifest` schema |
| backend-api-db | Error Handling and Validation | `packages/core/src/errors/` and `packages/core/src/validation/` | `ForgeKitError` base class with `code`, `message`, `suggestion` fields |
| ui-ux-designer | Terminal UX / Interactive Prompts | `packages/cli/src/prompts/` | Prompt flow spec: question sequence, defaults, validation rules |
| ui-ux-designer | Dry-Run Mode | `packages/cli/src/commands/init.ts` (--dry-run path) | Tree-formatted string output to stdout |
| devops-infra-cicd | CI/CD for ForgeKit | `.github/workflows/{ci,release}.yml` | CI must export test results; release must publish to npm registry |
| devops-infra-cicd | Generated Project CI Templates | `templates/*/github/workflows/ci.yml` | Each template CI runs the generated project's test command |
| devops-infra-cicd | npm Package Config | `package.json`, `.npmignore`, build scripts | `npx forgekit` must resolve to `packages/cli/dist/index.js` |
| security-auditor | Input Sanitization + Path Traversal | Security review + hardening of `packages/core/src/validation/` | `sanitizeProjectName(input: string): string` and `validateOutputPath(path: string): boolean` |
| security-auditor | Dependency Supply Chain Audit | Audit report + `npm audit` CI step | Zero critical/high CVEs in production deps |
| security-auditor | Secrets Safety in Templates | Template audit report + pre-commit hook | Secret pattern regex list in `packages/core/src/security/secret-patterns.ts` |
| docs-writer | README.md | `/README.md` | Must reference correct CLI commands and flag names from backend |
| docs-writer | CLI Reference Docs | `/docs/cli-reference.md` | Must match actual CLI flag definitions from `packages/cli` |
| docs-writer | CONTRIBUTING.md Update | `/CONTRIBUTING.md` | Must reference actual build/test commands from `package.json` |
| docs-writer | Architecture Decision Record | `/docs/adr/001-initial-tech-choices.md` | Standalone document, no code dependencies |

### Dependencies

The dependency graph, in order:

```
1. CLI Framework Setup (backend-api-db)
   -- no dependencies, this is the foundation
   |
   v
2. Template Engine Core (backend-api-db)
   -- depends on: #1 (project structure and build pipeline)
   |
   +---> 3. Error Handling and Validation (backend-api-db)
   |     -- depends on: #1 (error types used across CLI and core)
   |
   v
4. Template Registry + Bundled Templates (backend-api-db)
   -- depends on: #2 (template manifest schema defined by engine)
   -- depends on: #3 (validation rules for template integrity)
   |
   v
5. `forgekit init` Command (backend-api-db)
   -- depends on: #2, #3, #4 (engine, validation, templates)
   |
   +---> 6. Terminal UX / Interactive Prompts (ui-ux-designer)
   |     -- depends on: #5 (command structure defines prompt flow)
   |
   +---> 7. Dry-Run Mode (ui-ux-designer)
   |     -- depends on: #2, #5 (needs engine output without write)
   |
   v
8. Input Sanitization + Path Traversal (security-auditor)
   -- depends on: #3, #5 (reviews validation layer and init command)
   |
   +---> 9. Secrets Safety in Templates (security-auditor)
         -- depends on: #4 (reviews template contents)

--- parallel with #5 onward ---

10. CI/CD for ForgeKit (devops-infra-cicd)
    -- depends on: #1 (needs build/test commands to exist)
    -- can start as soon as #1 is done

11. Generated Project CI Templates (devops-infra-cicd)
    -- depends on: #4 (templates must exist to add CI to them)

12. npm Package Config (devops-infra-cicd)
    -- depends on: #1, #5 (needs CLI entry point and build output)

13. Dependency Supply Chain Audit (security-auditor)
    -- depends on: #1 (needs package.json with dependencies declared)
    -- should run after all dependencies are added

--- docs depend on implementation being stable ---

14. README.md (docs-writer)
    -- depends on: #5, #6 (needs final CLI UX to document accurately)

15. CLI Reference Docs (docs-writer)
    -- depends on: #5, #6 (needs final flag definitions)

16. CONTRIBUTING.md Update (docs-writer)
    -- depends on: #1, #10 (needs build commands and CI setup)

17. Architecture Decision Record (docs-writer)
    -- no code dependencies, can start after #1 decisions are made
```

### Interface Contracts

**1. Template Manifest Schema (`forgekit.template.yaml`)**
```yaml
name: string                    # e.g., "node-api"
displayName: string             # e.g., "Node.js REST API"
description: string             # One-line description
version: string                 # Semver
author: string
tags: string[]                  # e.g., ["backend", "typescript", "api"]
variables:
  - name: string                # e.g., "projectName"
    prompt: string              # e.g., "What is your project name?"
    type: "string" | "boolean" | "choice"
    default: any
    choices?: string[]          # For type: "choice"
    validate?: string           # Regex pattern
conditionalFiles:
  - path: string                # e.g., "Dockerfile"
    condition: string           # e.g., "includeDocker == true"
postCreate:
  - command: string             # e.g., "npm install"
    description: string         # e.g., "Installing dependencies"
```

**2. Core API (`packages/core`)**
```typescript
// CreateProjectOptions -- passed from CLI to core
interface CreateProjectOptions {
  templateName: string;
  projectName: string;
  outputDirectory: string;
  variables: Record<string, string | boolean>;
  dryRun: boolean;
  force: boolean;
  verbose: boolean;
}

// CreateProjectResult -- returned from core to CLI
interface CreateProjectResult {
  success: boolean;
  outputPath: string;
  filesCreated: string[];
  warnings: string[];
  nextSteps: string[];
}

// ForgeKitError -- base error type
class ForgeKitError extends Error {
  code: string;          // e.g., "INVALID_PROJECT_NAME"
  suggestion: string;    // e.g., "Use only lowercase letters, numbers, and hyphens"
}
```

**3. CLI Flags (`forgekit init`)**
```
forgekit init [project-name]
  --template, -t <name>    Select template directly (skip selection prompt)
  --yes, -y                Accept all defaults (non-interactive)
  --dry-run                Show what would be created without writing files
  --force                  Overwrite existing directory
  --verbose                Show detailed output
  --help, -h               Show help
```

**4. Template Directory Structure**
```
templates/<template-name>/
  forgekit.template.yaml    # Manifest (required)
  template/                  # File tree to render (required)
    {{projectName}}/         # Supports variable substitution in paths
      package.json
      src/
        index.ts
      ...
```

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Template rendering edge cases (nested conditionals, special characters in variable values, platform-specific line endings) break on certain OS/terminal combos | Medium | High | Extensive cross-platform integration tests. Test on macOS, Linux, and Windows in CI. Use a proven template library (Handlebars/EJS) rather than building from scratch. |
| Scope creep into "just one more template" or "let's add a web UI too" delays the core milestone | High | High | Hard scope freeze: exactly 3 templates, CLI only, no web UI in Milestone 1. Any proposed addition goes to Milestone 2 backlog. The team lead enforces this. |
| npm publishing pipeline issues (package name taken, registry auth, npx resolution quirks) delay the first usable release | Medium | Medium | Reserve the `forgekit` npm package name immediately. Test `npx` resolution in CI using a staging registry (Verdaccio) before the real publish. Have a fallback name (`@forgekit/cli`) if the unscoped name is taken. |
| Generated projects become stale quickly as dependency versions change (e.g., React 19 ships, Express 5 goes stable) | High | Medium | Pin dependency versions in templates to known-good versions. Add a Dependabot/Renovate config for the ForgeKit repo that also updates template dependency versions. Include an automated monthly CI job that scaffolds each template and runs its tests. |
| Low contributor interest if the CLI feels too similar to existing tools (Yeoman, create-*-app, Cookiecutter) | Medium | High | Differentiate on three axes from day one: (a) multi-stack support in one tool, (b) opinionated best-practice defaults (CI, tests, linting included by default), and (c) the template manifest is simpler than Yeoman generators. README must make the differentiation clear. |

### Execution Order

**Phase 1: Foundation (Days 1-4) -- Sequential**
1. CLI Framework Setup (backend-api-db)
2. Architecture Decision Record (docs-writer) -- can start on Day 2

**Phase 2: Core Engine (Days 5-10) -- Partially Parallel**
3. Template Engine Core (backend-api-db)
4. Error Handling and Validation (backend-api-db) -- parallel with #3 after interfaces defined
5. CI/CD for ForgeKit (devops-infra-cicd) -- parallel, depends only on Phase 1

**Phase 3: Templates and Command (Days 8-16) -- Partially Parallel**
6. Template Registry + Bundled Templates (backend-api-db) -- starts when engine is testable
7. `forgekit init` Command (backend-api-db) -- starts when engine + templates are stubbed
8. Terminal UX / Interactive Prompts (ui-ux-designer) -- starts when command structure exists
9. Dependency Supply Chain Audit (security-auditor) -- starts when deps are declared

**Phase 4: Polish and Hardening (Days 14-20) -- Parallel**
10. Input Sanitization + Path Traversal (security-auditor)
11. Secrets Safety in Templates (security-auditor)
12. Dry-Run Mode (ui-ux-designer)
13. Generated Project CI Templates (devops-infra-cicd)
14. npm Package Config and Publishing (devops-infra-cicd)

**Phase 5: Documentation and Release (Days 18-24) -- Parallel**
15. README.md (docs-writer)
16. CLI Reference Docs (docs-writer)
17. CONTRIBUTING.md Update (docs-writer)
18. Final integration testing across all OS targets
19. v0.1.0 tag and npm publish

### Acceptance Criteria for Milestone Complete

1. **`npx forgekit init` works on a clean machine** with Node.js 18+ installed, on macOS, Linux, and Windows, producing a running project in under 60 seconds with zero configuration.

2. **All three bundled templates produce projects that pass their own tests** (`npm test` or `pytest`) on first run, with no manual steps required between scaffolding and test execution beyond `cd` and `npm install` / `pip install`.

3. **The CLI handles all error cases gracefully** -- invalid names, existing directories, missing Node.js, corrupted templates, network issues (if any) -- with actionable error messages that tell the user exactly what to do.

4. **CI passes on every PR** with linting, type-checking, unit tests, and integration tests (which actually run `forgekit init` and verify the output). Code coverage on `packages/core` is above 80%.

5. **Security review is complete** with zero critical/high findings. All user inputs are sanitized. No path traversal is possible. No secrets exist in templates. `npm audit --production` is clean.

6. **Documentation is complete and accurate** -- README lets a new user try ForgeKit in 60 seconds, CLI reference covers all flags, contributing guide lets a new developer run tests in 5 minutes, and the template authoring guide lets someone create a custom template in 15 minutes.

7. **The npm package is published** as `forgekit` (or `@forgekit/cli` as fallback), is under 500KB, and `npx forgekit@0.1.0 --version` resolves correctly from the public registry.
