# Architecture

ForgeKit is a modular 5-layer system designed to scale from CLI tool to full SaaS platform without architectural rewrites.

## Layers

```
┌─────────────────────────────────────────────┐
│           Interface Layer                    │
│   CLI (@forgekit/cli)  │  Web (@forgekit/web)│
├─────────────────────────────────────────────┤
│           Application Layer                  │
│   Workflow Engine │ Task Orchestration        │
├─────────────────────────────────────────────┤
│           Service Layer                      │
│  Scaffolding │ AI │ DevOps │ Observability   │
├─────────────────────────────────────────────┤
│           Data Layer                         │
│  Configs │ Execution Logs │ State            │
├─────────────────────────────────────────────┤
│           Infrastructure Layer               │
│  CI/CD │ Docker │ Monitoring │ Secrets       │
└─────────────────────────────────────────────┘
```

## Current implementation (v0.1)

### CLI (`packages/cli`)

The CLI is a Node.js + TypeScript package published to npm as `@forgekit/cli`.

**Key modules:**

| Module | Path | Responsibility |
|--------|------|---------------|
| Entry point | `src/index.ts` | Commander CLI setup, command registration |
| `new` command | `src/commands/new.ts` | Interactive scaffold flow |
| `list` command | `src/commands/list.ts` | Display available templates |
| `info` command | `src/commands/info.ts` | Template details |
| Template resolver | `src/core/template-resolver.ts` | Load registry, find template by ID |
| File writer | `src/core/file-writer.ts` | Render Handlebars templates, write files |
| Scaffold orchestrator | `src/core/scaffold.ts` | Coordinate resolver + writer + hooks |
| Security | `src/core/security.ts` | Path containment, hook allowlist, input validation |
| Validator | `src/core/validator.ts` | Post-scaffold output validation |
| Audit | `src/core/audit.ts` | Local audit log (~/.forgekit/audit.log) |

**Data flow:**
```
User input → Input validation → Template resolver → File writer → Hook executor → Output validation → Next steps
```

### Web Dashboard (`packages/web`)

React + Vite + TypeScript SPA. Currently provides a template browser and project configuration UI that generates the CLI command to run. Full web-to-scaffold integration is planned for v0.2.

### Templates (`templates/`)

Template files + `registry.json` manifest. Each template is a self-contained directory of source files (plain or Handlebars `.hbs`) plus metadata.

## Module design principles

Every module must:
- Have a single responsibility
- Expose a clear TypeScript interface
- Be independently testable
- Avoid hidden dependencies
- Be replaceable without cascading changes

## Security architecture

See [THREAT_MODEL.md](../THREAT_MODEL.md) for the full threat analysis.

Key controls:
- **Path containment**: Every file write is validated to stay within the output root
- **Hook allowlist**: Only `npm`, `npx`, `yarn`, `pnpm`, `pip`, `pip3`, `python`, `python3` are allowed as hook commands
- **Input sanitization**: Project names are sanitized before use as directory names
- **Dependency auditing**: `npm audit` blocks on high/critical in CI

## Future expansion

The architecture is designed to support:
- **SaaS version**, multi-user, API-driven, workspace management
- **Enterprise deployment**, self-hosted, SSO, RBAC
- **Plugin system**, third-party templates and workflow modules
- **AI assistance**, LLM-powered code generation and debugging workflows
- **Ephemeral dev environments**, PR preview URLs, on-demand cloud workspaces

## Invariants

These must never be broken:
1. Scaffold operations are sandboxed to the output directory (no escaping)
2. Hook commands are allowlisted (no arbitrary shell execution)
3. No secrets in template source files
4. Every module must be independently testable
5. The interface layer must never contain business logic
