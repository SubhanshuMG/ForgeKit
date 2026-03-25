# ForgeKit Scaffold Action

Scaffold production-ready projects inside any GitHub Actions workflow.

## Quick Start

```yaml
- uses: SubhanshuMG/ForgeKit/action@v1
  with:
    template: web-app
    name: my-app
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `template` | yes | — | Template ID (`web-app`, `api-service`, `ml-pipeline`, `next-app`, `go-api`, `serverless`) |
| `name` | yes | — | Project name |
| `output-dir` | no | `.` | Output directory |
| `skip-install` | no | `false` | Skip dependency installation |
| `version` | no | `latest` | forgekit-cli version |

## Outputs

| Output | Description |
|--------|-------------|
| `project-path` | Absolute path to the scaffolded project |
| `files-created` | Number of files created |

## Examples

### Basic

```yaml
name: Scaffold
on: [push]
jobs:
  scaffold:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: SubhanshuMG/ForgeKit/action@v1
        with:
          template: web-app
          name: my-app
```

### Matrix build

```yaml
jobs:
  scaffold:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        template: [web-app, api-service, ml-pipeline]
    steps:
      - uses: actions/checkout@v4
      - id: scaffold
        uses: SubhanshuMG/ForgeKit/action@v1
        with:
          template: ${{ matrix.template }}
          name: test-${{ matrix.template }}
          skip-install: true
      - run: ls "${{ steps.scaffold.outputs.project-path }}"
```
