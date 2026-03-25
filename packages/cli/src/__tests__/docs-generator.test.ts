// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import * as fs from 'fs';
import * as path from 'path';
import { analyzeProject, generateReadme } from '../core/docs-generator';
import { ProjectAnalysis } from '../types';

jest.mock('fs');

const mockFs = fs as jest.Mocked<typeof fs>;

const PROJECT = '/tmp/test-project';

function setExistingFiles(files: Set<string>): void {
  mockFs.existsSync.mockImplementation((p: fs.PathLike) => {
    const rel = path.relative(PROJECT, String(p));
    return files.has(rel) || files.has(String(p));
  });
}

function setFileContents(contents: Record<string, string>): void {
  mockFs.readFileSync.mockImplementation((p: fs.PathOrFileDescriptor) => {
    const key = String(p);
    for (const [pattern, content] of Object.entries(contents)) {
      if (key.endsWith(pattern) || key === pattern) return content;
    }
    throw new Error(`ENOENT: no such file: ${key}`);
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  (mockFs.readdirSync as jest.Mock).mockReturnValue([]);
  mockFs.statSync.mockReturnValue({ isDirectory: () => false } as fs.Stats);
});

// ── analyzeProject ───────────────────────────────────────────────────────────

describe('analyzeProject', () => {
  it('should return project name from basename when no package.json', () => {
    setExistingFiles(new Set());

    const result = analyzeProject(PROJECT);

    expect(result.name).toBe('test-project');
    expect(result.packageManager).toBe('unknown');
    expect(result.dependencies).toEqual([]);
    expect(result.devDependencies).toEqual([]);
  });

  it('should read name and description from package.json', () => {
    setExistingFiles(new Set(['package.json']));
    setFileContents({
      'package.json': JSON.stringify({
        name: 'my-awesome-app',
        description: 'An awesome app',
        scripts: { dev: 'vite', build: 'tsc && vite build' },
        dependencies: { react: '^18.0.0' },
        devDependencies: { typescript: '^5.0.0' },
      }),
    });

    const result = analyzeProject(PROJECT);

    expect(result.name).toBe('my-awesome-app');
    expect(result.description).toBe('An awesome app');
    expect(result.scripts).toEqual({ dev: 'vite', build: 'tsc && vite build' });
    expect(result.dependencies).toEqual(['react']);
    expect(result.devDependencies).toEqual(['typescript']);
    expect(result.packageManager).toBe('npm');
  });

  it('should detect pnpm as package manager', () => {
    setExistingFiles(new Set(['package.json', 'pnpm-lock.yaml']));
    setFileContents({ 'package.json': JSON.stringify({}) });

    const result = analyzeProject(PROJECT);
    expect(result.packageManager).toBe('pnpm');
  });

  it('should detect yarn as package manager', () => {
    setExistingFiles(new Set(['package.json', 'yarn.lock']));
    setFileContents({ 'package.json': JSON.stringify({}) });

    const result = analyzeProject(PROJECT);
    expect(result.packageManager).toBe('yarn');
  });

  it('should detect pip as package manager', () => {
    setExistingFiles(new Set(['Pipfile']));

    const result = analyzeProject(PROJECT);
    expect(result.packageManager).toBe('pip');
  });

  it('should detect TypeScript', () => {
    setExistingFiles(new Set(['tsconfig.json']));

    const result = analyzeProject(PROJECT);
    expect(result.hasTypeScript).toBe(true);
  });

  it('should detect Docker', () => {
    setExistingFiles(new Set(['Dockerfile']));

    const result = analyzeProject(PROJECT);
    expect(result.hasDocker).toBe(true);
  });

  it('should detect Docker from docker-compose.yml', () => {
    setExistingFiles(new Set(['docker-compose.yml']));

    const result = analyzeProject(PROJECT);
    expect(result.hasDocker).toBe(true);
  });

  it('should detect CI from .github/workflows', () => {
    setExistingFiles(new Set(['.github/workflows']));

    const result = analyzeProject(PROJECT);
    expect(result.hasCI).toBe(true);
  });

  it('should find entry points', () => {
    setExistingFiles(new Set(['src/index.ts', 'src/app.ts']));

    const result = analyzeProject(PROJECT);
    expect(result.entryPoints).toContain('src/index.ts');
    expect(result.entryPoints).toContain('src/app.ts');
  });

  it('should list top-level directories excluding hidden and node_modules', () => {
    setExistingFiles(new Set());
    (mockFs.readdirSync as jest.Mock).mockReturnValue([
      'src', 'lib', '.git', 'node_modules', 'README.md',
    ]);
    mockFs.statSync.mockImplementation((p: fs.PathLike) => {
      const name = path.basename(String(p));
      const isDirName = ['src', 'lib', '.git', 'node_modules'].includes(name);
      return { isDirectory: () => isDirName } as fs.Stats;
    });

    const result = analyzeProject(PROJECT);

    expect(result.directories).toContain('src');
    expect(result.directories).toContain('lib');
    expect(result.directories).not.toContain('.git');
    expect(result.directories).not.toContain('node_modules');
    expect(result.directories).not.toContain('README.md');
  });

  it('should handle malformed package.json gracefully', () => {
    setExistingFiles(new Set(['package.json']));
    setFileContents({ 'package.json': '{invalid json' });

    const result = analyzeProject(PROJECT);

    // Should not throw, falls back to defaults
    expect(result.name).toBe('test-project');
    expect(result.packageManager).toBe('unknown');
  });
});

// ── generateReadme ───────────────────────────────────────────────────────────

describe('generateReadme', () => {
  const baseAnalysis: ProjectAnalysis = {
    name: 'my-app',
    description: 'A cool application',
    packageManager: 'npm',
    scripts: { dev: 'vite', build: 'tsc && vite build', test: 'jest' },
    dependencies: ['react', 'next'],
    devDependencies: ['typescript'],
    hasTypeScript: true,
    hasDocker: false,
    hasCI: false,
    entryPoints: ['src/index.ts'],
    directories: ['src', 'tests', 'public'],
  };

  it('should include the project title', () => {
    const readme = generateReadme(baseAnalysis);
    expect(readme).toContain('# my-app');
  });

  it('should include the description', () => {
    const readme = generateReadme(baseAnalysis);
    expect(readme).toContain('A cool application');
  });

  it('should include prerequisites section for npm', () => {
    const readme = generateReadme(baseAnalysis);
    expect(readme).toContain('## Prerequisites');
    expect(readme).toContain('Node.js');
    expect(readme).toContain('npm');
  });

  it('should include pip prerequisites for Python projects', () => {
    const analysis = { ...baseAnalysis, packageManager: 'pip' };
    const readme = generateReadme(analysis);
    expect(readme).toContain('Python >= 3.8');
    expect(readme).toContain('pip');
  });

  it('should include installation section with correct package manager', () => {
    const readme = generateReadme(baseAnalysis);
    expect(readme).toContain('npm install');
  });

  it('should include yarn install for yarn projects', () => {
    const analysis = { ...baseAnalysis, packageManager: 'yarn' };
    const readme = generateReadme(analysis);
    expect(readme).toContain('yarn install');
  });

  it('should include pnpm install for pnpm projects', () => {
    const analysis = { ...baseAnalysis, packageManager: 'pnpm' };
    const readme = generateReadme(analysis);
    expect(readme).toContain('pnpm install');
  });

  it('should include pip install for Python projects', () => {
    const analysis = { ...baseAnalysis, packageManager: 'pip' };
    const readme = generateReadme(analysis);
    expect(readme).toContain('pip install -r requirements.txt');
  });

  it('should include available scripts table', () => {
    const readme = generateReadme(baseAnalysis);
    expect(readme).toContain('## Available Scripts');
    expect(readme).toContain('`npm run dev`');
    expect(readme).toContain('`npm run build`');
    expect(readme).toContain('`npm run test`');
  });

  it('should skip scripts section when no scripts exist', () => {
    const analysis = { ...baseAnalysis, scripts: {} };
    const readme = generateReadme(analysis);
    expect(readme).not.toContain('## Available Scripts');
  });

  it('should include project structure tree', () => {
    const readme = generateReadme(baseAnalysis);
    expect(readme).toContain('## Project Structure');
    expect(readme).toContain('src/');
    expect(readme).toContain('tests/');
    expect(readme).toContain('public/');
  });

  it('should skip project structure when no directories', () => {
    const analysis = { ...baseAnalysis, directories: [] };
    const readme = generateReadme(analysis);
    expect(readme).not.toContain('## Project Structure');
  });

  it('should include license section', () => {
    const readme = generateReadme(baseAnalysis);
    expect(readme).toContain('## License');
    expect(readme).toContain('LICENSE');
  });

  it('should include ForgeKit generated footer', () => {
    const readme = generateReadme(baseAnalysis);
    expect(readme).toContain('ForgeKit');
  });

  it('should detect Next.js framework and include badge', () => {
    const readme = generateReadme(baseAnalysis);
    expect(readme).toContain('Next.js');
  });

  it('should detect TypeScript and include badge', () => {
    const readme = generateReadme(baseAnalysis);
    expect(readme).toContain('TypeScript');
  });

  it('should detect Express framework', () => {
    const analysis: ProjectAnalysis = {
      ...baseAnalysis,
      dependencies: ['express'],
      devDependencies: [],
    };
    const readme = generateReadme(analysis);
    expect(readme).toContain('Express');
  });

  it('should include Docker badge when hasDocker is true', () => {
    const analysis = { ...baseAnalysis, hasDocker: true };
    const readme = generateReadme(analysis);
    expect(readme).toContain('Docker');
  });

  it('should handle project with no description', () => {
    const analysis = { ...baseAnalysis, description: '' };
    const readme = generateReadme(analysis);
    // Should still produce valid markdown
    expect(readme).toContain('# my-app');
    expect(readme).not.toContain('\n\n\n\n'); // no excessive blank lines
  });
});
