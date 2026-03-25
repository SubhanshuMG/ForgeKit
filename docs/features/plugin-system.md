---
title: Plugin System
description: Extend ForgeKit with community plugins.
---

# Plugin System

ForgeKit supports a plugin system that lets you extend the CLI with new commands from the community.

## Usage

```bash
forgekit plugin <subcommand>
```

### Subcommands

| Subcommand | Description |
|------------|-------------|
| `add <name>` | Install a plugin from npm |
| `remove <name>` | Uninstall a plugin |
| `list` | List all installed plugins |

### Examples

```bash
# Install a plugin
forgekit plugin add forgekit-plugin-terraform

# Remove a plugin
forgekit plugin remove forgekit-plugin-terraform

# Skip confirmation on remove
forgekit plugin remove forgekit-plugin-terraform -y

# List installed plugins
forgekit plugin list
```

## How Plugins Work

1. Plugins are npm packages named `forgekit-plugin-*`
2. They are installed to `~/.forgekit/plugins/`
3. On CLI startup, ForgeKit loads all installed plugins and registers their commands
4. Bad plugins are safely skipped and never crash the CLI

## Writing a Plugin

A ForgeKit plugin is an npm package that exports a `register` function:

```typescript
// forgekit-plugin-example/index.js
module.exports = {
  register(program) {
    program
      .command('example')
      .description('An example plugin command')
      .action(() => {
        console.log('Hello from the example plugin!');
      });
  }
};
```

### Plugin Requirements

- Package name must start with `forgekit-plugin-`
- Must export a `register(program)` function
- The `program` argument is a [Commander.js](https://github.com/tj/commander.js) instance
- Must not throw during registration
- Must not block the event loop during loading

### Package.json

```json
{
  "name": "forgekit-plugin-example",
  "version": "1.0.0",
  "description": "An example ForgeKit plugin",
  "main": "index.js",
  "keywords": ["forgekit", "forgekit-plugin"]
}
```

## Plugin Safety

ForgeKit takes several precautions with plugins:

- **Name validation**: Plugin names are validated against path traversal attacks
- **Isolated loading**: Each plugin is loaded in a try/catch; failures are logged as warnings, not errors
- **No crash guarantee**: If a plugin fails to load or register, the CLI continues normally
- **Skip flag**: Use `--no-plugins` to start ForgeKit without loading any plugins

```bash
# Run without plugins
forgekit --no-plugins new my-app
```

## Plugin Storage

Plugins are installed to:

```
~/.forgekit/plugins/
  node_modules/
    forgekit-plugin-terraform/
    forgekit-plugin-example/
  package.json
```

## Configuration

You can track your preferred plugins in the config file:

```json
// ~/.forgekit/config.json
{
  "plugins": [
    "forgekit-plugin-terraform",
    "forgekit-plugin-example"
  ]
}
```
