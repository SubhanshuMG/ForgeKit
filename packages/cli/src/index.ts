#!/usr/bin/env node
// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import { Command } from 'commander';
import { newCommand } from './commands/new';
import { listCommand } from './commands/list';
import { infoCommand } from './commands/info';
import { doctorCommand } from './commands/doctor';
import { searchCommand } from './commands/search';
import { telemetryCommand } from './commands/telemetry';
import { healthCommand } from './commands/health';
import { auditCommand } from './commands/audit-cmd';
import { deployCommand } from './commands/deploy';
import { envCommand } from './commands/env';
import { docsCommand } from './commands/docs-cmd';
import { pluginCommand } from './commands/plugin';
import { publishCommand } from './commands/publish';
import { askTelemetryConsent } from './core/telemetry';
import { loadPlugins } from './core/plugin-manager';

const VERSION = '0.5.1';

const program = new Command();

program
  .name('forgekit')
  .description('The engineering acceleration platform for AI, DevOps, and full-stack teams')
  .version(VERSION, '-v, --version', 'Output the current version')
  .option('--no-plugins', 'Skip loading plugins')
  .addCommand(newCommand())
  .addCommand(listCommand())
  .addCommand(infoCommand())
  .addCommand(doctorCommand())
  .addCommand(searchCommand())
  .addCommand(telemetryCommand())
  .addCommand(healthCommand())
  .addCommand(auditCommand())
  .addCommand(deployCommand())
  .addCommand(envCommand())
  .addCommand(docsCommand())
  .addCommand(pluginCommand())
  .addCommand(publishCommand());

async function main(): Promise<void> {
  await askTelemetryConsent();

  // Load plugins unless --no-plugins is passed
  const rawArgs = process.argv;
  if (!rawArgs.includes('--no-plugins')) {
    try {
      loadPlugins(program);
    } catch {
      // Never crash due to plugin loading failures
    }
  }

  program.parse(process.argv);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
