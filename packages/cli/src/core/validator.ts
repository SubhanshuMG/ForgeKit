// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import * as path from 'path';
import * as fs from 'fs-extra';

export interface ValidationResult {
  passed: boolean;
  checks: { name: string; passed: boolean; message?: string }[];
}

export async function validateScaffoldOutput(projectPath: string): Promise<ValidationResult> {
  const checks = [];

  // Check directory exists
  const dirExists = await fs.pathExists(projectPath);
  checks.push({ name: 'output directory exists', passed: dirExists });

  // Check package.json or pyproject.toml exists
  const hasPackageJson = await fs.pathExists(path.join(projectPath, 'package.json'));
  const hasPyProject = await fs.pathExists(path.join(projectPath, 'pyproject.toml'));
  const hasRequirements = await fs.pathExists(path.join(projectPath, 'requirements.txt'));
  checks.push({
    name: 'project manifest exists',
    passed: hasPackageJson || hasPyProject || hasRequirements,
    message: 'Expected package.json, pyproject.toml, or requirements.txt',
  });

  // Check README exists
  const hasReadme = await fs.pathExists(path.join(projectPath, 'README.md'));
  checks.push({ name: 'README.md exists', passed: hasReadme });

  return {
    passed: checks.every(c => c.passed),
    checks,
  };
}
