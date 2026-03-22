// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/Subhanshumohangupta/ForgeKit

jest.mock('fs-extra');
jest.mock('../core/template-resolver');
jest.mock('../core/security', () => ({
  // expose the real validatePathContainment so security logic is not masked
  validatePathContainment: jest.requireActual('../core/security').validatePathContainment,
}));

import * as fs from 'fs-extra';
import { writeTemplateFiles } from '../core/file-writer';
import { getTemplateDir } from '../core/template-resolver';
import { Template, ScaffoldOptions } from '../types';

const mockGetTemplateDir = getTemplateDir as jest.MockedFunction<typeof getTemplateDir>;
const mockEnsureDir = fs.ensureDir as jest.MockedFunction<typeof fs.ensureDir>;
const mockPathExists = fs.pathExists as jest.MockedFunction<typeof fs.pathExists>;
const mockReadFile = fs.readFile as jest.MockedFunction<typeof fs.readFile>;
const mockWriteFile = fs.writeFile as jest.MockedFunction<typeof fs.writeFile>;

function makeTemplate(overrides: Partial<Template> = {}): Template {
  return {
    id: 'web-app',
    name: 'Web App',
    description: 'A simple web app',
    stack: ['node'],
    version: '1.0.0',
    author: 'test',
    files: [
      { src: 'package.json.hbs', dest: 'package.json' },
      { src: 'README.md.hbs', dest: 'README.md' },
    ],
    hooks: [],
    variables: [],
    ...overrides,
  };
}

function makeOptions(overrides: Partial<ScaffoldOptions> = {}): ScaffoldOptions {
  return {
    projectName: 'my-project',
    templateId: 'web-app',
    outputDir: '/tmp/output',
    variables: {},
    skipInstall: true,
    ...overrides,
  };
}

describe('writeTemplateFiles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTemplateDir.mockReturnValue('/templates/web-app');
    (mockEnsureDir as unknown as jest.Mock).mockResolvedValue(undefined);
    (mockPathExists as unknown as jest.Mock).mockResolvedValue(true);
    (mockReadFile as unknown as jest.Mock).mockResolvedValue('Hello {{name}}');
    (mockWriteFile as unknown as jest.Mock).mockResolvedValue(undefined);
  });

  describe('happy path', () => {
    it('returns the list of relative destination paths that were written', async () => {
      const template = makeTemplate();
      const options = makeOptions();

      const filesCreated = await writeTemplateFiles(template, options);

      expect(filesCreated).toEqual(['package.json', 'README.md']);
    });

    it('calls ensureDir for the project root', async () => {
      await writeTemplateFiles(makeTemplate(), makeOptions());

      expect(mockEnsureDir).toHaveBeenCalledWith(
        expect.stringContaining('my-project')
      );
    });

    it('renders Handlebars tokens in file content', async () => {
      (mockReadFile as unknown as jest.Mock).mockResolvedValue('Project: {{name}}');
      await writeTemplateFiles(makeTemplate(), makeOptions({ projectName: 'awesome-app' }));

      const writtenContent = (mockWriteFile as unknown as jest.Mock).mock.calls[0][1] as string;
      expect(writtenContent).toBe('Project: awesome-app');
    });

    it('renders Handlebars tokens in dest path', async () => {
      const template = makeTemplate({
        files: [{ src: 'entry.ts.hbs', dest: '{{name}}/src/index.ts' }],
      });
      await writeTemplateFiles(template, makeOptions({ projectName: 'cool-app' }));

      const writtenPath = (mockWriteFile as unknown as jest.Mock).mock.calls[0][0] as string;
      expect(writtenPath).toContain('cool-app/src/index.ts');
    });

    it('injects extra variables into template context', async () => {
      (mockReadFile as unknown as jest.Mock).mockResolvedValue('Author: {{author}}');
      await writeTemplateFiles(
        makeTemplate(),
        makeOptions({ variables: { author: 'Jane' } })
      );

      const writtenContent = (mockWriteFile as unknown as jest.Mock).mock.calls[0][1] as string;
      expect(writtenContent).toBe('Author: Jane');
    });
  });

  describe('conditional files', () => {
    it('skips a file when its condition variable is falsy', async () => {
      const template = makeTemplate({
        files: [
          { src: 'docker.hbs', dest: 'Dockerfile', condition: 'useDocker' },
        ],
      });
      const options = makeOptions({ variables: { useDocker: false } });

      const filesCreated = await writeTemplateFiles(template, options);

      expect(filesCreated).toHaveLength(0);
      expect(mockWriteFile).not.toHaveBeenCalled();
    });

    it('includes a file when its condition variable is truthy', async () => {
      const template = makeTemplate({
        files: [
          { src: 'docker.hbs', dest: 'Dockerfile', condition: 'useDocker' },
        ],
      });
      const options = makeOptions({ variables: { useDocker: true } });

      const filesCreated = await writeTemplateFiles(template, options);

      expect(filesCreated).toHaveLength(1);
    });
  });

  describe('security – path containment', () => {
    it('throws when a template dest path attempts directory traversal', async () => {
      const template = makeTemplate({
        files: [{ src: 'evil.hbs', dest: '../../../etc/passwd' }],
      });

      await expect(writeTemplateFiles(template, makeOptions())).rejects.toThrow(
        /Security.*escape the output directory/
      );
    });

    it('does not write any files after a security violation', async () => {
      const template = makeTemplate({
        files: [{ src: 'evil.hbs', dest: '../../../etc/passwd' }],
      });

      await expect(writeTemplateFiles(template, makeOptions())).rejects.toThrow();
      expect(mockWriteFile).not.toHaveBeenCalled();
    });
  });

  describe('missing source file', () => {
    it('throws when a template source file does not exist on disk', async () => {
      (mockPathExists as unknown as jest.Mock).mockResolvedValue(false);

      await expect(writeTemplateFiles(makeTemplate(), makeOptions())).rejects.toThrow(
        /Template source file not found/
      );
    });
  });

  describe('filesystem errors', () => {
    it('propagates writeFile errors', async () => {
      (mockWriteFile as unknown as jest.Mock).mockRejectedValue(new Error('EACCES: permission denied'));

      await expect(writeTemplateFiles(makeTemplate(), makeOptions())).rejects.toThrow('EACCES');
    });

    it('propagates ensureDir errors', async () => {
      (mockEnsureDir as unknown as jest.Mock)
        .mockResolvedValueOnce(undefined) // root dir
        .mockRejectedValueOnce(new Error('ENOSPC: no space left on device'));

      await expect(writeTemplateFiles(makeTemplate(), makeOptions())).rejects.toThrow('ENOSPC');
    });
  });

  describe('empty template', () => {
    it('returns an empty array when the template has no files', async () => {
      const template = makeTemplate({ files: [] });

      const filesCreated = await writeTemplateFiles(template, makeOptions());

      expect(filesCreated).toEqual([]);
    });
  });
});
