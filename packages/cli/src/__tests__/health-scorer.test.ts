// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';
import { calculateHealth } from '../core/health-scorer';

jest.mock('fs');
jest.mock('child_process');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockSpawnSync = spawnSync as jest.MockedFunction<typeof spawnSync>;

const PROJECT = '/tmp/test-project';

/**
 * Helper: configure which files "exist" in the mocked filesystem.
 * Accepts a set of relative paths (relative to PROJECT).
 */
function setExistingFiles(files: Set<string>): void {
  mockFs.existsSync.mockImplementation((p: fs.PathLike) => {
    const rel = path.relative(PROJECT, String(p));
    return files.has(rel) || files.has(String(p));
  });
}

/**
 * Helper: configure readFileSync to return specific content per path.
 */
function setFileContents(contents: Record<string, string>): void {
  mockFs.readFileSync.mockImplementation((p: fs.PathOrFileDescriptor, _opts?: unknown) => {
    const key = String(p);
    for (const [pattern, content] of Object.entries(contents)) {
      if (key.endsWith(pattern) || key === pattern) return content;
    }
    throw new Error(`ENOENT: no such file: ${key}`);
  });
}

/** Return a "clean" spawnSync result with no output. */
function emptySpawn(): ReturnType<typeof spawnSync> {
  return { stdout: '', stderr: '', status: 0, signal: null, pid: 0, output: ['', ''] } as unknown as ReturnType<typeof spawnSync>;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSpawnSync.mockReturnValue(emptySpawn());
});

// ── Grade calculation ────────────────────────────────────────────────────────

describe('health-scorer grade boundaries', () => {
  // To test grade boundaries, we mock a project where all checks pass (score ~100)
  // and one where nothing passes (score ~0).

  it('should return grade A+ for a project with all checks passing', async () => {
    const fullFiles = new Set([
      '.gitignore',
      'package-lock.json',
      'package.json',
      '.eslintrc.json',
      'tsconfig.json',
      'src',
      'test',
      'jest.config.js',
      'README.md',
      'CONTRIBUTING.md',
      'LICENSE',
      'CHANGELOG.md',
      '.github/workflows',
      'Dockerfile',
      'vercel.json',
      '.editorconfig',
    ]);
    setExistingFiles(fullFiles);

    const readmeContent = Array(60).fill('line').join('\n');
    const pkgJson = JSON.stringify({
      name: 'test-project',
      version: '1.0.0',
      description: 'A test project',
      license: 'MIT',
      scripts: { test: 'jest' },
    });
    setFileContents({
      'README.md': readmeContent,
      'package.json': pkgJson,
    });

    // npm audit returns no critical vulnerabilities
    mockSpawnSync.mockImplementation((cmd: string, args?: readonly string[]) => {
      if (cmd === 'npm' && args?.[0] === 'audit') {
        return {
          ...emptySpawn(),
          stdout: JSON.stringify({ metadata: { vulnerabilities: { critical: 0 } } }),
        } as unknown as ReturnType<typeof spawnSync>;
      }
      if (cmd === 'find') {
        return { ...emptySpawn(), stdout: 'file.test.ts\n' } as unknown as ReturnType<typeof spawnSync>;
      }
      return emptySpawn();
    });

    const report = await calculateHealth(PROJECT);

    expect(report.score).toBeGreaterThanOrEqual(90);
    expect(['A+', 'A']).toContain(report.grade);
  });

  it('should return grade F for a bare project with nothing', async () => {
    setExistingFiles(new Set());
    setFileContents({});

    const report = await calculateHealth(PROJECT);

    expect(report.grade).toBe('F');
    expect(report.score).toBeLessThan(60);
  });

  it('should produce suggestions for missing files', async () => {
    setExistingFiles(new Set());
    setFileContents({});

    const report = await calculateHealth(PROJECT);

    const suggestions = report.checks
      .filter(c => c.suggestion)
      .map(c => c.suggestion);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.some(s => s!.includes('.gitignore'))).toBe(true);
    expect(suggestions.some(s => s!.includes('LICENSE'))).toBe(true);
  });
});

