// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import {
  installPlugin,
  removePlugin,
  listInstalledPlugins,
} from '../core/plugin-manager';

export function pluginCommand(): Command {
  const cmd = new Command('plugin');
  cmd.description('Manage ForgeKit plugins');

  // --- forgekit plugin add <name> ---
  cmd
    .command('add <name>')
    .description('Install a ForgeKit plugin')
    .action(async (name: string) => {
      const spinner = ora(`Installing plugin "${name}"...`).start();

      try {
        const plugin = await installPlugin(name);
        spinner.succeed(
          chalk.green(`Plugin "${plugin.name}" v${plugin.version} installed successfully.`)
        );
        if (plugin.description) {
          console.log(`  ${chalk.dim(plugin.description)}`);
        }
        console.log(
          chalk.dim(`\n  Run ${chalk.white('forgekit --help')} to see new commands added by this plugin.\n`)
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        spinner.fail(chalk.red(`Failed to install plugin: ${message}`));
        process.exitCode = 1;
      }
    });

  // --- forgekit plugin remove <name> ---
  cmd
    .command('remove <name>')
    .description('Remove an installed ForgeKit plugin')
    .option('-y, --yes', 'Skip confirmation prompt')
    .action(async (name: string, options: { yes?: boolean }) => {
      if (!options.yes) {
        const { confirm } = await inquirer.prompt([{
          type: 'confirm',
          name: 'confirm',
          message: `Are you sure you want to remove the plugin "${name}"?`,
          default: false,
        }]);

        if (!confirm) {
          console.log(chalk.dim('  Cancelled.'));
          return;
        }
      }

      const spinner = ora(`Removing plugin "${name}"...`).start();

      try {
        await removePlugin(name);
        spinner.succeed(chalk.green(`Plugin "${name}" removed successfully.`));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        spinner.fail(chalk.red(`Failed to remove plugin: ${message}`));
        process.exitCode = 1;
      }
    });

  // --- forgekit plugin list ---
  cmd
    .command('list')
    .description('List installed ForgeKit plugins')
    .action(() => {
      const plugins = listInstalledPlugins();

      if (plugins.length === 0) {
        console.log(chalk.yellow('\n  No plugins installed.\n'));
        console.log(
          chalk.dim(`  Install a plugin with: ${chalk.white('forgekit plugin add <name>')}\n`)
        );
        return;
      }

      console.log(chalk.bold.cyan('\n  Installed Plugins\n'));

      // Calculate column widths for alignment
      const nameWidth = Math.max(12, ...plugins.map(p => p.name.length)) + 2;
      const versionWidth = Math.max(8, ...plugins.map(p => p.version.length)) + 2;

      // Header
      console.log(
        `  ${chalk.dim('Name'.padEnd(nameWidth))}` +
        `${chalk.dim('Version'.padEnd(versionWidth))}` +
        `${chalk.dim('Description')}`
      );
      console.log(
        `  ${chalk.dim('-'.repeat(nameWidth))}` +
        `${chalk.dim('-'.repeat(versionWidth))}` +
        `${chalk.dim('-'.repeat(30))}`
      );

      for (const plugin of plugins) {
        console.log(
          `  ${chalk.bold.yellow(plugin.name.padEnd(nameWidth))}` +
          `${chalk.white(plugin.version.padEnd(versionWidth))}` +
          `${chalk.dim(plugin.description || '-')}`
        );
      }

      console.log(`\n  ${chalk.dim(`${plugins.length} plugin(s) installed`)}\n`);
    });

  return cmd;
}
