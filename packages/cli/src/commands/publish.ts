// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';
import {
  validateTemplate,
  generateManifest,
} from '../core/community-registry';

const REGISTRY_REPO = 'https://github.com/SubhanshuMG/ForgeKit';

export function publishCommand(): Command {
  const cmd = new Command('publish');
  cmd
    .description('Prepare and validate a template for publishing to the ForgeKit community registry')
    .option('-d, --dir <path>', 'Path to the template directory', '.')
    .option('--dry-run', 'Validate only, do not create a tarball')
    .action(async (options: { dir: string; dryRun?: boolean }) => {
      const projectPath = path.resolve(options.dir);

      console.log(chalk.bold.cyan('\n  ForgeKit Template Publisher\n'));

      // Step 1: Check for forgekit.json
      const manifestPath = path.join(projectPath, 'forgekit.json');
      let manifestExists = false;
      try { fs.accessSync(manifestPath, fs.constants.F_OK); manifestExists = true; } catch { /* does not exist */ }
      if (!manifestExists) {
        console.log(chalk.yellow('  No forgekit.json found in this directory.\n'));

        const { shouldGenerate } = await inquirer.prompt([{
          type: 'confirm',
          name: 'shouldGenerate',
          message: 'Would you like to generate a forgekit.json manifest?',
          default: true,
        }]);

        if (!shouldGenerate) {
          console.log(chalk.dim('\n  A forgekit.json manifest is required to publish. Aborting.\n'));
          process.exitCode = 1;
          return;
        }

        const autoManifest = generateManifest(projectPath);

        // Allow user to customize key fields
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'id',
            message: 'Template ID (lowercase, hyphens only):',
            default: autoManifest['id'],
            validate: (input: string) =>
              /^[a-z0-9][a-z0-9-]*$/.test(input.trim()) || 'Must be lowercase alphanumeric with hyphens.',
          },
          {
            type: 'input',
            name: 'name',
            message: 'Template name:',
            default: autoManifest['name'],
            validate: (input: string) => input.trim().length > 0 || 'Name is required.',
          },
          {
            type: 'input',
            name: 'description',
            message: 'Description:',
            default: autoManifest['description'],
          },
          {
            type: 'input',
            name: 'version',
            message: 'Version:',
            default: autoManifest['version'],
            validate: (input: string) =>
              /^\d+\.\d+\.\d+/.test(input.trim()) || 'Must follow semver format (e.g., 1.0.0).',
          },
          {
            type: 'input',
            name: 'author',
            message: 'Author:',
            default: autoManifest['author'] || undefined,
          },
        ]);

        const finalManifest = {
          ...autoManifest,
          id: answers.id.trim(),
          name: answers.name.trim(),
          description: answers.description.trim(),
          version: answers.version.trim(),
          author: answers.author?.trim() || autoManifest['author'],
        };

        const spinner = ora('Writing forgekit.json...').start();
        try {
          fs.writeFileSync(
            manifestPath,
            JSON.stringify(finalManifest, null, 2) + '\n',
            'utf-8'
          );
          spinner.succeed(chalk.green('forgekit.json created.'));
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          spinner.fail(chalk.red(`Failed to write forgekit.json: ${message}`));
          process.exitCode = 1;
          return;
        }
      }

      // Step 2: Validate the template
      console.log('');
      const validationSpinner = ora('Validating template...').start();
      const result = validateTemplate(projectPath);

      if (!result.valid) {
        validationSpinner.fail(chalk.red('Template validation failed.'));
        console.log('');
        for (const error of result.errors) {
          const isWarning = error.includes('not required, but strongly recommended');
          const prefix = isWarning ? chalk.yellow('  WARNING') : chalk.red('  ERROR');
          console.log(`${prefix}  ${error}`);
        }
        console.log('');
        process.exitCode = 1;
        return;
      }

      // Show warnings even on success
      const warnings = result.errors.filter(e => e.includes('not required, but strongly recommended'));
      if (warnings.length > 0) {
        validationSpinner.succeed(chalk.green('Template is valid (with warnings).'));
        console.log('');
        for (const warning of warnings) {
          console.log(`  ${chalk.yellow('WARNING')}  ${warning}`);
        }
      } else {
        validationSpinner.succeed(chalk.green('Template is valid.'));
      }

      // Step 3: Show publish summary
      let manifest: Record<string, unknown>;
      try {
        const raw = fs.readFileSync(manifestPath, 'utf-8');
        manifest = JSON.parse(raw);
      } catch {
        console.log(chalk.red('\n  Failed to read forgekit.json for summary.\n'));
        process.exitCode = 1;
        return;
      }

      console.log(chalk.bold.cyan('\n  Publish Summary\n'));
      console.log(`  ${chalk.dim('ID:')}           ${manifest['id']}`);
      console.log(`  ${chalk.dim('Name:')}         ${manifest['name']}`);
      console.log(`  ${chalk.dim('Version:')}      ${manifest['version']}`);
      console.log(`  ${chalk.dim('Author:')}       ${manifest['author'] || '-'}`);
      console.log(`  ${chalk.dim('Description:')}  ${manifest['description'] || '-'}`);
      if (Array.isArray(manifest['stack']) && manifest['stack'].length > 0) {
        console.log(`  ${chalk.dim('Stack:')}        ${(manifest['stack'] as string[]).join(', ')}`);
      }
      if (Array.isArray(manifest['tags']) && manifest['tags'].length > 0) {
        console.log(`  ${chalk.dim('Tags:')}         ${(manifest['tags'] as string[]).join(', ')}`);
      }
      console.log('');

      if (options.dryRun) {
        console.log(chalk.dim('  Dry run complete. No tarball was created.\n'));
        return;
      }

      // Step 4: Generate tarball
      const tarballSpinner = ora('Creating tarball...').start();

      const tarballName = `${manifest['id']}-${manifest['version']}.tar.gz`;
      const tarballPath = path.join(projectPath, tarballName);

      // Build exclusion list for tar
      const excludePatterns = [
        'node_modules',
        '.git',
        '.env',
        '.env.*',
        '*.tar.gz',
        '.DS_Store',
      ];

      const tarArgs = [
        'czf', tarballPath,
        ...excludePatterns.flatMap(p => ['--exclude', p]),
        '-C', path.dirname(projectPath),
        path.basename(projectPath),
      ];

      const tarResult = spawnSync('tar', tarArgs, {
        encoding: 'utf-8',
        timeout: 60_000,
      });

      if (tarResult.status !== 0) {
        const stderr = (tarResult.stderr || '').trim();
        tarballSpinner.fail(chalk.red(`Failed to create tarball: ${stderr || 'unknown error'}`));
        process.exitCode = 1;
        return;
      }

      // Get tarball size
      let sizeStr = '';
      try {
        const stat = fs.statSync(tarballPath);
        const sizeKB = (stat.size / 1024).toFixed(1);
        sizeStr = ` (${sizeKB} KB)`;
      } catch {
        // Ignore size check errors
      }

      tarballSpinner.succeed(chalk.green(`Tarball created: ${tarballName}${sizeStr}`));

      // Step 5: Show submission instructions
      console.log(chalk.bold.cyan('\n  Next Steps: Submit to the Community Registry\n'));
      console.log(`  1. Fork the ForgeKit repository:`);
      console.log(`     ${chalk.white(REGISTRY_REPO)}\n`);
      console.log(`  2. Add your template tarball to the ${chalk.white('community-templates/')} directory.\n`);
      console.log(`  3. Update the community registry index with your template metadata.\n`);
      console.log(`  4. Open a pull request with:`);
      console.log(`     - Your template tarball`);
      console.log(`     - A brief description of the template`);
      console.log(`     - Any relevant screenshots or usage examples\n`);
      console.log(`  5. A maintainer will review and merge your submission.\n`);
      console.log(chalk.dim(`  Your tarball is ready at: ${tarballPath}\n`));
    });

  return cmd;
}
