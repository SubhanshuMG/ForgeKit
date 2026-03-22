// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import { Command } from 'commander';
import chalk from 'chalk';
import { getTemplate } from '../core/template-resolver';

export function infoCommand(): Command {
  const cmd = new Command('info');
  cmd
    .description('Show details about a specific template')
    .argument('<template>', 'Template ID')
    .action(async (templateId: string) => {
      try {
        const t = await getTemplate(templateId);
        console.log(chalk.bold.cyan(`\n  ${t.name}\n`));
        console.log(`  ${chalk.dim('ID:')}          ${t.id}`);
        console.log(`  ${chalk.dim('Description:')} ${t.description}`);
        console.log(`  ${chalk.dim('Stack:')}       ${t.stack.join(', ')}`);
        console.log(`  ${chalk.dim('Version:')}     ${t.version}`);
        console.log(`  ${chalk.dim('Files:')}       ${t.files.length} template files`);
        if (t.variables.length > 0) {
          console.log(`\n  ${chalk.bold('Variables:')}`);
          t.variables.forEach(v => {
            console.log(`    ${chalk.yellow(v.name)}: ${v.prompt} (default: ${v.default})`);
          });
        }
        console.log('');
      } catch (err) {
        console.error(chalk.red(`  Error: ${(err as Error).message}`));
        process.exit(1);
      }
    });
  return cmd;
}
