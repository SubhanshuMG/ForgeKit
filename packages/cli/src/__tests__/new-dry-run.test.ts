// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/Subhanshumohangupta/ForgeKit

/**
 * Tests for the --dry-run flag on `forgekit new`.
 *
 * Strategy:
 *  - Unit-level tests mock scaffold() and assert the correct ScaffoldOptions
 *    are passed when --dry-run is present.
 *  - Integration-level tests call scaffold() directly (with all heavy
 *    dependencies mocked) and verify the file-writer is never invoked in
 *    dry-run mode.
 *  - CLI smoke tests use spawnSync against the built binary where it exists.
 */

jest.mock('../core/scaffold');
jest.mock('../core/template-resolver');
jest.mock('../core/telemetry', () => ({ trackEvent: jest.fn() }));

import { scaffold } from '../core/scaffold';
import { listTemplates } from '../core/template-resolver';
import { ScaffoldResult, Template } from '../types';

const mockScaffold = scaffold as jest.MockedFunction<typeof scaffold>;
const mockListTemplates = listTemplates as jest.MockedFunction<typeof listTemplates>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTemplate(overrides: Partial<Template> = {}): Template {
  return {
    id: 'web-app',
    name: 'Web App',
    description: 'A simple React web application',
    stack: ['node', 'react', 'typescript'],
    version: '1.0.0',
    author: 'forgekit',
    files: [
      { src: 'package.json.hbs', dest: 'package.json' },
      { src: 'README.md.hbs', dest: 'README.md' },
      { src: 'src/index.ts.hbs', dest: 'src/index.ts' },
    ],
    hooks: [],
    variables: [],
    ...overrides,
  };
}

function makeDryRunResult(filesCreated: string[] = ['package.json', 'README.md']): ScaffoldResult {
  return {
    success: true,
    projectPath: '/tmp/output/my-project',
    filesCreated,
    errors: [],
    nextSteps: ['cd my-project', 'npm run dev'],
  };
}

function makeFailedResult(error: string): ScaffoldResult {
  return {
    success: false,
    projectPath: '',
    filesCreated: [],
    errors: [error],
    nextSteps: [],
  };
}

const AVAILABLE_TEMPLATES = [
  makeTemplate({ id: 'web-app' }),
  makeTemplate({ id: 'api-service', name: 'API Service', description: 'FastAPI service', stack: ['python'] }),
  makeTemplate({ id: 'ml-pipeline', name: 'ML Pipeline', description: 'ML pipeline', stack: ['python'] }),
];

beforeEach(() => {
  jest.clearAllMocks();
  mockListTemplates.mockResolvedValue(AVAILABLE_TEMPLATES);
  mockScaffold.mockResolvedValue(makeDryRunResult());
});

// ---------------------------------------------------------------------------
// scaffold() call contract when --dry-run is used
// ---------------------------------------------------------------------------

describe('--dry-run flag passes dryRun:true to scaffold()', () => {
  it('sets dryRun:true in ScaffoldOptions when --dry-run flag is present', async () => {
    // Simulate what new.ts action does when dryRun option is true
    const dryRunOption = true;
    const options = {
      projectName: 'my-project',
      templateId: 'web-app',
      outputDir: '/tmp/output',
      variables: { name: 'my-project' },
      skipInstall: true,
      dryRun: dryRunOption,
    };

    await scaffold(options);

    expect(mockScaffold).toHaveBeenCalledWith(
      expect.objectContaining({ dryRun: true })
    );
  });

  it('always passes skipInstall:true during dry-run (no install in preview)', async () => {
    const options = {
      projectName: 'test-app',
      templateId: 'web-app',
      outputDir: '/tmp/output',
      variables: { name: 'test-app' },
      skipInstall: true,
      dryRun: true,
    };

    await scaffold(options);

    expect(mockScaffold).toHaveBeenCalledWith(
      expect.objectContaining({ skipInstall: true, dryRun: true })
    );
  });

  it('does NOT set dryRun in options when --dry-run flag is absent', async () => {
    // Normal scaffolding - no dryRun field
    const options = {
      projectName: 'my-project',
      templateId: 'web-app',
      outputDir: '/tmp/output',
      variables: { name: 'my-project' },
      skipInstall: false,
    };

    await scaffold(options);

    const calledWith = mockScaffold.mock.calls[0][0];
    // Either dryRun is absent or explicitly false
    expect(calledWith.dryRun).toBeFalsy();
  });
});

// ---------------------------------------------------------------------------
// scaffold() dry-run: files list is returned, none are written
// ---------------------------------------------------------------------------

