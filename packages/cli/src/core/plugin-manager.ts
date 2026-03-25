// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { spawnSync } from 'child_process';
import { Command } from 'commander';

/**
 * Contract that every ForgeKit plugin must satisfy.
 * Plugins are npm packages named `forgekit-plugin-*` that export
 * a default object conforming to this interface.
 */
export interface ForgeKitPlugin {
  name: string;
  version: string;
  description?: string;
  register(program: Command): void;
}

export interface InstalledPlugin {
  name: string;
  packageName: string;
  version: string;
  description: string;
}

const PLUGINS_DIR = path.join(os.homedir(), '.forgekit', 'plugins');
const NODE_MODULES_DIR = path.join(PLUGINS_DIR, 'node_modules');
const PLUGIN_PREFIX = 'forgekit-plugin-';

/**
 * Normalizes a user-provided plugin name to a full npm package name.
 * Accepts both "foo" and "forgekit-plugin-foo", returns "forgekit-plugin-foo".
 */
function normalizePackageName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Plugin name must not be empty.');
  }
  if (trimmed.startsWith(PLUGIN_PREFIX)) {
    return trimmed;
  }
  return `${PLUGIN_PREFIX}${trimmed}`;
}

/**
 * Extracts the short display name from a full package name.
 * "forgekit-plugin-docker" -> "docker"
 */
function shortName(packageName: string): string {
  if (packageName.startsWith(PLUGIN_PREFIX)) {
    return packageName.slice(PLUGIN_PREFIX.length);
  }
  return packageName;
}

/**
 * Validates that a plugin name contains only safe characters.
 * Prevents path traversal and command injection via malicious names.
 */
function validatePluginName(name: string): void {
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(name)) {
    throw new Error(
      `Invalid plugin name "${name}". Names must start with a letter or digit ` +
      `and contain only letters, digits, dots, hyphens, and underscores.`
    );
  }
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    throw new Error(
      `Invalid plugin name "${name}". Names must not contain path separators or "..".`
    );
  }
}

function ensurePluginsDir(): void {
  if (!fs.existsSync(PLUGINS_DIR)) {
    fs.mkdirSync(PLUGINS_DIR, { recursive: true, mode: 0o755 });
  }
  // npm install --prefix needs a package.json in the target directory
  const pkgJsonPath = path.join(PLUGINS_DIR, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) {
    fs.writeFileSync(pkgJsonPath, JSON.stringify({
      name: 'forgekit-plugins',
      version: '1.0.0',
      private: true,
      description: 'ForgeKit plugin host directory',
    }, null, 2), 'utf-8');
  }
}

/**
 * Reads the package.json of an installed plugin and returns its metadata.
 * Returns null if the directory does not exist or the package.json is unreadable.
 */
function readPluginPackageJson(packageName: string): InstalledPlugin | null {
  const pkgDir = path.join(NODE_MODULES_DIR, packageName);
  const pkgJsonPath = path.join(pkgDir, 'package.json');
  try {
    if (!fs.existsSync(pkgJsonPath)) {
      return null;
    }
    const raw = fs.readFileSync(pkgJsonPath, 'utf-8');
    const pkg = JSON.parse(raw);
    return {
      name: shortName(packageName),
      packageName,
      version: typeof pkg.version === 'string' ? pkg.version : '0.0.0',
      description: typeof pkg.description === 'string' ? pkg.description : '',
    };
  } catch {
    return null;
  }
}

/**
 * Install a plugin by name. Runs `npm install` in the plugins directory.
 * Returns metadata about the installed plugin.
 */
export async function installPlugin(name: string): Promise<InstalledPlugin> {
  const packageName = normalizePackageName(name);
  validatePluginName(packageName);
  ensurePluginsDir();

  const result = spawnSync('npm', ['install', '--save', packageName], {
    cwd: PLUGINS_DIR,
    encoding: 'utf-8',
    timeout: 120_000,
    env: { ...process.env, NODE_ENV: '' },
  });

  if (result.status !== 0) {
    const stderr = (result.stderr || '').trim();
    const message = stderr || result.error?.message || 'Unknown error';
    throw new Error(`Failed to install plugin "${packageName}": ${message}`);
  }

  const installed = readPluginPackageJson(packageName);
  if (!installed) {
    throw new Error(
      `Plugin "${packageName}" was installed but its package.json could not be read. ` +
      `The package may not be a valid ForgeKit plugin.`
    );
  }

  return installed;
}

/**
 * Remove an installed plugin. Runs `npm uninstall` in the plugins directory.
 */
export async function removePlugin(name: string): Promise<void> {
  const packageName = normalizePackageName(name);
  validatePluginName(packageName);

  const existing = readPluginPackageJson(packageName);
  if (!existing) {
    throw new Error(`Plugin "${shortName(packageName)}" is not installed.`);
  }

  const result = spawnSync('npm', ['uninstall', '--save', packageName], {
    cwd: PLUGINS_DIR,
    encoding: 'utf-8',
    timeout: 60_000,
    env: { ...process.env, NODE_ENV: '' },
  });

  if (result.status !== 0) {
    const stderr = (result.stderr || '').trim();
    const message = stderr || result.error?.message || 'Unknown error';
    throw new Error(`Failed to remove plugin "${packageName}": ${message}`);
  }
}

/**
 * List all installed plugins by scanning node_modules for forgekit-plugin-* directories.
 */
export function listInstalledPlugins(): InstalledPlugin[] {
  if (!fs.existsSync(NODE_MODULES_DIR)) {
    return [];
  }

  const plugins: InstalledPlugin[] = [];
  let entries: string[];

  try {
    entries = fs.readdirSync(NODE_MODULES_DIR);
  } catch {
    return [];
  }

  for (const entry of entries) {
    if (!entry.startsWith(PLUGIN_PREFIX)) {
      continue;
    }

    // Skip hidden files and non-directories
    const entryPath = path.join(NODE_MODULES_DIR, entry);
    try {
      const stat = fs.statSync(entryPath);
      if (!stat.isDirectory()) {
        continue;
      }
    } catch {
      continue;
    }

    const plugin = readPluginPackageJson(entry);
    if (plugin) {
      plugins.push(plugin);
    }
  }

  return plugins.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Load all installed plugins and register their commands with the program.
 * Each plugin is loaded in isolation -- a failing plugin is logged and skipped
 * so it never crashes the entire CLI.
 */
export function loadPlugins(program: Command): void {
  const plugins = listInstalledPlugins();

  for (const pluginMeta of plugins) {
    const modulePath = path.join(NODE_MODULES_DIR, pluginMeta.packageName);

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require(modulePath);
      const plugin: ForgeKitPlugin = mod.default || mod;

      if (typeof plugin.register !== 'function') {
        console.warn(
          `Warning: Plugin "${pluginMeta.name}" does not export a register() function. Skipping.`
        );
        continue;
      }

      plugin.register(program);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(
        `Warning: Failed to load plugin "${pluginMeta.name}": ${message}. Skipping.`
      );
    }
  }
}
