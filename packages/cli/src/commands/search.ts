// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import { Command } from 'commander';
import chalk from 'chalk';
import { listTemplates } from '../core/template-resolver';

export function searchCommand(): Command {
  const cmd = new Command('search');
  cmd
    .description('Search templates by keyword')
    .argument('<query>', 'Search keyword to match against template name, description, or stack')
    .action(async (query: string) => {
      const templates = await listTemplates();
      const lowerQuery = query.toLowerCase();

      const matches = templates.filter(t => {
        const haystack = [
          t.name,
          t.description,
          ...t.stack,
        ].join(' ').toLowerCase();
        return haystack.includes(lowerQuery);
      });

      if (matches.length === 0) {
        console.log(chalk.yellow(`\n  No templates found matching '${query}'\n`));
        return;
      }

      console.log(chalk.bold.cyan('\n  Available Templates\n'));
      matches.forEach(t => {
        console.log(`  ${chalk.bold.yellow(t.id.padEnd(16))} ${chalk.white(t.name)}`);
        console.log(`  ${' '.repeat(16)} ${chalk.dim(t.description)}`);
        console.log(`  ${' '.repeat(16)} ${chalk.dim('Stack: ' + t.stack.join(', ') + '\n')}`);
      });
    });
  return cmd;
}
