// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0

jest.mock('../core/template-resolver');
jest.mock('../core/file-writer');
jest.mock('../core/telemetry', () => ({ trackEvent: jest.fn() }));
jest.mock('child_process');

import { spawnSync } from 'child_process';
import { scaffold } from '../core/scaffold';
import { getTemplate } from '../core/template-resolver';
import { writeTemplateFiles } from '../core/file-writer';
import { Template } from '../types';

const mockGetTemplate = getTemplate as jest.MockedFunction<typeof getTemplate>;
const mockWriteTemplateFiles = writeTemplateFiles as jest.MockedFunction<typeof writeTemplateFiles>;
const mockSpawnSync = spawnSync as jest.MockedFunction<typeof spawnSync>;

function makeTemplate(overrides: Partial<Template> = {}): Template {
  return {
    id: 'web-app',
    name: 'Web App',
    description: 'Full-stack web application',
    stack: ['Node.js', 'React', 'TypeScript'],
    version: '1.0.0',
    author: 'ForgeKit',
    files: [],
    hooks: [],
    variables: [],
    ...overrides,
  };
}

const baseOptions = {
  projectName: 'my-project',
  templateId: 'web-app',
  outputDir: '/tmp',
  skipInstall: true,
  dryRun: false,
  variables: {},
};

