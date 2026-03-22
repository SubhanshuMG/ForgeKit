// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/Subhanshumohangupta/ForgeKit

jest.mock('fs-extra');

import * as fs from 'fs-extra';
import { validateScaffoldOutput } from '../core/validator';

const mockPathExists = fs.pathExists as jest.MockedFunction<typeof fs.pathExists>;

describe('validateScaffoldOutput', () => {
  const projectPath = '/tmp/test-project';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('output directory check', () => {
    it('reports directory-exists check as passed when the directory exists', async () => {
      mockPathExists.mockResolvedValue(true as never);

      const result = await validateScaffoldOutput(projectPath);

      const dirCheck = result.checks.find(c => c.name === 'output directory exists');
      expect(dirCheck).toBeDefined();
      expect(dirCheck!.passed).toBe(true);
    });

    it('reports directory-exists check as failed when the directory is missing', async () => {
      mockPathExists.mockResolvedValue(false as never);

      const result = await validateScaffoldOutput(projectPath);

      const dirCheck = result.checks.find(c => c.name === 'output directory exists');
      expect(dirCheck!.passed).toBe(false);
    });
  });

  describe('project manifest check', () => {
    it('passes when package.json is present', async () => {
      // index 0 = dir, 1 = package.json, 2 = pyproject, 3 = requirements, 4 = README
      mockPathExists
        .mockResolvedValueOnce(true as never)  // dir
        .mockResolvedValueOnce(true as never)  // package.json
        .mockResolvedValueOnce(false as never) // pyproject.toml
        .mockResolvedValueOnce(false as never) // requirements.txt
        .mockResolvedValueOnce(true as never); // README.md

      const result = await validateScaffoldOutput(projectPath);

      const manifestCheck = result.checks.find(c => c.name === 'project manifest exists');
      expect(manifestCheck!.passed).toBe(true);
    });

    it('passes when pyproject.toml is present', async () => {
      mockPathExists
        .mockResolvedValueOnce(true as never)  // dir
        .mockResolvedValueOnce(false as never) // package.json
        .mockResolvedValueOnce(true as never)  // pyproject.toml
        .mockResolvedValueOnce(false as never) // requirements.txt
        .mockResolvedValueOnce(true as never); // README.md

      const result = await validateScaffoldOutput(projectPath);

      const manifestCheck = result.checks.find(c => c.name === 'project manifest exists');
      expect(manifestCheck!.passed).toBe(true);
    });

    it('passes when requirements.txt is present', async () => {
      mockPathExists
        .mockResolvedValueOnce(true as never)  // dir
        .mockResolvedValueOnce(false as never) // package.json
        .mockResolvedValueOnce(false as never) // pyproject.toml
        .mockResolvedValueOnce(true as never)  // requirements.txt
        .mockResolvedValueOnce(true as never); // README.md

      const result = await validateScaffoldOutput(projectPath);

      const manifestCheck = result.checks.find(c => c.name === 'project manifest exists');
      expect(manifestCheck!.passed).toBe(true);
    });

    it('fails when no manifest file is present', async () => {
      mockPathExists
        .mockResolvedValueOnce(true as never)  // dir
        .mockResolvedValueOnce(false as never) // package.json
        .mockResolvedValueOnce(false as never) // pyproject.toml
        .mockResolvedValueOnce(false as never) // requirements.txt
        .mockResolvedValueOnce(true as never); // README.md

      const result = await validateScaffoldOutput(projectPath);

      const manifestCheck = result.checks.find(c => c.name === 'project manifest exists');
      expect(manifestCheck!.passed).toBe(false);
      expect(manifestCheck!.message).toMatch(/package\.json|pyproject\.toml|requirements\.txt/);
    });
  });

  describe('README check', () => {
    it('passes when README.md is present', async () => {
      mockPathExists
        .mockResolvedValueOnce(true as never)  // dir
        .mockResolvedValueOnce(true as never)  // package.json
        .mockResolvedValueOnce(false as never) // pyproject.toml
        .mockResolvedValueOnce(false as never) // requirements.txt
        .mockResolvedValueOnce(true as never); // README.md

      const result = await validateScaffoldOutput(projectPath);

      const readmeCheck = result.checks.find(c => c.name === 'README.md exists');
      expect(readmeCheck!.passed).toBe(true);
    });

    it('fails when README.md is missing', async () => {
      mockPathExists
        .mockResolvedValueOnce(true as never)  // dir
        .mockResolvedValueOnce(true as never)  // package.json
        .mockResolvedValueOnce(false as never) // pyproject.toml
        .mockResolvedValueOnce(false as never) // requirements.txt
        .mockResolvedValueOnce(false as never); // README.md

      const result = await validateScaffoldOutput(projectPath);

      const readmeCheck = result.checks.find(c => c.name === 'README.md exists');
      expect(readmeCheck!.passed).toBe(false);
    });
  });

  describe('overall passed flag', () => {
    it('is true when all checks pass', async () => {
      mockPathExists.mockResolvedValue(true as never);

      const result = await validateScaffoldOutput(projectPath);

      expect(result.passed).toBe(true);
    });

    it('is false when at least one check fails', async () => {
      // dir exists, package.json present, pyproject absent, requirements absent, README missing
      mockPathExists
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(false as never)
        .mockResolvedValueOnce(false as never)
        .mockResolvedValueOnce(false as never);

      const result = await validateScaffoldOutput(projectPath);

      expect(result.passed).toBe(false);
    });

    it('is false when directory does not exist', async () => {
      mockPathExists.mockResolvedValue(false as never);

      const result = await validateScaffoldOutput(projectPath);

      expect(result.passed).toBe(false);
    });
  });

  describe('return shape', () => {
    it('always returns a checks array with exactly 3 entries', async () => {
      mockPathExists.mockResolvedValue(true as never);

      const result = await validateScaffoldOutput(projectPath);

      expect(result.checks).toHaveLength(3);
    });

    it('each check has at minimum a name and passed field', async () => {
      mockPathExists.mockResolvedValue(true as never);

      const result = await validateScaffoldOutput(projectPath);

      for (const check of result.checks) {
        expect(typeof check.name).toBe('string');
        expect(typeof check.passed).toBe('boolean');
      }
    });
  });
});
