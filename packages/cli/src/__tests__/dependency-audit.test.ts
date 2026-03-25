// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';
import { detectPackageManager, runAudit } from '../core/dependency-audit';

jest.mock('fs');
jest.mock('child_process');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockSpawnSync = spawnSync as jest.MockedFunction<typeof spawnSync>;

const PROJECT = '/tmp/test-project';

function emptySpawn(): ReturnType<typeof spawnSync> {
  return { stdout: '', stderr: '', status: 0, signal: null, pid: 0, output: ['', ''] } as unknown as ReturnType<typeof spawnSync>;
}

function setExistingFiles(files: Set<string>): void {
  mockFs.existsSync.mockImplementation((p: fs.PathLike) => {
    const rel = path.relative(PROJECT, String(p));
    return files.has(rel);
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSpawnSync.mockReturnValue(emptySpawn());
});

// ── detectPackageManager ─────────────────────────────────────────────────────

describe('detectPackageManager', () => {
  it('should detect pnpm from pnpm-lock.yaml', () => {
    setExistingFiles(new Set(['pnpm-lock.yaml', 'package.json']));
    expect(detectPackageManager(PROJECT)).toBe('pnpm');
  });

  it('should detect yarn from yarn.lock', () => {
    setExistingFiles(new Set(['yarn.lock', 'package.json']));
    expect(detectPackageManager(PROJECT)).toBe('yarn');
  });

  it('should detect npm from package-lock.json', () => {
    setExistingFiles(new Set(['package-lock.json', 'package.json']));
    expect(detectPackageManager(PROJECT)).toBe('npm');
  });

  it('should detect npm from package.json alone (fallback)', () => {
    setExistingFiles(new Set(['package.json']));
    expect(detectPackageManager(PROJECT)).toBe('npm');
  });

  it('should detect pip from Pipfile', () => {
    setExistingFiles(new Set(['Pipfile']));
    expect(detectPackageManager(PROJECT)).toBe('pip');
  });

  it('should detect pip from requirements.txt', () => {
    setExistingFiles(new Set(['requirements.txt']));
    expect(detectPackageManager(PROJECT)).toBe('pip');
  });

  it('should return null when no package manager files exist', () => {
    setExistingFiles(new Set());
    expect(detectPackageManager(PROJECT)).toBeNull();
  });

  it('should prioritize pnpm over yarn and npm', () => {
    setExistingFiles(new Set(['pnpm-lock.yaml', 'yarn.lock', 'package-lock.json']));
    expect(detectPackageManager(PROJECT)).toBe('pnpm');
  });

  it('should prioritize yarn over npm', () => {
    setExistingFiles(new Set(['yarn.lock', 'package-lock.json']));
    expect(detectPackageManager(PROJECT)).toBe('yarn');
  });
});

// ── runAudit ─────────────────────────────────────────────────────────────────

describe('runAudit', () => {
  it('should throw when no package manager is found', async () => {
    setExistingFiles(new Set());
    await expect(runAudit(PROJECT)).rejects.toThrow('No recognized package manager found');
  });

  it('should return clean audit result with no vulnerabilities', async () => {
    setExistingFiles(new Set(['package.json']));

    mockSpawnSync.mockImplementation((cmd: string, args?: readonly string[]) => {
      if (cmd === 'npm' && args?.[0] === 'audit') {
        return {
          ...emptySpawn(),
          stdout: JSON.stringify({
            metadata: { vulnerabilities: { critical: 0, high: 0, moderate: 0, low: 0, total: 0 } },
          }),
        } as unknown as ReturnType<typeof spawnSync>;
      }
      if (cmd === 'npm' && args?.[0] === 'outdated') {
        return { ...emptySpawn(), stdout: '{}' } as unknown as ReturnType<typeof spawnSync>;
      }
      return emptySpawn();
    });

    const result = await runAudit(PROJECT);

    expect(result.packageManager).toBe('npm');
    expect(result.vulnerabilities.critical).toBe(0);
    expect(result.vulnerabilities.total).toBe(0);
    expect(result.outdated).toHaveLength(0);
    expect(result.score).toBe(100);
  });

  it('should parse vulnerability counts correctly', async () => {
    setExistingFiles(new Set(['package.json']));

    mockSpawnSync.mockImplementation((cmd: string, args?: readonly string[]) => {
      if (cmd === 'npm' && args?.[0] === 'audit') {
        return {
          ...emptySpawn(),
          stdout: JSON.stringify({
            metadata: { vulnerabilities: { critical: 2, high: 3, moderate: 5, low: 10, total: 20 } },
          }),
        } as unknown as ReturnType<typeof spawnSync>;
      }
      if (cmd === 'npm' && args?.[0] === 'outdated') {
        return { ...emptySpawn(), stdout: '{}' } as unknown as ReturnType<typeof spawnSync>;
      }
      return emptySpawn();
    });

    const result = await runAudit(PROJECT);

    expect(result.vulnerabilities.critical).toBe(2);
    expect(result.vulnerabilities.high).toBe(3);
    expect(result.vulnerabilities.moderate).toBe(5);
    expect(result.vulnerabilities.low).toBe(10);
    expect(result.vulnerabilities.total).toBe(20);
  });

  it('should deduct score based on vulnerability severity', async () => {
    setExistingFiles(new Set(['package.json']));

    mockSpawnSync.mockImplementation((cmd: string, args?: readonly string[]) => {
      if (cmd === 'npm' && args?.[0] === 'audit') {
        return {
          ...emptySpawn(),
          stdout: JSON.stringify({
            metadata: { vulnerabilities: { critical: 1, high: 1, moderate: 0, low: 0 } },
          }),
        } as unknown as ReturnType<typeof spawnSync>;
      }
      if (cmd === 'npm' && args?.[0] === 'outdated') {
        return { ...emptySpawn(), stdout: '{}' } as unknown as ReturnType<typeof spawnSync>;
      }
      return emptySpawn();
    });

    const result = await runAudit(PROJECT);

    // 100 - (1*20) - (1*10) = 70
    expect(result.score).toBe(70);
  });

  it('should classify outdated packages as major/minor/patch', async () => {
    setExistingFiles(new Set(['package.json']));

    mockSpawnSync.mockImplementation((cmd: string, args?: readonly string[]) => {
      if (cmd === 'npm' && args?.[0] === 'audit') {
        return {
          ...emptySpawn(),
          stdout: JSON.stringify({ metadata: { vulnerabilities: {} } }),
        } as unknown as ReturnType<typeof spawnSync>;
      }
      if (cmd === 'npm' && args?.[0] === 'outdated') {
        return {
          ...emptySpawn(),
          stdout: JSON.stringify({
            lodash: { current: '3.10.1', wanted: '3.10.1', latest: '4.17.21' },
            chalk: { current: '4.1.0', wanted: '4.1.2', latest: '4.2.0' },
            debug: { current: '4.3.1', wanted: '4.3.4', latest: '4.3.4' },
          }),
        } as unknown as ReturnType<typeof spawnSync>;
      }
      return emptySpawn();
    });

    const result = await runAudit(PROJECT);

    expect(result.outdated).toHaveLength(3);

    const lodash = result.outdated.find(p => p.name === 'lodash');
    expect(lodash).toBeDefined();
    expect(lodash!.type).toBe('major');
    expect(lodash!.current).toBe('3.10.1');
    expect(lodash!.latest).toBe('4.17.21');

    const chalk = result.outdated.find(p => p.name === 'chalk');
    expect(chalk).toBeDefined();
    expect(chalk!.type).toBe('minor');

    const debug = result.outdated.find(p => p.name === 'debug');
    expect(debug).toBeDefined();
    expect(debug!.type).toBe('patch');
  });

  it('should deduct score for outdated major packages', async () => {
    setExistingFiles(new Set(['package.json']));

    mockSpawnSync.mockImplementation((cmd: string, args?: readonly string[]) => {
      if (cmd === 'npm' && args?.[0] === 'audit') {
        return {
          ...emptySpawn(),
          stdout: JSON.stringify({ metadata: { vulnerabilities: {} } }),
        } as unknown as ReturnType<typeof spawnSync>;
      }
      if (cmd === 'npm' && args?.[0] === 'outdated') {
        return {
          ...emptySpawn(),
          stdout: JSON.stringify({
            a: { current: '1.0.0', wanted: '1.0.0', latest: '2.0.0' },
            b: { current: '3.0.0', wanted: '3.0.0', latest: '4.0.0' },
          }),
        } as unknown as ReturnType<typeof spawnSync>;
      }
      return emptySpawn();
    });

    const result = await runAudit(PROJECT);

    // 100 - (2 major * 5) = 90
    expect(result.score).toBe(90);
  });

  it('should clamp score to 0 when many vulnerabilities exist', async () => {
    setExistingFiles(new Set(['package.json']));

    mockSpawnSync.mockImplementation((cmd: string, args?: readonly string[]) => {
      if (cmd === 'npm' && args?.[0] === 'audit') {
        return {
          ...emptySpawn(),
          stdout: JSON.stringify({
            metadata: { vulnerabilities: { critical: 10, high: 10, moderate: 10, low: 10 } },
          }),
        } as unknown as ReturnType<typeof spawnSync>;
      }
      if (cmd === 'npm' && args?.[0] === 'outdated') {
        return { ...emptySpawn(), stdout: '{}' } as unknown as ReturnType<typeof spawnSync>;
      }
      return emptySpawn();
    });

    const result = await runAudit(PROJECT);

    expect(result.score).toBe(0);
  });

  it('should handle npm audit failure gracefully (returns zero vulns)', async () => {
    setExistingFiles(new Set(['package.json']));

    mockSpawnSync.mockImplementation((cmd: string, args?: readonly string[]) => {
      if (cmd === 'npm' && args?.[0] === 'audit') {
        throw new Error('npm audit failed');
      }
      if (cmd === 'npm' && args?.[0] === 'outdated') {
        return { ...emptySpawn(), stdout: '{}' } as unknown as ReturnType<typeof spawnSync>;
      }
      return emptySpawn();
    });

    const result = await runAudit(PROJECT);

    expect(result.vulnerabilities.critical).toBe(0);
    expect(result.vulnerabilities.total).toBe(0);
  });

  it('should handle npm outdated failure gracefully (returns empty list)', async () => {
    setExistingFiles(new Set(['package.json']));

    mockSpawnSync.mockImplementation((cmd: string, args?: readonly string[]) => {
      if (cmd === 'npm' && args?.[0] === 'audit') {
        return {
          ...emptySpawn(),
          stdout: JSON.stringify({ metadata: { vulnerabilities: {} } }),
        } as unknown as ReturnType<typeof spawnSync>;
      }
      if (cmd === 'npm' && args?.[0] === 'outdated') {
        throw new Error('npm outdated failed');
      }
      return emptySpawn();
    });

    const result = await runAudit(PROJECT);

    expect(result.outdated).toHaveLength(0);
  });

  it('should skip outdated entries with missing current or latest fields', async () => {
    setExistingFiles(new Set(['package.json']));

    mockSpawnSync.mockImplementation((cmd: string, args?: readonly string[]) => {
      if (cmd === 'npm' && args?.[0] === 'audit') {
        return {
          ...emptySpawn(),
          stdout: JSON.stringify({ metadata: { vulnerabilities: {} } }),
        } as unknown as ReturnType<typeof spawnSync>;
      }
      if (cmd === 'npm' && args?.[0] === 'outdated') {
        return {
          ...emptySpawn(),
          stdout: JSON.stringify({
            incomplete: { wanted: '1.0.0' },
          }),
        } as unknown as ReturnType<typeof spawnSync>;
      }
      return emptySpawn();
    });

    const result = await runAudit(PROJECT);

    expect(result.outdated).toHaveLength(0);
  });

  it('should compute total from individual counts when total is missing', async () => {
    setExistingFiles(new Set(['package.json']));

    mockSpawnSync.mockImplementation((cmd: string, args?: readonly string[]) => {
      if (cmd === 'npm' && args?.[0] === 'audit') {
        return {
          ...emptySpawn(),
          stdout: JSON.stringify({
            metadata: { vulnerabilities: { critical: 1, high: 2, moderate: 3, low: 4 } },
          }),
        } as unknown as ReturnType<typeof spawnSync>;
      }
      if (cmd === 'npm' && args?.[0] === 'outdated') {
        return { ...emptySpawn(), stdout: '{}' } as unknown as ReturnType<typeof spawnSync>;
      }
      return emptySpawn();
    });

    const result = await runAudit(PROJECT);

    expect(result.vulnerabilities.total).toBe(10);
  });
});