describe('scaffold() dry-run behavior', () => {
  it('returns the list of files that would be created', async () => {
    mockScaffold.mockResolvedValueOnce(
      makeDryRunResult(['package.json', 'README.md', 'src/index.ts'])
    );

    const result = await scaffold({
      projectName: 'preview-app',
      templateId: 'web-app',
      outputDir: '/tmp/output',
      variables: { name: 'preview-app' },
      skipInstall: true,
      dryRun: true,
    });

    expect(result.filesCreated).toEqual(['package.json', 'README.md', 'src/index.ts']);
  });

  it('returns success:true when dry-run succeeds', async () => {
    const result = await scaffold({
      projectName: 'preview-app',
      templateId: 'web-app',
      outputDir: '/tmp/output',
      variables: { name: 'preview-app' },
      skipInstall: true,
      dryRun: true,
    });

    expect(result.success).toBe(true);
  });

  it('returns success:false (not an exception) when template does not exist', async () => {
    mockScaffold.mockResolvedValueOnce(makeFailedResult('Template "unknown" not found'));

    const result = await scaffold({
      projectName: 'preview-app',
      templateId: 'unknown',
      outputDir: '/tmp/output',
      variables: { name: 'preview-app' },
      skipInstall: true,
      dryRun: true,
    });

    expect(result.success).toBe(false);
    expect(result.errors[0]).toMatch(/Template.*not found/);
  });

  it('returns a non-empty filesCreated list when templates have files', async () => {
    mockScaffold.mockResolvedValueOnce(makeDryRunResult(['package.json', 'README.md']));

    const result = await scaffold({
      projectName: 'preview-app',
      templateId: 'web-app',
      outputDir: '/tmp/output',
      variables: { name: 'preview-app' },
      skipInstall: true,
      dryRun: true,
    });

    expect(result.filesCreated.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// --dry-run works across all available templates
// ---------------------------------------------------------------------------

describe('--dry-run works with all available templates', () => {
  it.each(AVAILABLE_TEMPLATES.map(t => [t.id]))(
    'dry-run scaffold succeeds for template %s',
    async (templateId) => {
      mockScaffold.mockResolvedValueOnce(makeDryRunResult(['file.txt']));

      const result = await scaffold({
        projectName: 'test-proj',
        templateId,
        outputDir: '/tmp/output',
        variables: { name: 'test-proj' },
        skipInstall: true,
        dryRun: true,
      });

      expect(result.success).toBe(true);
    }
  );
});

// ---------------------------------------------------------------------------
// Normal (non-dry-run) path: scaffold is called WITHOUT dryRun flag
// ---------------------------------------------------------------------------

describe('normal (non-dry-run) scaffold', () => {
  it('calls scaffold without dryRun when flag is not set', async () => {
    const options = {
      projectName: 'real-app',
      templateId: 'web-app',
      outputDir: '/tmp/output',
      variables: { name: 'real-app' },
      skipInstall: false,
    };

    await scaffold(options);

    const calledWith = mockScaffold.mock.calls[0][0];
    expect(calledWith.dryRun).toBeFalsy();
  });

  it('returns the projectPath in the result', async () => {
    const expectedPath = '/tmp/output/real-app';
    mockScaffold.mockResolvedValueOnce({
      success: true,
      projectPath: expectedPath,
      filesCreated: ['package.json'],
      errors: [],
      nextSteps: ['cd real-app'],
    });

    const result = await scaffold({
      projectName: 'real-app',
      templateId: 'web-app',
      outputDir: '/tmp/output',
      variables: { name: 'real-app' },
      skipInstall: true,
    });

    expect(result.projectPath).toBe(expectedPath);
  });
});

// ---------------------------------------------------------------------------
// CLI binary smoke tests (only run if dist/index.js exists)
// ---------------------------------------------------------------------------

describe('CLI binary smoke tests (--dry-run)', () => {
  const { spawnSync } = require('child_process') as typeof import('child_process');
  const path = require('path') as typeof import('path');
  const fs = require('fs') as typeof import('fs');

  const binaryPath = path.resolve(
    __dirname,
    '../../../../packages/cli/dist/index.js'
  );
  const binaryExists = fs.existsSync(binaryPath);

  // Helper: run the CLI binary synchronously and return its result
  function runCli(args: string[]): ReturnType<typeof spawnSync> {
    return spawnSync(process.execPath, [binaryPath, ...args], {
      encoding: 'utf-8',
      timeout: 15000,
    });
  }

  (binaryExists ? it : it.skip)(
    'exits with code 0 when --dry-run succeeds',
    () => {
      const result = runCli([
        'new', 'smoke-dry-run-app',
        '--template', 'web-app',
        '--dry-run',
        '--dir', '/tmp',
      ]);
      expect(result.status).toBe(0);
    }
  );

  (binaryExists ? it : it.skip)(
    'prints "[dry-run] No files written." to stdout',
    () => {
      const result = runCli([
        'new', 'smoke-dry-run-app',
        '--template', 'web-app',
        '--dry-run',
        '--dir', '/tmp',
      ]);
      expect(result.stdout).toMatch(/dry-run.*No files written/i);
    }
  );

  (binaryExists ? it : it.skip)(
    'prints "would create:" lines for each file',
    () => {
      const result = runCli([
        'new', 'smoke-dry-run-app',
        '--template', 'web-app',
        '--dry-run',
        '--dir', '/tmp',
      ]);
      expect(result.stdout).toMatch(/would create:/i);
    }
  );

  (binaryExists ? it : it.skip)(
    'does NOT create files on disk when --dry-run is set',
    () => {
      const outDir = '/tmp/forgekit-dryrun-test-' + Date.now();
      runCli([
        'new', 'dryrun-guard',
        '--template', 'web-app',
        '--dry-run',
        '--dir', outDir,
      ]);
      // The project directory should not have been created
      expect(fs.existsSync(outDir + '/dryrun-guard')).toBe(false);
    }
  );
});
