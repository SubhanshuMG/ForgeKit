// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import { Command } from 'commander';
import chalk from 'chalk';
import { listTemplates } from '../core/template-resolver';

export function listCommand(): Command {
  const cmd = new Command('list');
  cmd
    .description('List all available templates')
    .action(async () => {
      const templates = await listTemplates();
      console.log(chalk.bold.cyan('\n  Available Templates\n'));
      templates.forEach(t => {
        console.log(`  ${chalk.bold.yellow(t.id.padEnd(16))} ${chalk.white(t.name)}`);
        console.log(`  ${' '.repeat(16)} ${chalk.dim(t.description)}`);
        console.log(`  ${' '.repeat(16)} ${chalk.dim('Stack: ' + t.stack.join(', ') + '\n')}`);
      });
    });
  return cmd;
}
