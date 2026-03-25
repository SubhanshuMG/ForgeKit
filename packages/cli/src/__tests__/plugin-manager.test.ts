// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { spawnSync } from 'child_process';
import { Command } from 'commander';
import {
  listInstalledPlugins,
  loadPlugins,
  installPlugin,
  removePlugin,
} from '../core/plugin-manager';

jest.mock('fs');
jest.mock('child_process');
jest.mock('os', () => ({
  ...jest.requireActual('os'),
  homedir: jest.fn(() => '/home/testuser'),
}));

const HOME = '/home/testuser';

const mockFs = fs as jest.Mocked<typeof fs>;
const mockSpawnSync = spawnSync as jest.MockedFunction<typeof spawnSync>;

const PLUGINS_DIR = path.join(HOME, '.forgekit', 'plugins');
const NODE_MODULES = path.join(PLUGINS_DIR, 'node_modules');

function emptySpawn(): ReturnType<typeof spawnSync> {
  return { stdout: '', stderr: '', status: 0, signal: null, pid: 0, output: ['', ''] } as unknown as ReturnType<typeof spawnSync>;
}

beforeEach(() => {
  jest.clearAllMocks();
  (os.homedir as jest.Mock).mockReturnValue(HOME);
  mockSpawnSync.mockReturnValue(emptySpawn());
});

// ── normalizePackageName / validatePluginName (tested via public API) ─────

describe('plugin name validation (via installPlugin)', () => {
  it('should reject empty plugin name', async () => {
    await expect(installPlugin('')).rejects.toThrow('must not be empty');
  });

  it('should reject plugin name with path traversal', async () => {
    await expect(installPlugin('../evil')).rejects.toThrow('Invalid plugin name');
  });

  it('should reject plugin name with slashes', async () => {
    await expect(installPlugin('foo/bar')).rejects.toThrow('Invalid plugin name');
  });

  it('should reject plugin name with backslashes', async () => {
    await expect(installPlugin('foo\\bar')).rejects.toThrow('Invalid plugin name');
  });

  it('should reject plugin name with double dots', async () => {
    await expect(installPlugin('foo..bar')).rejects.toThrow('Invalid plugin name');
  });

  it('should reject plugin name starting with special character', async () => {
    // After normalization, "-bad" becomes "forgekit-plugin--bad" which passes the
    // regex (starts with 'f'). Test a name that fails validation after normalization.
    await expect(installPlugin('$bad')).rejects.toThrow('Invalid plugin name');
  });

  it('should accept valid short name and prefix it', async () => {
    mockFs.existsSync.mockReturnValue(false);
    mockFs.mkdirSync.mockReturnValue(undefined);
    mockFs.writeFileSync.mockReturnValue(undefined);
    mockSpawnSync.mockReturnValue(emptySpawn());

    // installPlugin will call npm install -- it will fail to read package.json after
    // but the normalization itself works
    mockFs.existsSync.mockImplementation((p: fs.PathLike) => {
      const str = String(p);
      if (str.endsWith('package.json') && str.includes('node_modules')) return true;
      if (str === PLUGINS_DIR) return false;
      return false;
    });
    mockFs.readFileSync.mockReturnValue(JSON.stringify({
      name: 'forgekit-plugin-docker',
      version: '1.0.0',
      description: 'Docker plugin',
    }));

    const result = await installPlugin('docker');
    expect(result.packageName).toBe('forgekit-plugin-docker');
    expect(result.name).toBe('docker');
  });

  it('should accept already-prefixed name', async () => {
    mockFs.existsSync.mockImplementation((p: fs.PathLike) => {
      const str = String(p);
      if (str.endsWith('package.json') && str.includes('node_modules')) return true;
      if (str === PLUGINS_DIR) return false;
      return false;
    });
    mockFs.mkdirSync.mockReturnValue(undefined);
    mockFs.writeFileSync.mockReturnValue(undefined);
    mockFs.readFileSync.mockReturnValue(JSON.stringify({
      name: 'forgekit-plugin-docker',
      version: '1.0.0',
      description: 'Docker plugin',
    }));

    const result = await installPlugin('forgekit-plugin-docker');
    expect(result.packageName).toBe('forgekit-plugin-docker');
  });
});

// ── installPlugin ────────────────────────────────────────────────────────────

