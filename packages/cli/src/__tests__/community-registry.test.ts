// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import * as fs from 'fs';
import * as path from 'path';
import {
  searchMarketplace,
  validateTemplate,
  generateManifest,
} from '../core/community-registry';
import * as templateResolver from '../core/template-resolver';

jest.mock('fs');
jest.mock('../core/template-resolver');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockTemplateResolver = templateResolver as jest.Mocked<typeof templateResolver>;

const PROJECT = '/tmp/test-template';

function setExistingFiles(files: Set<string>): void {
  mockFs.existsSync.mockImplementation((p: fs.PathLike) => {
    const str = String(p);
    const rel = path.relative(PROJECT, str);
    return files.has(rel) || files.has(str);
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
  // Default: listTemplates returns some official templates
  mockTemplateResolver.listTemplates.mockResolvedValue([
    {
      id: 'web-app',
      name: 'Web Application',
      description: 'A full-stack web application with React',
      stack: ['React', 'Node.js'],
      version: '1.0.0',
      author: 'ForgeKit',
      files: [],
      hooks: [],
      variables: [],
    },
    {
      id: 'api-server',
      name: 'API Server',
      description: 'Express REST API server',
      stack: ['Express', 'TypeScript'],
      version: '1.0.0',
      author: 'ForgeKit',
      files: [],
      hooks: [],
      variables: [],
    },
  ]);
});

// ── searchMarketplace ────────────────────────────────────────────────────────

describe('searchMarketplace', () => {
  it('should return all official templates with empty query', async () => {
    const result = await searchMarketplace('');

    expect(result.templates).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.templates[0].source).toBe('official');
  });

  it('should filter templates by query string matching name', async () => {
    const result = await searchMarketplace('web');

    expect(result.templates).toHaveLength(1);
    expect(result.templates[0].id).toBe('web-app');
  });

  it('should filter templates by query string matching description', async () => {
    const result = await searchMarketplace('REST');

    expect(result.templates).toHaveLength(1);
    expect(result.templates[0].id).toBe('api-server');
  });

  it('should filter templates by query matching stack', async () => {
    const result = await searchMarketplace('react');

    expect(result.templates).toHaveLength(1);
    expect(result.templates[0].id).toBe('web-app');
  });

  it('should return empty when query matches nothing', async () => {
    const result = await searchMarketplace('django');

    expect(result.templates).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('should be case-insensitive in query matching', async () => {
    const result = await searchMarketplace('EXPRESS');

    expect(result.templates).toHaveLength(1);
    expect(result.templates[0].id).toBe('api-server');
  });

  it('should filter by tags', async () => {
    const result = await searchMarketplace('', { tags: ['react'] });

    // Tags are derived from stack.map(s => s.toLowerCase())
    expect(result.templates).toHaveLength(1);
    expect(result.templates[0].id).toBe('web-app');
  });

  it('should return no results when communityOnly is true (MVP has no community templates)', async () => {
    const result = await searchMarketplace('', { communityOnly: true });

    expect(result.templates).toHaveLength(0);
  });

  it('should handle listTemplates failure gracefully', async () => {
    mockTemplateResolver.listTemplates.mockRejectedValue(new Error('failed'));

    const result = await searchMarketplace('');

    expect(result.templates).toHaveLength(0);
  });

  it('should set author to ForgeKit for official templates', async () => {
    const result = await searchMarketplace('');

    for (const t of result.templates) {
      expect(t.author).toBe('ForgeKit');
    }
  });
});

// ── validateTemplate ─────────────────────────────────────────────────────────

describe('validateTemplate', () => {
  it('should fail when directory does not exist', () => {
    mockFs.statSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });

    const result = validateTemplate(PROJECT);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('does not exist'))).toBe(true);
  });

  it('should fail when path is not a directory', () => {
    mockFs.statSync.mockReturnValue({ isDirectory: () => false } as fs.Stats);

    const result = validateTemplate(PROJECT);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('not a directory'))).toBe(true);
  });

  it('should report missing forgekit.json', () => {
    mockFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);
    setExistingFiles(new Set(['README.md']));

    const result = validateTemplate(PROJECT);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('forgekit.json'))).toBe(true);
  });

  it('should report missing README.md as a non-blocking warning', () => {
    mockFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);
    setExistingFiles(new Set(['forgekit.json']));
    setFileContents({
      'forgekit.json': JSON.stringify({
        id: 'my-template',
        name: 'My Template',
        description: 'A template',
        version: '1.0.0',
      }),
    });

    const result = validateTemplate(PROJECT);

    // README.md is recommended, not required -- should be valid
    expect(result.valid).toBe(true);
    expect(result.errors.some(e => e.includes('README.md') && e.includes('recommended'))).toBe(true);
  });

  it('should report invalid JSON in forgekit.json', () => {
    mockFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);
    setExistingFiles(new Set(['forgekit.json', 'README.md']));
    setFileContents({ 'forgekit.json': '{invalid json' });

    const result = validateTemplate(PROJECT);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('invalid JSON'))).toBe(true);
  });

  it('should report missing required fields in forgekit.json', () => {
    mockFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);
    setExistingFiles(new Set(['forgekit.json', 'README.md']));
    setFileContents({
      'forgekit.json': JSON.stringify({ id: 'test' }),
    });

    const result = validateTemplate(PROJECT);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('"name"'))).toBe(true);
    expect(result.errors.some(e => e.includes('"description"'))).toBe(true);
    expect(result.errors.some(e => e.includes('"version"'))).toBe(true);
  });

  it('should reject invalid id format', () => {
    mockFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);
    setExistingFiles(new Set(['forgekit.json', 'README.md']));
    setFileContents({
      'forgekit.json': JSON.stringify({
        id: 'INVALID_ID!!',
        name: 'Test',
        description: 'Test',
        version: '1.0.0',
      }),
    });

    const result = validateTemplate(PROJECT);

    expect(result.errors.some(e => e.includes('"id"') && e.includes('lowercase'))).toBe(true);
  });

  it('should reject invalid version format', () => {
    mockFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);
    setExistingFiles(new Set(['forgekit.json', 'README.md']));
    setFileContents({
      'forgekit.json': JSON.stringify({
        id: 'my-template',
        name: 'Test',
        description: 'Test',
        version: 'not-semver',
      }),
    });

    const result = validateTemplate(PROJECT);

    expect(result.errors.some(e => e.includes('semver'))).toBe(true);
  });

  it('should detect path traversal in files array', () => {
    mockFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);
    setExistingFiles(new Set(['forgekit.json', 'README.md']));
    setFileContents({
      'forgekit.json': JSON.stringify({
        id: 'my-template',
        name: 'Test',
        description: 'Test',
        version: '1.0.0',
        files: [
          { src: '../../etc/passwd', dest: 'stolen.txt' },
        ],
      }),
    });

    const result = validateTemplate(PROJECT);

    expect(result.errors.some(e => e.includes('escape the template directory'))).toBe(true);
    expect(result.errors.some(e => e.includes('security risk'))).toBe(true);
  });

  it('should accept valid template with all required fields', () => {
    mockFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);
    setExistingFiles(new Set(['forgekit.json', 'README.md']));
    setFileContents({
      'forgekit.json': JSON.stringify({
        id: 'my-template',
        name: 'My Template',
        description: 'A valid template',
        version: '1.0.0',
        stack: ['React'],
        tags: ['frontend'],
        files: [
          { src: 'src/index.ts', dest: 'src/index.ts' },
        ],
      }),
    });

    const result = validateTemplate(PROJECT);

    expect(result.valid).toBe(true);
  });

  it('should reject files array entries that are not objects', () => {
    mockFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);
    setExistingFiles(new Set(['forgekit.json', 'README.md']));
    setFileContents({
      'forgekit.json': JSON.stringify({
        id: 'my-template',
        name: 'Test',
        description: 'Test',
        version: '1.0.0',
        files: ['not-an-object'],
      }),
    });

    const result = validateTemplate(PROJECT);

    expect(result.errors.some(e => e.includes('must be an object'))).toBe(true);
  });

  it('should reject files entries without src and dest', () => {
    mockFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);
    setExistingFiles(new Set(['forgekit.json', 'README.md']));
    setFileContents({
      'forgekit.json': JSON.stringify({
        id: 'my-template',
        name: 'Test',
        description: 'Test',
        version: '1.0.0',
        files: [{ foo: 'bar' }],
      }),
    });

    const result = validateTemplate(PROJECT);

    expect(result.errors.some(e => e.includes('"src"') && e.includes('"dest"'))).toBe(true);
  });

  it('should reject non-array stack field', () => {
    mockFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);
    setExistingFiles(new Set(['forgekit.json', 'README.md']));
    setFileContents({
      'forgekit.json': JSON.stringify({
        id: 'my-template',
        name: 'Test',
        description: 'Test',
        version: '1.0.0',
        stack: 'not-an-array',
      }),
    });

    const result = validateTemplate(PROJECT);

    expect(result.errors.some(e => e.includes('"stack"') && e.includes('array'))).toBe(true);
  });

  it('should reject non-array tags field', () => {
    mockFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);
    setExistingFiles(new Set(['forgekit.json', 'README.md']));
    setFileContents({
      'forgekit.json': JSON.stringify({
        id: 'my-template',
        name: 'Test',
        description: 'Test',
        version: '1.0.0',
        tags: 'not-an-array',
      }),
    });

    const result = validateTemplate(PROJECT);

    expect(result.errors.some(e => e.includes('"tags"') && e.includes('array'))).toBe(true);
  });

  it('should reject non-array files field', () => {
    mockFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);
    setExistingFiles(new Set(['forgekit.json', 'README.md']));
    setFileContents({
      'forgekit.json': JSON.stringify({
        id: 'my-template',
        name: 'Test',
        description: 'Test',
        version: '1.0.0',
        files: 'not-an-array',
      }),
    });

    const result = validateTemplate(PROJECT);

    expect(result.errors.some(e => e.includes('"files"') && e.includes('array'))).toBe(true);
  });
});

