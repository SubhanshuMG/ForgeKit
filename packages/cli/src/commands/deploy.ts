// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';
import inquirer from 'inquirer';
import { DetectedStack, DeployResult } from '../types';

function detectStacks(projectPath: string): DetectedStack[] {
  const stacks: DetectedStack[] = [];
  const exists = (f: string) => fs.existsSync(path.join(projectPath, f));

  if (exists('vercel.json') || exists('next.config.js') || exists('next.config.mjs') || exists('next.config.ts')) {
    stacks.push({ provider: 'vercel', confidence: 0.9, reason: 'Detected Next.js or vercel.json' });
  }
  if (exists('fly.toml')) {
    stacks.push({ provider: 'fly', confidence: 0.9, reason: 'Detected fly.toml' });
  }
  if (exists('Procfile')) {
    stacks.push({ provider: 'railway', confidence: 0.7, reason: 'Detected Procfile' });
  }
  if (exists('serverless.yml') || exists('serverless.ts')) {
    stacks.push({ provider: 'serverless', confidence: 0.8, reason: 'Detected serverless config' });
  }
  if (exists('Dockerfile') && stacks.length === 0) {
    stacks.push({ provider: 'railway', confidence: 0.6, reason: 'Detected Dockerfile' });
    stacks.push({ provider: 'fly', confidence: 0.6, reason: 'Detected Dockerfile' });
  }
  if (exists('package.json') && stacks.length === 0) {
    stacks.push({ provider: 'vercel', confidence: 0.4, reason: 'Detected Node.js project' });
    stacks.push({ provider: 'railway', confidence: 0.4, reason: 'Detected Node.js project' });
  }

  return stacks.sort((a, b) => b.confidence - a.confidence);
}

function isInstalled(cmd: string): boolean {
  try {
    const result = spawnSync('which', [cmd], { encoding: 'utf-8', timeout: 5000 });
    return result.status === 0;
  } catch {
    return false;
  }
}

function getInstallHint(provider: string): string {
  switch (provider) {
    case 'vercel': return 'npm install -g vercel';
    case 'railway': return 'npm install -g @railway/cli';
    case 'fly': return 'curl -L https://fly.io/install.sh | sh';
    case 'serverless': return 'npm install -g serverless';
    default: return '';
  }
}

function runDeploy(provider: string, projectPath: string, production: boolean): DeployResult {
  const logs: string[] = [];
  const errors: string[] = [];
  let cmd: string;
  let args: string[];

  switch (provider) {
    case 'vercel':
      cmd = 'vercel';
      args = production ? ['--prod', '--yes'] : ['--yes'];
      break;
    case 'railway':
      cmd = 'railway';
      args = ['up'];
      break;
    case 'fly':
      cmd = 'fly';
      args = ['deploy'];
      break;
    case 'serverless':
      cmd = 'serverless';
      args = ['deploy'];
      break;
    default:
      return { success: false, logs: [], errors: [`Unknown provider: ${provider}`] };
  }

  const result = spawnSync(cmd, args, {
    cwd: projectPath,
    encoding: 'utf-8',
    timeout: 300000, // 5 minute timeout for deploys
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  if (result.stdout) logs.push(result.stdout);
  if (result.stderr) errors.push(result.stderr);

  // Try to extract URL from output
  let url: string | undefined;
  const urlMatch = (result.stdout || '').match(/https?:\/\/[^\s]+/);
  if (urlMatch) url = urlMatch[0];

  return {
    success: result.status === 0,
    url,
    logs,
    errors: result.status !== 0 ? errors : [],
  };
}

export function deployCommand(): Command {
  const cmd = new Command('deploy');
  cmd
    .description('Deploy your project with auto-detected provider')
    .option('-p, --path <path>', 'Project path', '.')
    .option('--provider <name>', 'Force a specific provider (vercel, railway, fly, serverless)')
    .option('--production', 'Deploy to production', false)
    .option('--dry-run', 'Show what would be deployed without deploying')
    .action(async (options) => {
      const projectPath = path.resolve(options.path);
      console.log(chalk.bold.cyan('\n  ForgeKit Deploy\n'));

      // Detect or use specified provider
      let provider = options.provider;

      if (!provider) {
        const stacks = detectStacks(projectPath);

        if (stacks.length === 0) {
          console.log(chalk.red('  Could not detect your deployment target.'));
          console.log(chalk.dim('  Add a vercel.json, fly.toml, Procfile, or Dockerfile.\n'));
          process.exit(1);
        }

        if (stacks.length === 1) {
          provider = stacks[0].provider;
          console.log(chalk.dim(`  Detected: ${stacks[0].reason}\n`));
        } else {
          console.log(chalk.dim('  Multiple deployment targets detected:\n'));
          const answer = await inquirer.prompt([{
            type: 'list',
            name: 'provider',
            message: 'Choose a deployment provider:',
            choices: stacks.map(s => ({
              name: `${s.provider} (${s.reason})`,
              value: s.provider,
            })),
          }]);
          provider = answer.provider;
        }
      }

      // Check if CLI is installed
      const cliCmd = provider === 'serverless' ? 'serverless' : provider;
      if (!isInstalled(cliCmd)) {
        console.log(chalk.red(`  ${provider} CLI is not installed.\n`));
        console.log(chalk.dim(`  Install it with: ${getInstallHint(provider)}\n`));
        process.exit(1);
      }

      if (options.dryRun) {
        console.log(chalk.yellow(`  [dry-run] Would deploy to ${chalk.bold(provider)}${options.production ? ' (production)' : ''}\n`));
        return;
      }

      // Confirm deployment
      const confirm = await inquirer.prompt([{
        type: 'confirm',
        name: 'proceed',
        message: `Deploy to ${provider}${options.production ? ' (production)' : ''}?`,
        default: true,
      }]);

      if (!confirm.proceed) {
        console.log(chalk.dim('\n  Deployment cancelled.\n'));
        return;
      }

      const spinner = ora(`Deploying to ${provider}...`).start();
      const result = runDeploy(provider, projectPath, options.production);

      if (result.success) {
        spinner.succeed(chalk.green('Deployed successfully!'));
        if (result.url) {
          console.log(chalk.bold(`\n  URL: ${chalk.cyan(result.url)}\n`));
        }
      } else {
        spinner.fail(chalk.red('Deployment failed'));
        result.errors.forEach(e => console.error(chalk.dim(e)));
        process.exit(1);
      }
    });

  return cmd;
}
