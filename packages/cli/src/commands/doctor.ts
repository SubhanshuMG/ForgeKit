// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import { Command } from 'commander';
import chalk from 'chalk';
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

export function doctorCommand(): Command {
  const cmd = new Command('doctor');
  cmd
    .description('Check system prerequisites for ForgeKit')
    .action(() => {
      console.log(chalk.bold.cyan('\n  ForgeKit Doctor\n'));

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
      console.log('');

      if (failed > 0) {
        process.exit(1);
      }
    });
  return cmd;
}