// ── generateManifest ─────────────────────────────────────────────────────────

describe('generateManifest', () => {
  it('should generate a manifest with id derived from directory name', () => {
    setExistingFiles(new Set());
    (mockFs.readdirSync as jest.Mock).mockReturnValue([]);

    const manifest = generateManifest(PROJECT);

    expect(manifest.id).toBe('test-template');
    expect(manifest.version).toBe('1.0.0');
    expect(manifest.description).toContain('test-template');
  });

  it('should read metadata from package.json when present', () => {
    setExistingFiles(new Set(['package.json']));
    setFileContents({
      'package.json': JSON.stringify({
        name: 'my-awesome-template',
        description: 'An awesome template',
        version: '2.0.0',
        author: 'Test Author',
        repository: 'https://github.com/test/repo',
        dependencies: { react: '^18.0.0', next: '^13.0.0' },
        devDependencies: { typescript: '^5.0.0', tailwindcss: '^3.0.0' },
      }),
    });
    (mockFs.readdirSync as jest.Mock).mockReturnValue([]);

    const manifest = generateManifest(PROJECT);

    expect(manifest.name).toBe('my-awesome-template');
    expect(manifest.description).toBe('An awesome template');
    expect(manifest.version).toBe('2.0.0');
    expect(manifest.author).toBe('Test Author');
    expect(manifest.repository).toBe('https://github.com/test/repo');
    expect((manifest.stack as string[])).toContain('React');
    expect((manifest.stack as string[])).toContain('Next.js');
    expect((manifest.stack as string[])).toContain('TypeScript');
    expect((manifest.stack as string[])).toContain('Tailwind CSS');
  });

  it('should detect Python projects from requirements.txt', () => {
    setExistingFiles(new Set(['requirements.txt']));
    (mockFs.readdirSync as jest.Mock).mockReturnValue([]);

    const manifest = generateManifest(PROJECT);

    expect((manifest.stack as string[])).toContain('Python');
    expect((manifest.tags as string[])).toContain('python');
  });

  it('should detect Go projects from go.mod', () => {
    setExistingFiles(new Set(['go.mod']));
    (mockFs.readdirSync as jest.Mock).mockReturnValue([]);

    const manifest = generateManifest(PROJECT);

    expect((manifest.stack as string[])).toContain('Go');
    expect((manifest.tags as string[])).toContain('go');
  });

  it('should detect Docker from Dockerfile', () => {
    setExistingFiles(new Set(['Dockerfile']));
    (mockFs.readdirSync as jest.Mock).mockReturnValue([]);

    const manifest = generateManifest(PROJECT);

    expect((manifest.tags as string[])).toContain('docker');
  });

  it('should generate safe id from package name with special chars', () => {
    setExistingFiles(new Set(['package.json']));
    setFileContents({
      'package.json': JSON.stringify({ name: '@scope/My Template!' }),
    });
    (mockFs.readdirSync as jest.Mock).mockReturnValue([]);

    const manifest = generateManifest(PROJECT);

    expect(manifest.id).toMatch(/^[a-z0-9][a-z0-9-]*$/);
    expect((manifest.id as string)).not.toContain('@');
    expect((manifest.id as string)).not.toContain('!');
  });

  it('should list non-hidden, non-node_modules files in files array', () => {
    setExistingFiles(new Set());
    (mockFs.readdirSync as jest.Mock).mockReturnValue([
      'src',
      'package.json',
      '.git',
      'node_modules',
      'forgekit.json',
      'README.md',
    ]);

    const manifest = generateManifest(PROJECT);
    const fileSrcs = (manifest.files as Array<{ src: string }>).map(f => f.src);

    expect(fileSrcs).toContain('src');
    expect(fileSrcs).toContain('package.json');
    expect(fileSrcs).toContain('README.md');
    expect(fileSrcs).not.toContain('.git');
    expect(fileSrcs).not.toContain('node_modules');
    expect(fileSrcs).not.toContain('forgekit.json');
  });

  it('should handle author as object with name field', () => {
    setExistingFiles(new Set(['package.json']));
    setFileContents({
      'package.json': JSON.stringify({
        author: { name: 'Object Author', email: 'test@example.com' },
      }),
    });
    (mockFs.readdirSync as jest.Mock).mockReturnValue([]);

    const manifest = generateManifest(PROJECT);

    expect(manifest.author).toBe('Object Author');
  });

  it('should handle repository as object with url field', () => {
    setExistingFiles(new Set(['package.json']));
    setFileContents({
      'package.json': JSON.stringify({
        repository: { type: 'git', url: 'git+https://github.com/test/repo.git' },
      }),
    });
    (mockFs.readdirSync as jest.Mock).mockReturnValue([]);

    const manifest = generateManifest(PROJECT);

    expect(manifest.repository).toBe('https://github.com/test/repo');
  });

  it('should handle malformed package.json gracefully', () => {
    setExistingFiles(new Set(['package.json']));
    setFileContents({ 'package.json': 'not json' });
    (mockFs.readdirSync as jest.Mock).mockReturnValue([]);

    // Should not throw
    const manifest = generateManifest(PROJECT);
    expect(manifest.id).toBeDefined();
  });
});
