# Template Authoring Guide

How to create a new ForgeKit template.

## What is a template?

A template is a directory of source files plus a manifest (`template.json`, embedded in `registry.json`) that describes:
- Template metadata (name, description, stack)
- Which files to render and where to put them
- Post-scaffold hooks (e.g. `npm install`)
- User-facing variables

## Directory structure

```
templates/
  my-template/
    README.md.hbs        # Handlebars template
    package.json.hbs     # Handlebars template
    src/
      index.ts           # Plain file (copied as-is)
    .gitignore           # Plain file
```

## Manifest entry (in `templates/registry.json`)

Add your template to the `templates` array:

```json
{
  "id": "my-template",
  "name": "My Template (Node + Something)",
  "description": "One sentence describing what this scaffolds",
  "stack": ["node", "typescript"],
  "version": "1.0.0",
  "author": "your-github-username",
  "files": [
    { "src": "package.json.hbs", "dest": "package.json" },
    { "src": "README.md.hbs", "dest": "README.md" },
    { "src": "src/index.ts", "dest": "src/index.ts" },
    { "src": ".gitignore", "dest": ".gitignore" }
  ],
  "hooks": [
    { "type": "post-scaffold", "command": "npm", "args": ["install"] }
  ],
  "variables": [
    { "name": "name", "prompt": "Project name", "type": "string", "default": "my-project" }
  ]
}
```

## Handlebars templating

Files ending in `.hbs` are rendered with [Handlebars](https://handlebarsjs.com/). The following variables are available:

| Variable | Value |
|----------|-------|
| `{{name}}` | The project name entered by the user |
| Any custom variable from your manifest | As defined in `variables[]` |

**Always escape output with `{{variable}}`** (double braces). Never use triple braces `{{{variable}}}` for user-provided data, it disables HTML escaping.

**Example `package.json.hbs`:**
```hbs
{
  "name": "{{name}}",
  "version": "0.1.0"
}
```

## Security rules

Your template **must** follow these rules or the PR will be rejected:

1. **No path traversal**, `dest` paths must never start with `..` or `/`
2. **No arbitrary hooks**, `command` must be one of: `npm`, `npx`, `yarn`, `pnpm`, `pip`, `pip3`, `python`, `python3`
3. **No real credentials**, use placeholder values in `.env.example` (e.g. `SECRET_KEY=change-me`)
4. **No network calls** in template source files
5. **Use `.env.example`**, never a real `.env` file

## What makes a great template

- **Runs on first scaffold**, `npm run dev` or `uvicorn main:app` must work immediately
- **Includes a README**, explains what was scaffolded and how to run it
- **Includes tests**, at least one passing test
- **Includes a Dockerfile**, for reproducibility
- **Includes `.gitignore`** and `.env.example`
- **Minimal dependencies**, only what's needed to run
- **Works on macOS, Linux, and Windows**

## Contributing a template

1. Fork the repo
2. Create your template directory under `templates/`
3. Add your entry to `templates/registry.json`
4. Run the smoke test locally:
   ```bash
   npm run build --workspace=packages/cli
   node packages/cli/dist/index.js new test-project --template my-template --skip-install --dir /tmp
   ```
5. Verify the output runs correctly
6. Open a PR with the label `area/templates`

See [CONTRIBUTING.md](../CONTRIBUTING.md) for the full contribution workflow.
