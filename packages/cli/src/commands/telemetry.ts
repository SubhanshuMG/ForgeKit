// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig, saveConfig } from '../core/config';

export function telemetryCommand(): Command {
  const cmd = new Command('telemetry');
  cmd.description('Manage anonymous telemetry settings');

  cmd
    .command('enable')
    .description('Enable anonymous telemetry')
    .action(() => {
      const config = loadConfig();
      saveConfig({ ...config, telemetry: true });
      console.log(chalk.green('  Telemetry enabled.'));
      console.log(chalk.dim('  Anonymous usage data will be sent to help improve ForgeKit.'));
    });

  cmd
    .command('disable')
    .description('Disable anonymous telemetry')
    .action(() => {
      const config = loadConfig();
      saveConfig({ ...config, telemetry: false });
      console.log(chalk.yellow('  Telemetry disabled.'));
      console.log(chalk.dim('  No usage data will be sent.'));
    });

  cmd
    .command('status')
    .description('Show current telemetry status')
    .action(() => {
      const config = loadConfig();
      const status = config.telemetry ? chalk.green('enabled') : chalk.yellow('disabled');
      console.log(`  Telemetry is currently ${status}.`);
    });

  return cmd;
}