describe('installPlugin', () => {
  it('should throw when npm install fails', async () => {
    mockFs.existsSync.mockReturnValue(false);
    mockFs.mkdirSync.mockReturnValue(undefined);
    mockFs.writeFileSync.mockReturnValue(undefined);
    mockSpawnSync.mockReturnValue({
      ...emptySpawn(),
      status: 1,
      stderr: 'npm ERR! 404 Not Found',
    } as unknown as ReturnType<typeof spawnSync>);

    await expect(installPlugin('nonexistent')).rejects.toThrow('Failed to install plugin');
  });

  it('should throw when package.json cannot be read after install', async () => {
    mockFs.existsSync.mockImplementation((_p: fs.PathLike) => {
      // plugins dir doesn't exist, package.json in node_modules doesn't exist
      return false;
    });
    mockFs.mkdirSync.mockReturnValue(undefined);
    mockFs.writeFileSync.mockReturnValue(undefined);
    mockSpawnSync.mockReturnValue(emptySpawn());

    await expect(installPlugin('broken')).rejects.toThrow('package.json could not be read');
  });

  it('should create plugins directory if it does not exist', async () => {
    let mkdirCalled = false;
    mockFs.existsSync.mockImplementation((p: fs.PathLike) => {
      const str = String(p);
      if (str === PLUGINS_DIR) return false;
      if (str.endsWith('package.json') && str.includes(PLUGINS_DIR) && !str.includes('node_modules')) return false;
      if (str.endsWith('package.json') && str.includes('node_modules')) return true;
      return false;
    });
    mockFs.mkdirSync.mockImplementation(() => {
      mkdirCalled = true;
      return undefined;
    });
    mockFs.writeFileSync.mockReturnValue(undefined);
    mockFs.readFileSync.mockReturnValue(JSON.stringify({
      name: 'forgekit-plugin-test',
      version: '0.1.0',
      description: 'Test plugin',
    }));

    await installPlugin('test');
    expect(mkdirCalled).toBe(true);
  });
});

// ── removePlugin ─────────────────────────────────────────────────────────────

describe('removePlugin', () => {
  it('should throw when plugin is not installed', async () => {
    mockFs.existsSync.mockReturnValue(false);

    await expect(removePlugin('not-installed')).rejects.toThrow('not installed');
  });

  it('should throw when npm uninstall fails', async () => {
    // Plugin exists
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(JSON.stringify({
      name: 'forgekit-plugin-docker',
      version: '1.0.0',
      description: 'Docker',
    }));

    mockSpawnSync.mockReturnValue({
      ...emptySpawn(),
      status: 1,
      stderr: 'npm ERR! something went wrong',
    } as unknown as ReturnType<typeof spawnSync>);

    await expect(removePlugin('docker')).rejects.toThrow('Failed to remove plugin');
  });
});

// ── listInstalledPlugins ─────────────────────────────────────────────────────

describe('listInstalledPlugins', () => {
  it('should return empty array when node_modules does not exist', () => {
    mockFs.existsSync.mockReturnValue(false);
    expect(listInstalledPlugins()).toEqual([]);
  });

  it('should return only forgekit-plugin-* directories', () => {
    mockFs.existsSync.mockImplementation((p: fs.PathLike) => {
      const str = String(p);
      if (str === NODE_MODULES) return true;
      // package.json exists for our plugins
      if (str.includes('forgekit-plugin-') && str.endsWith('package.json')) return true;
      return false;
    });

    (mockFs.readdirSync as jest.Mock).mockReturnValue([
      'forgekit-plugin-docker',
      'forgekit-plugin-k8s',
      'lodash',
      'express',
    ]);

    mockFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);

    mockFs.readFileSync.mockImplementation((p: fs.PathOrFileDescriptor) => {
      const str = String(p);
      if (str.includes('forgekit-plugin-docker')) {
        return JSON.stringify({ version: '1.0.0', description: 'Docker support' });
      }
      if (str.includes('forgekit-plugin-k8s')) {
        return JSON.stringify({ version: '2.0.0', description: 'Kubernetes support' });
      }
      throw new Error('ENOENT');
    });

    const plugins = listInstalledPlugins();

    expect(plugins).toHaveLength(2);
    expect(plugins[0].name).toBe('docker');
    expect(plugins[0].packageName).toBe('forgekit-plugin-docker');
    expect(plugins[0].version).toBe('1.0.0');
    expect(plugins[1].name).toBe('k8s');
  });

  it('should sort plugins alphabetically by name', () => {
    mockFs.existsSync.mockImplementation((p: fs.PathLike) => {
      const str = String(p);
      if (str === NODE_MODULES) return true;
      if (str.includes('forgekit-plugin-') && str.endsWith('package.json')) return true;
      return false;
    });

    (mockFs.readdirSync as jest.Mock).mockReturnValue([
      'forgekit-plugin-zeta',
      'forgekit-plugin-alpha',
    ]);

    mockFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);

    mockFs.readFileSync.mockReturnValue(JSON.stringify({
      version: '1.0.0', description: 'Test',
    }));

    const plugins = listInstalledPlugins();

    expect(plugins[0].name).toBe('alpha');
    expect(plugins[1].name).toBe('zeta');
  });

  it('should skip non-directory entries', () => {
    mockFs.existsSync.mockReturnValue(true);

    (mockFs.readdirSync as jest.Mock).mockReturnValue([
      'forgekit-plugin-test',
    ]);

    mockFs.statSync.mockReturnValue({ isDirectory: () => false } as fs.Stats);

    const plugins = listInstalledPlugins();
    expect(plugins).toHaveLength(0);
  });

  it('should skip plugins with unreadable package.json', () => {
    mockFs.existsSync.mockImplementation((p: fs.PathLike) => {
      const str = String(p);
      if (str === NODE_MODULES) return true;
      if (str.endsWith('package.json')) return false;
      return false;
    });

    (mockFs.readdirSync as jest.Mock).mockReturnValue([
      'forgekit-plugin-broken',
    ]);

    mockFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);

    const plugins = listInstalledPlugins();
    expect(plugins).toHaveLength(0);
  });

  it('should handle readdirSync failure gracefully', () => {
    mockFs.existsSync.mockReturnValue(true);
    (mockFs.readdirSync as jest.Mock).mockImplementation(() => {
      throw new Error('EACCES');
    });

    const plugins = listInstalledPlugins();
    expect(plugins).toEqual([]);
  });
});

