// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';

interface CheckResult {
  label: string;
  passed: boolean;
  optional: boolean;
  version: string;
  message: string;
}

function getCommandVersion(command: string, args: string[]): string | null {
  try {
    const result = spawnSync(command, args, {
      encoding: 'utf-8',
      timeout: 10000,
      shell: false,
    });
    if (result.status === 0 && result.stdout) {
      return result.stdout.trim();
    }
    return null;
  } catch {
    return null;
  }
}

function parseVersionNumber(raw: string): string | null {
  const match = raw.match(/(\d+\.\d+\.\d+)/);
  return match ? match[1] : null;
}

function checkNodeVersion(): CheckResult {
  const raw = process.version;
  const version = raw.replace(/^v/, '');
  const major = parseInt(version.split('.')[0], 10);
  if (major >= 18) {
    return { label: 'Node.js', passed: true, optional: false, version, message: '' };
  }
  return { label: 'Node.js', passed: false, optional: false, version, message: `version too old (need >=18.0.0, found ${version})` };
}

function checkNpmVersion(): CheckResult {
  const raw = getCommandVersion('npm', ['--version']);
  if (!raw) {
    return { label: 'npm', passed: false, optional: false, version: '', message: 'not found' };
  }
  const version = parseVersionNumber(raw);
  if (!version) {
    return { label: 'npm', passed: false, optional: false, version: raw, message: 'could not parse version' };
  }
  const major = parseInt(version.split('.')[0], 10);
  if (major >= 8) {
    return { label: 'npm', passed: true, optional: false, version, message: '' };
  }
  return { label: 'npm', passed: false, optional: false, version, message: `version too old (need >=8, found ${version})` };
}

function checkPython(): CheckResult {
  let raw = getCommandVersion('python3', ['--version']);
  if (!raw) {
    raw = getCommandVersion('python', ['--version']);
  }
  if (!raw) {
    return { label: 'Python 3', passed: false, optional: false, version: '', message: 'not found' };
  }
  const version = parseVersionNumber(raw);
  return { label: 'Python 3', passed: true, optional: false, version: version || raw, message: '' };
}

function checkPip(): CheckResult {
  let raw = getCommandVersion('pip3', ['--version']);
  if (!raw) {
    raw = getCommandVersion('pip', ['--version']);
  }
  if (!raw) {
    return { label: 'pip', passed: false, optional: false, version: '', message: 'not found' };
  }
  const version = parseVersionNumber(raw);
  return { label: 'pip', passed: true, optional: false, version: version || raw, message: '' };
}

function checkDocker(): CheckResult {
  const raw = getCommandVersion('docker', ['--version']);
  if (!raw) {
    return { label: 'Docker', passed: false, optional: true, version: '', message: 'not found (optional)' };
  }
  const version = parseVersionNumber(raw);
  return { label: 'Docker', passed: true, optional: true, version: version || raw, message: '' };
}

function checkGit(): CheckResult {
  const raw = getCommandVersion('git', ['--version']);
  if (!raw) {
    return { label: 'Git', passed: false, optional: false, version: '', message: 'not found' };
  }
  const version = parseVersionNumber(raw);
  return { label: 'Git', passed: true, optional: false, version: version || raw, message: '' };
}

function formatResult(result: CheckResult): string {
  if (result.passed) {
    return chalk.green('  \u2714') + ` ${result.label} ${chalk.dim(`v${result.version}`)}`;
  }
  if (result.optional) {
    return chalk.yellow('  \u25CB') + ` ${result.label} ${chalk.yellow(result.message)}`;
  }
  return chalk.red('  \u2718') + ` ${result.label} ${chalk.red(result.message)}`;
}

// ── Project scanning checks ──────────────────────────────────────────────

interface ProjectCheck {
  label: string;
  passed: boolean;
  suggestion: string;
}