// ── Category scores ──────────────────────────────────────────────────────────

describe('health-scorer category scores', () => {
  it('should produce category scores for all five categories', async () => {
    setExistingFiles(new Set());
    setFileContents({});

    const report = await calculateHealth(PROJECT);

    expect(report.categoryScores).toBeDefined();
    expect(Object.keys(report.categoryScores)).toEqual(
      expect.arrayContaining(['security', 'quality', 'testing', 'documentation', 'devops'])
    );
  });

  it('should calculate correct percentage per category', async () => {
    setExistingFiles(new Set(['.gitignore', 'package-lock.json']));
    setFileContents({});

    const report = await calculateHealth(PROJECT);

    // Security category should have some earned points from gitignore + lockfile
    const security = report.categoryScores['security'];
    expect(security).toBeDefined();
    expect(security.earned).toBeGreaterThan(0);
    expect(security.max).toBeGreaterThan(0);
    expect(security.percentage).toBe(Math.round((security.earned / security.max) * 100));
  });
});

// ── Individual checks ────────────────────────────────────────────────────────

describe('health-scorer individual checks', () => {
  it('should give full score when gitignore exists', async () => {
    setExistingFiles(new Set(['.gitignore']));
    setFileContents({});

    const report = await calculateHealth(PROJECT);
    const check = report.checks.find(c => c.name === 'Has .gitignore');

    expect(check).toBeDefined();
    expect(check!.passed).toBe(true);
    expect(check!.score).toBe(check!.weight);
    expect(check!.suggestion).toBeUndefined();
  });

  it('should give zero score and suggestion when gitignore is missing', async () => {
    setExistingFiles(new Set());
    setFileContents({});

    const report = await calculateHealth(PROJECT);
    const check = report.checks.find(c => c.name === 'Has .gitignore');

    expect(check).toBeDefined();
    expect(check!.passed).toBe(false);
    expect(check!.score).toBe(0);
    expect(check!.suggestion).toBeDefined();
  });

  it('should detect any lockfile format', async () => {
    setExistingFiles(new Set(['yarn.lock']));
    setFileContents({});

    const report = await calculateHealth(PROJECT);
    const check = report.checks.find(c => c.name === 'Has lockfile');

    expect(check).toBeDefined();
    expect(check!.passed).toBe(true);
  });

  it('should detect secrets when grep finds matches', async () => {
    // checkNoSecrets checks dirs: src, lib, app, "." — we need at least one to exist
    setExistingFiles(new Set(['src']));
    mockSpawnSync.mockImplementation((cmd: string) => {
      if (cmd === 'grep') {
        return { ...emptySpawn(), stdout: 'src/config.ts\n' } as unknown as ReturnType<typeof spawnSync>;
      }
      return emptySpawn();
    });

    const report = await calculateHealth(PROJECT);
    const check = report.checks.find(c => c.name === 'No hardcoded secrets');

    expect(check).toBeDefined();
    expect(check!.passed).toBe(false);
    expect(check!.suggestion).toContain('secrets');
  });

  it('should pass secrets check when grep returns nothing', async () => {
    setExistingFiles(new Set(['src']));
    mockSpawnSync.mockReturnValue(emptySpawn());

    const report = await calculateHealth(PROJECT);
    const check = report.checks.find(c => c.name === 'No hardcoded secrets');

    expect(check).toBeDefined();
    expect(check!.passed).toBe(true);
  });

  it('should check package.json fields completeness', async () => {
    setExistingFiles(new Set(['package.json']));
    setFileContents({
      'package.json': JSON.stringify({ name: 'test', version: '1.0.0' }),
    });

    const report = await calculateHealth(PROJECT);
    const check = report.checks.find(c => c.name === 'Package.json complete');

    expect(check).toBeDefined();
    // Only 2 of 4 fields present, so partial score
    expect(check!.passed).toBe(false);
    expect(check!.score).toBe(Math.round((2 / 4) * 5));
    expect(check!.suggestion).toContain('description');
    expect(check!.suggestion).toContain('license');
  });

  it('should detect README with enough lines', async () => {
    setExistingFiles(new Set(['README.md']));
    setFileContents({
      'README.md': Array(60).fill('content').join('\n'),
    });

    const report = await calculateHealth(PROJECT);
    const check = report.checks.find(c => c.name === 'Has comprehensive README');

    expect(check).toBeDefined();
    expect(check!.passed).toBe(true);
  });

  it('should flag short README', async () => {
    setExistingFiles(new Set(['README.md']));
    setFileContents({
      'README.md': '# Hello\n\nShort readme.\n',
    });

    const report = await calculateHealth(PROJECT);
    const check = report.checks.find(c => c.name === 'Has comprehensive README');

    expect(check).toBeDefined();
    expect(check!.passed).toBe(false);
    expect(check!.suggestion).toContain('lines');
  });

  it('should detect test script (and reject default placeholder)', async () => {
    setExistingFiles(new Set(['package.json']));
    setFileContents({
      'package.json': JSON.stringify({
        scripts: { test: 'echo "Error: no test specified" && exit 1' },
      }),
    });

    const report = await calculateHealth(PROJECT);
    const check = report.checks.find(c => c.name === 'Has test script');

    expect(check).toBeDefined();
    expect(check!.passed).toBe(false);
  });

  it('should detect a real test script', async () => {
    setExistingFiles(new Set(['package.json']));
    setFileContents({
      'package.json': JSON.stringify({ scripts: { test: 'jest' } }),
    });

    const report = await calculateHealth(PROJECT);
    const check = report.checks.find(c => c.name === 'Has test script');

    expect(check).toBeDefined();
    expect(check!.passed).toBe(true);
  });

  it('should handle npm audit with critical vulnerabilities', async () => {
    setExistingFiles(new Set(['package.json']));
    setFileContents({
      'package.json': JSON.stringify({ name: 'test' }),
    });
    mockSpawnSync.mockImplementation((cmd: string, args?: readonly string[]) => {
      if (cmd === 'npm' && args?.[0] === 'audit') {
        return {
          ...emptySpawn(),
          stdout: JSON.stringify({ metadata: { vulnerabilities: { critical: 3 } } }),
        } as unknown as ReturnType<typeof spawnSync>;
      }
      return emptySpawn();
    });

    const report = await calculateHealth(PROJECT);
    const check = report.checks.find(c => c.name === 'No critical vulnerabilities');

    expect(check).toBeDefined();
    expect(check!.passed).toBe(false);
    expect(check!.suggestion).toContain('3');
  });

  it('should handle TODO count check', async () => {
    setExistingFiles(new Set(['src']));
    mockSpawnSync.mockImplementation((cmd: string, args?: readonly string[]) => {
      if (cmd === 'grep' && args?.includes('TODO')) {
        return {
          ...emptySpawn(),
          stdout: Array(15).fill('/tmp/test-project/src/file.ts').join('\n'),
        } as unknown as ReturnType<typeof spawnSync>;
      }
      return emptySpawn();
    });

    const report = await calculateHealth(PROJECT);
    const check = report.checks.find(c => c.name === 'Low TODO/FIXME count');

    expect(check).toBeDefined();
    expect(check!.passed).toBe(false);
    expect(check!.suggestion).toContain('TODO');
  });
});

// ── Normalized score calculation ─────────────────────────────────────────────

describe('health-scorer score normalization', () => {
  it('should normalize score to 0-100 range', async () => {
    setExistingFiles(new Set());
    setFileContents({});

    const report = await calculateHealth(PROJECT);

    expect(report.score).toBeGreaterThanOrEqual(0);
    expect(report.score).toBeLessThanOrEqual(100);
  });

  it('should have totalScore equal to sum of individual check scores', async () => {
    setExistingFiles(new Set(['.gitignore', 'LICENSE']));
    setFileContents({});

    const report = await calculateHealth(PROJECT);

    const totalEarned = report.checks.reduce((sum, c) => sum + c.score, 0);
    const totalMax = report.checks.reduce((sum, c) => sum + c.weight, 0);
    const expected = Math.round((totalEarned / totalMax) * 100);
    expect(report.score).toBe(expected);
  });
});
