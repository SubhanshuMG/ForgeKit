// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { runAudit } from '../core/dependency-audit';

function severityColor(severity: string, count: number): string {
  if (count === 0) return chalk.green(`${count}`);
  switch (severity) {
    case 'critical': return chalk.red.bold(`${count}`);
    case 'high': return chalk.red(`${count}`);
    case 'moderate': return chalk.yellow(`${count}`);
    case 'low': return chalk.dim(`${count}`);
    default: return `${count}`;
  }
}

export function auditCommand(): Command {
  const cmd = new Command('audit');
  cmd
    .description('Audit dependencies for security issues and freshness')
    .option('-p, --path <path>', 'Project path to scan', '.')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      const projectPath = options.path;

      if (options.json) {
        try {
          const result = await runAudit(projectPath);
          console.log(JSON.stringify(result, null, 2));
        } catch (err) {
          console.error(JSON.stringify({ error: (err as Error).message }));
          process.exit(1);
        }
        return;
      }

      console.log(chalk.bold.cyan('\n  ForgeKit Dependency Audit\n'));

      const spinner = ora('Scanning dependencies...').start();

      let result;
      try {
        result = await runAudit(projectPath);
        spinner.succeed('Scan complete');
      } catch (err) {
        spinner.fail((err as Error).message);
        process.exit(1);
        return;
      }

      // Package manager
      console.log(chalk.dim(`\n  Package manager: ${result.packageManager}\n`));

      // Vulnerability summary
      const v = result.vulnerabilities;
      console.log(chalk.bold('  Vulnerabilities:\n'));
      console.log(`  Critical:  ${severityColor('critical', v.critical)}`);
      console.log(`  High:      ${severityColor('high', v.high)}`);
      console.log(`  Moderate:  ${severityColor('moderate', v.moderate)}`);
      console.log(`  Low:       ${severityColor('low', v.low)}`);
      console.log(`  ${chalk.bold('Total:')}     ${v.total === 0 ? chalk.green('0') : chalk.red(String(v.total))}`);

      // Outdated packages
      if (result.outdated.length > 0) {
        const majors = result.outdated.filter(p => p.type === 'major');
        const minors = result.outdated.filter(p => p.type === 'minor');
        const patches = result.outdated.filter(p => p.type === 'patch');

        console.log(chalk.bold('\n  Outdated Packages:\n'));

        if (majors.length > 0) {
          console.log(chalk.red(`  Major updates (${majors.length}):`));
          majors.slice(0, 10).forEach(p => {
            console.log(chalk.dim(`    ${p.name.padEnd(30)} ${p.current} → ${chalk.red(p.latest)}`));
          });
          if (majors.length > 10) console.log(chalk.dim(`    ... and ${majors.length - 10} more`));
        }

        if (minors.length > 0) {
          console.log(chalk.yellow(`\n  Minor updates (${minors.length}):`));
          minors.slice(0, 10).forEach(p => {
            console.log(chalk.dim(`    ${p.name.padEnd(30)} ${p.current} → ${chalk.yellow(p.latest)}`));
          });
          if (minors.length > 10) console.log(chalk.dim(`    ... and ${minors.length - 10} more`));
        }

        if (patches.length > 0) {
          console.log(chalk.dim(`\n  Patch updates (${patches.length}):`));
          patches.slice(0, 5).forEach(p => {
            console.log(chalk.dim(`    ${p.name.padEnd(30)} ${p.current} → ${p.latest}`));
          });
          if (patches.length > 5) console.log(chalk.dim(`    ... and ${patches.length - 5} more`));
        }
      } else {
        console.log(chalk.green('\n  All packages are up to date!'));
      }

      // Score
      const scoreColor = result.score >= 80 ? chalk.green : result.score >= 60 ? chalk.yellow : chalk.red;
      console.log(`\n  ${chalk.bold('Security Score:')} ${scoreColor(String(result.score))}/100\n`);

      if (v.total > 0) {
        console.log(chalk.dim('  Run npm audit fix to resolve vulnerabilities.\n'));
      }
    });

  return cmd;
}
