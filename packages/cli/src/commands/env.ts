// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';
import { pushEnv, pullEnv, listEnvs, parseEnvFile, diffEnvs } from '../core/env-sync';

export function envCommand(): Command {
  const cmd = new Command('env');
  cmd.description('Manage encrypted environment variables');

  cmd
    .command('push [environment]')
    .description('Encrypt and store current .env file')
    .option('-f, --file <path>', 'Path to .env file', '.env')
    .action(async (environment, options) => {
      const envFile = path.resolve(options.file);
      if (!fs.existsSync(envFile)) {
        console.error(chalk.red(`\n  File not found: ${envFile}\n`));
        process.exit(1);
      }

      const env = environment || 'development';
      const content = fs.readFileSync(envFile, 'utf-8');
      const vars = parseEnvFile(content);

      console.log(chalk.bold.cyan(`\n  Pushing ${Object.keys(vars).length} variables to "${env}"\n`));

      const { passphrase } = await inquirer.prompt([{
        type: 'password',
        name: 'passphrase',
        message: 'Encryption passphrase:',
        validate: (v: string) => v.length >= 8 ? true : 'Passphrase must be at least 8 characters',
      }]);

      pushEnv(process.cwd(), env, content, passphrase);
      console.log(chalk.green(`\n  Environment "${env}" stored and encrypted.\n`));
    });

  cmd
    .command('pull [environment]')
    .description('Decrypt and restore .env file')
    .option('-o, --output <path>', 'Output path', '.env')
    .action(async (environment, options) => {
      const env = environment || 'development';

      const { passphrase } = await inquirer.prompt([{
        type: 'password',
        name: 'passphrase',
        message: 'Decryption passphrase:',
      }]);

      try {
        const content = pullEnv(process.cwd(), env, passphrase);
        const outputPath = path.resolve(options.output);

        let fileExists = false;
        try { fs.accessSync(outputPath, fs.constants.F_OK); fileExists = true; } catch { /* does not exist */ }
        if (fileExists) {
          const { overwrite } = await inquirer.prompt([{
            type: 'confirm',
            name: 'overwrite',
            message: `${outputPath} already exists. Overwrite?`,
            default: false,
          }]);
          if (!overwrite) {
            console.log(chalk.dim('\n  Cancelled.\n'));
            return;
          }
        }

        fs.writeFileSync(outputPath, content, { mode: 0o600 });
        console.log(chalk.green(`\n  Environment "${env}" restored to ${outputPath}\n`));
      } catch (err) {
        console.error(chalk.red(`\n  ${(err as Error).message}\n`));
        process.exit(1);
      }
    });

  cmd
    .command('list')
    .description('List stored environments')
    .action(() => {
      const envs = listEnvs(process.cwd());
      if (envs.length === 0) {
        console.log(chalk.dim('\n  No stored environments. Run forgekit env push to store one.\n'));
        return;
      }
      console.log(chalk.bold.cyan('\n  Stored Environments:\n'));
      envs.forEach(e => console.log(`  ${chalk.green('\u2713')} ${e}`));
      console.log('');
    });

  cmd
    .command('diff <env1> <env2>')
    .description('Compare two stored environments')
    .action(async (env1Name, env2Name) => {
      const { passphrase } = await inquirer.prompt([{
        type: 'password',
        name: 'passphrase',
        message: 'Decryption passphrase:',
      }]);

      try {
        const content1 = pullEnv(process.cwd(), env1Name, passphrase);
        const content2 = pullEnv(process.cwd(), env2Name, passphrase);
        const vars1 = parseEnvFile(content1);
        const vars2 = parseEnvFile(content2);
        const diff = diffEnvs(vars1, vars2);

        console.log(chalk.bold.cyan(`\n  Diff: ${env1Name} vs ${env2Name}\n`));

        if (diff.added.length > 0) {
          console.log(chalk.green(`  Added in ${env2Name}:`));
          diff.added.forEach(k => console.log(chalk.green(`    + ${k}`)));
        }
        if (diff.removed.length > 0) {
          console.log(chalk.red(`\n  Removed in ${env2Name}:`));
          diff.removed.forEach(k => console.log(chalk.red(`    - ${k}`)));
        }
        if (diff.changed.length > 0) {
          console.log(chalk.yellow(`\n  Changed:`));
          diff.changed.forEach(k => console.log(chalk.yellow(`    ~ ${k}`)));
        }
        if (diff.added.length === 0 && diff.removed.length === 0 && diff.changed.length === 0) {
          console.log(chalk.green('  Environments are identical.'));
        }
        console.log('');
      } catch (err) {
        console.error(chalk.red(`\n  ${(err as Error).message}\n`));
        process.exit(1);
      }
    });

  return cmd;
}