describe('scaffold', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWriteTemplateFiles.mockResolvedValue(['package.json', 'src/index.ts']);
  });

  describe('success path', () => {
    it('returns success:true when template loads and files are written', async () => {
      mockGetTemplate.mockResolvedValue(makeTemplate());

      const result = await scaffold(baseOptions);

      expect(result.success).toBe(true);
      expect(result.filesCreated).toEqual(['package.json', 'src/index.ts']);
      expect(result.errors).toHaveLength(0);
    });

    it('returns the correct projectPath', async () => {
      mockGetTemplate.mockResolvedValue(makeTemplate());

      const result = await scaffold({ ...baseOptions, outputDir: '/tmp', projectName: 'my-app' });

      expect(result.projectPath).toContain('my-app');
    });

    it('includes nextSteps in result', async () => {
      mockGetTemplate.mockResolvedValue(makeTemplate({ id: 'web-app' }));

      const result = await scaffold(baseOptions);

      expect(result.nextSteps.length).toBeGreaterThan(0);
      expect(result.nextSteps[0]).toContain('my-project');
    });
  });

  describe('template not found', () => {
    it('returns success:false when getTemplate throws', async () => {
      mockGetTemplate.mockRejectedValue(new Error('Template "bad-id" not found'));

      const result = await scaffold({ ...baseOptions, templateId: 'bad-id' });

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('not found');
      expect(result.filesCreated).toEqual([]);
    });

    it('returns empty projectPath when template lookup fails', async () => {
      mockGetTemplate.mockRejectedValue(new Error('not found'));

      const result = await scaffold(baseOptions);

      expect(result.projectPath).toBe('');
    });
  });

  describe('file write failure', () => {
    it('returns success:false when writeTemplateFiles throws', async () => {
      mockGetTemplate.mockResolvedValue(makeTemplate());
      mockWriteTemplateFiles.mockRejectedValue(new Error('EACCES: permission denied'));

      const result = await scaffold(baseOptions);

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('permission denied');
    });

    it('returns the projectPath even when write fails', async () => {
      mockGetTemplate.mockResolvedValue(makeTemplate());
      mockWriteTemplateFiles.mockRejectedValue(new Error('write error'));

      const result = await scaffold({ ...baseOptions, projectName: 'fail-proj' });

      expect(result.projectPath).toContain('fail-proj');
    });
  });

  describe('post-scaffold hooks', () => {
    it('runs hooks when skipInstall is false and dryRun is false', async () => {
      mockGetTemplate.mockResolvedValue(makeTemplate({
        hooks: [{ type: 'post-scaffold', command: 'npm', args: ['install'] }],
      }));
      (mockSpawnSync as jest.Mock).mockReturnValue({ status: 0 });

      await scaffold({ ...baseOptions, skipInstall: false, dryRun: false });

      expect(mockSpawnSync).toHaveBeenCalledWith('npm', ['install'], expect.objectContaining({ shell: false }));
    });

    it('skips hooks when skipInstall is true', async () => {
      mockGetTemplate.mockResolvedValue(makeTemplate({
        hooks: [{ type: 'post-scaffold', command: 'npm', args: ['install'] }],
      }));

      await scaffold({ ...baseOptions, skipInstall: true });

      expect(mockSpawnSync).not.toHaveBeenCalled();
    });

    it('skips hooks when dryRun is true', async () => {
      mockGetTemplate.mockResolvedValue(makeTemplate({
        hooks: [{ type: 'post-scaffold', command: 'npm', args: ['install'] }],
      }));

      await scaffold({ ...baseOptions, skipInstall: false, dryRun: true });

      expect(mockSpawnSync).not.toHaveBeenCalled();
    });

    it('skips hooks that are not post-scaffold type', async () => {
      mockGetTemplate.mockResolvedValue(makeTemplate({
        hooks: [{ type: 'pre-scaffold' as 'post-scaffold', command: 'npm', args: ['install'] }],
      }));

      await scaffold({ ...baseOptions, skipInstall: false });

      expect(mockSpawnSync).not.toHaveBeenCalled();
    });

    it('adds error and continues when hook command is not in allowlist', async () => {
      mockGetTemplate.mockResolvedValue(makeTemplate({
        hooks: [{ type: 'post-scaffold', command: 'rm', args: ['-rf', '/'] }],
      }));

      const result = await scaffold({ ...baseOptions, skipInstall: false });

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Skipped unsafe hook command');
      expect(mockSpawnSync).not.toHaveBeenCalled();
    });

    it('adds error when hook exits with non-zero status', async () => {
      mockGetTemplate.mockResolvedValue(makeTemplate({
        hooks: [{ type: 'post-scaffold', command: 'npm', args: ['install'] }],
      }));
      (mockSpawnSync as jest.Mock).mockReturnValue({ status: 1 });

      const result = await scaffold({ ...baseOptions, skipInstall: false });

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('failed');
    });
  });

  describe('nextSteps per template', () => {
    it('returns npm run dev steps for web-app', async () => {
      mockGetTemplate.mockResolvedValue(makeTemplate({ id: 'web-app' }));

      const result = await scaffold(baseOptions);

      expect(result.nextSteps).toContain('npm run dev');
    });

    it('returns uvicorn steps for api-service', async () => {
      mockGetTemplate.mockResolvedValue(makeTemplate({ id: 'api-service' }));

      const result = await scaffold({ ...baseOptions, templateId: 'api-service' });

      expect(result.nextSteps.some(s => s.includes('uvicorn'))).toBe(true);
    });

    it('returns jupyter steps for ml-pipeline', async () => {
      mockGetTemplate.mockResolvedValue(makeTemplate({ id: 'ml-pipeline' }));

      const result = await scaffold({ ...baseOptions, templateId: 'ml-pipeline' });

      expect(result.nextSteps.some(s => s.includes('jupyter'))).toBe(true);
    });

    it('returns README fallback for unknown template', async () => {
      mockGetTemplate.mockResolvedValue(makeTemplate({ id: 'serverless' }));

      const result = await scaffold({ ...baseOptions, templateId: 'serverless' });

      expect(result.nextSteps.some(s => s.includes('README'))).toBe(true);
    });

    it('always starts nextSteps with cd <projectName>', async () => {
      mockGetTemplate.mockResolvedValue(makeTemplate());

      const result = await scaffold({ ...baseOptions, projectName: 'hello-world' });

      expect(result.nextSteps[0]).toBe('cd hello-world');
    });
  });
});
