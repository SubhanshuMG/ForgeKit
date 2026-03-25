// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import { Command } from 'commander';
import chalk from 'chalk';
import { calculateHealth } from '../core/health-scorer';

function progressBar(percentage: number, width: number = 20): string {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  const bar = chalk.green('\u2588'.repeat(filled)) + chalk.gray('\u2591'.repeat(empty));
  return `${bar} ${percentage}%`;
}

function gradeColor(grade: string): string {
  if (grade.startsWith('A')) return chalk.green.bold(grade);
  if (grade.startsWith('B')) return chalk.cyan.bold(grade);
  if (grade === 'C') return chalk.yellow.bold(grade);
  if (grade === 'D') return chalk.hex('#FFA500').bold(grade);
  return chalk.red.bold(grade);
}

function motivationalMessage(grade: string): string {
  if (grade === 'A+') return 'Outstanding! Your project is in exceptional shape.';
  if (grade === 'A') return 'Excellent! Your project follows best practices.';
  if (grade.startsWith('B')) return 'Good shape! A few improvements will make it great.';
  if (grade === 'C') return 'Decent foundation. Focus on the suggestions below to level up.';
  if (grade === 'D') return 'Room for improvement. Start with the top suggestions.';
  return 'This project needs attention. The suggestions below will help.';
}

export function healthCommand(): Command {
  const cmd = new Command('health');
  cmd
    .description('Calculate your project health score (0-100)')
    .option('-p, --path <path>', 'Project path to scan', '.')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      const projectPath = options.path;

      if (options.json) {
        const report = await calculateHealth(projectPath);
        console.log(JSON.stringify(report, null, 2));
        return;
      }

      console.log(chalk.bold.cyan('\n  ForgeKit Health Score\n'));

      const report = await calculateHealth(projectPath);

      // Big score display
      console.log(`  ${chalk.bold('Score:')} ${gradeColor(report.grade)}  ${chalk.bold(String(report.score))}/100\n`);
      console.log(`  ${chalk.dim(motivationalMessage(report.grade))}\n`);

      // Category breakdown
      console.log(chalk.bold('  Category Breakdown:\n'));
      const categoryLabels: Record<string, string> = {
        security: 'Security',
        quality: 'Quality',
        testing: 'Testing',
        documentation: 'Documentation',
        devops: 'DevOps',
      };

      for (const [key, label] of Object.entries(categoryLabels)) {
        const cat = report.categoryScores[key];
        if (!cat) continue;
        const padding = ' '.repeat(16 - label.length);
        console.log(`  ${chalk.bold(label)}${padding}${progressBar(cat.percentage)}  (${cat.earned}/${cat.max})`);
      }

      // Failed checks as suggestions
      const suggestions = report.checks
        .filter(c => !c.passed && c.suggestion)
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 7);

      if (suggestions.length > 0) {
        console.log(chalk.bold('\n  Top Suggestions:\n'));
        suggestions.forEach((s, i) => {
          const icon = s.weight >= 5 ? chalk.red('\u2717') : chalk.yellow('\u25CB');
          console.log(`  ${icon} ${chalk.white(`${i + 1}. ${s.suggestion}`)} ${chalk.dim(`(+${s.weight} pts)`)}`);
        });
      }

      console.log('');
    });

  return cmd;
}
