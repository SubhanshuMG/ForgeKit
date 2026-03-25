// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as path from 'path';
import { listTemplates } from '../core/template-resolver';
import { scaffold } from '../core/scaffold';
import { sanitizeProjectName } from '../core/security';

async function loadClack() {
  // @clack/prompts is ESM-only; use dynamic import for CJS compatibility
  return await import('@clack/prompts');
}

export function newCommand(): Command {
  const cmd = new Command('new');
  cmd
    .description('Scaffold a new project from a template')
    .argument('[name]', 'Project name')
    .option('-t, --template <id>', 'Template ID (skip interactive selection)')
    .option('-d, --dir <path>', 'Output directory', '.')
    .option('--skip-install', 'Skip running npm/pip install after scaffolding')
    .option('--dry-run', 'Show what files would be created without writing anything')
    .option('--ai <description>', 'Use AI to select the best template for your project')
    .action(async (name, options) => {
      const templates = await listTemplates();
      let projectName = name;
      let templateId = options.template;

      // ── AI mode ─────────────────────────────────────────────────────
      if (options.ai) {
        const clack = await loadClack();
        clack.intro(chalk.bgCyan(chalk.black(' ForgeKit AI ')));

        const s = clack.spinner();
        s.start('Analyzing your project description...');

        try {
          const { getAIProvider } = await import('../core/ai-providers/index');
          const provider = getAIProvider();
          const spec = await provider.generateProjectSpec(options.ai, templates);
          s.stop('AI recommendation ready!');

          clack.note(
            [
              `Template:  ${chalk.bold.yellow(spec.templateId)}`,
              `Name:      ${chalk.bold.cyan(spec.projectName)}`,
              '',
              spec.explanation,
            ].join('\n'),
            'AI Recommendation'
          );

          const confirmed = await clack.confirm({
            message: 'Use this recommendation?',
          });

          if (clack.isCancel(confirmed) || !confirmed) {
            clack.cancel('Cancelled. Run forgekit new to choose manually.');
            process.exit(0);
          }

          projectName = spec.projectName;
          templateId = spec.templateId;
        } catch (err) {
          s.stop('AI analysis failed');
          console.error(chalk.red(`\n  ${(err as Error).message}\n`));
          process.exit(1);
        }
      }

      // ── Interactive mode (clack prompts) ────────────────────────────
      if (!projectName || !templateId) {
        let clack: Awaited<ReturnType<typeof loadClack>>;
        try {
          clack = await loadClack();
        } catch {
          // Fallback to basic prompts if clack is unavailable
          const inquirer = await import('inquirer');

          if (!projectName) {
            const answer = await inquirer.default.prompt([{
              type: 'input',
              name: 'projectName',
              message: 'Project name:',
              validate: (v: string) => v.trim().length > 0 ? true : 'Project name is required',
            }]);
            projectName = answer.projectName;
          }

          if (!templateId) {
            const answer = await inquirer.default.prompt([{
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

          projectName = sanitizeProjectName(projectName);
          await runScaffold(projectName, templateId, options, templates);
          return;
        }

        if (!options.ai) {
          clack.intro(chalk.bgCyan(chalk.black(' ForgeKit ')));
        }

        if (!projectName) {
          const nameResult = await clack.text({
            message: 'What is your project name?',
            placeholder: 'my-awesome-app',
            validate: (v: string | undefined) => {
              if (!v || v.trim().length === 0) return 'Project name is required';
              return undefined;
            },
          });

          if (clack.isCancel(nameResult)) {
            clack.cancel('Operation cancelled.');
            process.exit(0);
          }
          projectName = nameResult as string;
        }

        if (!templateId) {
          // Group templates by category
          const templateOptions = templates.map(t => ({
            value: t.id,
            label: t.name,
            hint: `${t.stack.join(', ')} — ${t.description}`,
          }));

          const templateResult = await clack.select({
            message: 'Choose a template',
            options: templateOptions,
          });

          if (clack.isCancel(templateResult)) {
            clack.cancel('Operation cancelled.');
            process.exit(0);
          }
          templateId = templateResult as string;
        }
      }

      projectName = sanitizeProjectName(projectName);
      await runScaffold(projectName, templateId, options, templates);
    });

  return cmd;
}

async function runScaffold(
  projectName: string,
  templateId: string,
  options: { dir: string; skipInstall?: boolean; dryRun?: boolean },
  _templates: unknown[]
): Promise<void> {
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

    // Try to use clack for nice output
    try {
      const clack = await loadClack();
      clack.note(result.nextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n'), 'Next steps');
      clack.outro(chalk.green('Happy coding!'));
    } catch {
      console.log(chalk.bold('  Next steps:\n'));
      result.nextSteps.forEach((step, i) => {
        console.log(chalk.cyan(`  ${i + 1}.`) + ` ${step}`);
      });
      console.log('');
    }
  } else {
    spinner.fail(chalk.red('Scaffolding failed'));
    result.errors.forEach(e => console.error(chalk.red(`  \u2717 ${e}`)));
    process.exit(1);
  }
}
