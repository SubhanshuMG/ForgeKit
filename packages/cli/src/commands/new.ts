// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import * as path from 'path';
import { listTemplates } from '../core/template-resolver';
import { scaffold } from '../core/scaffold';
import { sanitizeProjectName } from '../core/security';

export function newCommand(): Command {
  const cmd = new Command('new');
  cmd
    .description('Scaffold a new project from a template')
    .argument('[name]', 'Project name')
    .option('-t, --template <id>', 'Template ID (skip interactive selection)')
    .option('-d, --dir <path>', 'Output directory', '.')
    .option('--skip-install', 'Skip running npm/pip install after scaffolding')
    .option('--dry-run', 'Show what files would be created without writing anything')
    .action(async (name, options) => {
      console.log(chalk.bold.cyan('\n  ForgeKit, Engineering Acceleration Platform\n'));

      const templates = await listTemplates();

      // Get project name
      let projectName = name;
      if (!projectName) {
        const answer = await inquirer.prompt([{
          type: 'input',
          name: 'projectName',
          message: 'Project name:',
          validate: (v: string) => v.trim().length > 0 ? true : 'Project name is required',
        }]);
        projectName = answer.projectName;
      }
      projectName = sanitizeProjectName(projectName);

      // Get template
      let templateId = options.template;
      if (!templateId) {
        const answer = await inquirer.prompt([{
          type: 'list',
          name: 'templateId',
          message: 'Choose a template:',
          choices: templates.map(t => ({
            name: `${t.name}, ${t.description}`,
            value: t.id,
            short: t.name,
          })),
        }]);
        templateId = answer.templateId;
      }

      const dryRun: boolean = options.dryRun === true;

      if (dryRun) {
        const result = await scaffold({
          projectName,
          templateId,
          outputDir: path.resolve(options.dir),
          variables: { name: projectName },
          skipInstall: true,
          dryRun: true,
        });

        if (!result.success) {
          result.errors.forEach(e => console.error(chalk.red(`  \u2717 ${e}`)));
          process.exit(1);
        }

        result.filesCreated.forEach(f => {
          console.log(chalk.dim(`  \u2713 would create: ${f}`));
        });
        console.log(chalk.dim(`\n  ${result.filesCreated.length} file(s) total`));
        console.log(chalk.yellow('\n  [dry-run] No files written.\n'));
        return;
      }

      // Scaffold
      const spinner = ora({
        text: `Scaffolding ${chalk.cyan(projectName)} from template ${chalk.yellow(templateId)}...`,
        color: 'cyan',
      }).start();

      const startTime = Date.now();

      const result = await scaffold({
        projectName,
        templateId,
        outputDir: path.resolve(options.dir),
        variables: { name: projectName },
        skipInstall: options.skipInstall,
      });

      const elapsedMs = Date.now() - startTime;
      const elapsedSec = (elapsedMs / 1000).toFixed(1);

      if (result.success) {
        spinner.succeed(chalk.green(`Project ${chalk.bold(projectName)} created successfully!`));
        console.log(chalk.dim(`\n  ${result.filesCreated.length} files created in ${result.projectPath}`));
        console.log(chalk.dim(`  Scaffolded in ${elapsedSec}s\n`));
        console.log(chalk.bold('  Next steps:\n'));
        result.nextSteps.forEach((step, i) => {
          console.log(chalk.cyan(`  ${i + 1}.`) + ` ${step}`);
        });
        console.log('');
      } else {
        spinner.fail(chalk.red('Scaffolding failed'));
        result.errors.forEach(e => console.error(chalk.red(`  \u2717 ${e}`)));
        process.exit(1);
      }
    });

  return cmd;
}