function runProjectChecks(projectPath: string): ProjectCheck[] {
  const checks: ProjectCheck[] = [];
  const exists = (f: string) => fs.existsSync(path.join(projectPath, f));

  checks.push({
    label: '.gitignore',
    passed: exists('.gitignore'),
    suggestion: 'Add .gitignore to prevent committing sensitive files',
  });

  const hasLockfile = exists('package-lock.json') || exists('yarn.lock') || exists('pnpm-lock.yaml') || exists('Pipfile.lock');
  checks.push({
    label: 'Lockfile',
    passed: hasLockfile,
    suggestion: 'Run npm install to generate a lockfile',
  });

  checks.push({
    label: 'README.md',
    passed: exists('README.md'),
    suggestion: 'Add a README.md or run forgekit docs generate',
  });

  checks.push({
    label: 'LICENSE',
    passed: exists('LICENSE') || exists('LICENSE.md'),
    suggestion: 'Add a LICENSE file for open-source compliance',
  });

  const hasTests = exists('test') || exists('tests') || exists('__tests__') || exists('spec') || exists('src/__tests__');
  checks.push({
    label: 'Test directory',
    passed: hasTests,
    suggestion: 'Create a test directory and add tests',
  });

  const hasCI = exists('.github/workflows') || exists('.gitlab-ci.yml') || exists('Jenkinsfile');
  checks.push({
    label: 'CI config',
    passed: hasCI,
    suggestion: 'Add CI/CD config (.github/workflows/)',
  });

  checks.push({
    label: 'Dockerfile',
    passed: exists('Dockerfile') || exists('docker-compose.yml'),
    suggestion: 'Add a Dockerfile for containerized deployment',
  });

  // Check for .env without .env.example
  if (exists('.env') && !exists('.env.example')) {
    checks.push({
      label: '.env.example',
      passed: false,
      suggestion: 'Create .env.example so teammates know which variables to set',
    });
  }

  // Outdated deps
  if (exists('package.json')) {
    try {
      const result = spawnSync('npm', ['outdated', '--json'], { cwd: projectPath, encoding: 'utf-8', timeout: 15000 });
      const data = JSON.parse(result.stdout || '{}');
      const outdatedCount = Object.keys(data).length;
      checks.push({
        label: 'Dependencies up-to-date',
        passed: outdatedCount <= 5,
        suggestion: `${outdatedCount} packages outdated. Run npm update or forgekit audit`,
      });
    } catch {
      // Skip if npm outdated fails
    }
  }

  return checks;
}

export function doctorCommand(): Command {
  const cmd = new Command('doctor');
  cmd
    .description('Check system prerequisites and project health')
    .option('--project', 'Also scan current project for issues')
    .option('-p, --path <path>', 'Project path (with --project)', '.')
    .action((options) => {
      console.log(chalk.bold.cyan('\n  ForgeKit Doctor\n'));

      // System checks
      console.log(chalk.bold('  System Prerequisites:\n'));
      const checks: CheckResult[] = [
        checkNodeVersion(),
        checkNpmVersion(),
        checkPython(),
        checkPip(),
        checkDocker(),
        checkGit(),
      ];

      for (const check of checks) {
        console.log(formatResult(check));
      }

      const passed = checks.filter(c => c.passed).length;
      const failed = checks.filter(c => !c.passed && !c.optional).length;

      console.log('');
      console.log(`  ${passed} checks passed, ${failed} failed`);

      // Project checks
      if (options.project) {
        const projectPath = path.resolve(options.path);
        console.log(chalk.bold(`\n  Project Health (${projectPath}):\n`));

        const projectChecks = runProjectChecks(projectPath);

        for (const check of projectChecks) {
          if (check.passed) {
            console.log(chalk.green('  \u2714') + ` ${check.label}`);
          } else {
            console.log(chalk.red('  \u2718') + ` ${check.label}`);
            console.log(chalk.dim(`    → ${check.suggestion}`));
          }
        }

        const pPassed = projectChecks.filter(c => c.passed).length;
        const pFailed = projectChecks.filter(c => !c.passed).length;
        console.log(`\n  ${pPassed} passed, ${pFailed} need attention`);
      }

      console.log('');

      if (failed > 0) {
        process.exit(1);
      }
    });
  return cmd;
}