// ── loadPlugins ──────────────────────────────────────────────────────────────

describe('loadPlugins', () => {
  let program: Command;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    program = new Command();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('should do nothing when no plugins are installed', () => {
    mockFs.existsSync.mockReturnValue(false);

    loadPlugins(program);

    // No errors, no warnings
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should warn and skip plugin without register function', () => {
    // Setup: one plugin installed
    mockFs.existsSync.mockImplementation((p: fs.PathLike) => {
      const str = String(p);
      if (str === NODE_MODULES) return true;
      if (str.includes('forgekit-plugin-') && str.endsWith('package.json')) return true;
      return false;
    });
    (mockFs.readdirSync as jest.Mock).mockReturnValue([
      'forgekit-plugin-noregister',
    ]);
    mockFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);
    mockFs.readFileSync.mockReturnValue(JSON.stringify({
      version: '1.0.0', description: 'No register',
    }));

    // Mock require to return module without register
    jest.doMock(path.join(NODE_MODULES, 'forgekit-plugin-noregister'), () => ({
      name: 'noregister',
      version: '1.0.0',
    }), { virtual: true });

    loadPlugins(program);

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('does not export a register() function')
    );
  });

  it('should warn and skip plugin that throws during load', () => {
    mockFs.existsSync.mockImplementation((p: fs.PathLike) => {
      const str = String(p);
      if (str === NODE_MODULES) return true;
      if (str.includes('forgekit-plugin-') && str.endsWith('package.json')) return true;
      return false;
    });
    (mockFs.readdirSync as jest.Mock).mockReturnValue([
      'forgekit-plugin-crasher',
    ]);
    mockFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);
    mockFs.readFileSync.mockReturnValue(JSON.stringify({
      version: '1.0.0', description: 'Crasher',
    }));

    // Mock require to throw
    jest.doMock(path.join(NODE_MODULES, 'forgekit-plugin-crasher'), () => {
      throw new Error('Module initialization failed');
    }, { virtual: true });

    loadPlugins(program);

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load plugin')
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Module initialization failed')
    );
  });

  it('should successfully load and register a valid plugin', () => {
    mockFs.existsSync.mockImplementation((p: fs.PathLike) => {
      const str = String(p);
      if (str === NODE_MODULES) return true;
      if (str.includes('forgekit-plugin-') && str.endsWith('package.json')) return true;
      return false;
    });
    (mockFs.readdirSync as jest.Mock).mockReturnValue([
      'forgekit-plugin-good',
    ]);
    mockFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);
    mockFs.readFileSync.mockReturnValue(JSON.stringify({
      version: '1.0.0', description: 'Good plugin',
    }));

    const registerFn = jest.fn();
    jest.doMock(path.join(NODE_MODULES, 'forgekit-plugin-good'), () => ({
      default: {
        name: 'good',
        version: '1.0.0',
        register: registerFn,
      },
    }), { virtual: true });

    loadPlugins(program);

    expect(registerFn).toHaveBeenCalledWith(program);
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
