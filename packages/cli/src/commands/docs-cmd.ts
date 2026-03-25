// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { analyzeProject, generateReadme } from '../core/docs-generator';

export function docsCommand(): Command {
  const cmd = new Command('docs');
  cmd.description('Generate project documentation');

  cmd
    .command('generate')
    .description('Scan your project and generate a README')
    .option('-p, --path <path>', 'Project path to scan', '.')
    .option('-o, --output <path>', 'Output file path', 'README.md')
    .option('--force', 'Overwrite existing file without prompting')
    .option('--stdout', 'Print to stdout instead of writing a file')
    .action(async (options) => {
      const projectPath = path.resolve(options.path);

      if (!fs.existsSync(projectPath)) {
        console.error(chalk.red(`\n  Path not found: ${projectPath}\n`));
        process.exit(1);
      }

      console.log(chalk.bold.cyan('\n  ForgeKit Docs Generator\n'));
      console.log(chalk.dim(`  Analyzing ${projectPath}...\n`));

      const analysis = analyzeProject(projectPath);
      const readme = generateReadme(analysis);

      if (options.stdout) {
        console.log(readme);
        return;
      }

      const outputPath = path.resolve(options.output);

      if (fs.existsSync(outputPath) && !options.force) {
        const inquirer = await import('inquirer');
        const { overwrite } = await inquirer.default.prompt([{
          type: 'confirm',
          name: 'overwrite',
          message: `${outputPath} already exists. Overwrite?`,
          default: false,
        }]);
        if (!overwrite) {
          console.log(chalk.dim('  Cancelled.\n'));
          return;
        }
      }

      fs.writeFileSync(outputPath, readme);
      console.log(chalk.green(`  README generated at ${outputPath}`));
      console.log(chalk.dim(`  ${analysis.dependencies.length} dependencies documented`));
      console.log(chalk.dim(`  ${Object.keys(analysis.scripts).length} scripts documented\n`));
    });

  return cmd;
}
