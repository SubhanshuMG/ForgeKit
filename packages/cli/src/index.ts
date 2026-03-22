#!/usr/bin/env node
// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import { Command } from 'commander';
import { newCommand } from './commands/new';
import { listCommand } from './commands/list';
import { infoCommand } from './commands/info';
import { doctorCommand } from './commands/doctor';
import { telemetryCommand } from './commands/telemetry';
import { askTelemetryConsent } from './core/telemetry';

const VERSION = '0.1.0';

const program = new Command();

program
  .name('forgekit')
  .description('The engineering acceleration platform for AI, DevOps, and full-stack teams')
  .version(VERSION, '-v, --version', 'Output the current version')
  .addCommand(newCommand())
  .addCommand(listCommand())
  .addCommand(infoCommand())
  .addCommand(doctorCommand())
  .addCommand(telemetryCommand());

async function main(): Promise<void> {
  await askTelemetryConsent();
  program.parse(process.argv);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
