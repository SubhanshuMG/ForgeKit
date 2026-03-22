#!/usr/bin/env node
// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import { Command } from 'commander';
import { newCommand } from './commands/new';
import { listCommand } from './commands/list';
import { infoCommand } from './commands/info';

const VERSION = '0.1.0';

const program = new Command();

program
  .name('forgekit')
  .description('The engineering acceleration platform for AI, DevOps, and full-stack teams')
  .version(VERSION, '-v, --version', 'Output the current version')
  .addCommand(newCommand())
  .addCommand(listCommand())
  .addCommand(infoCommand());

program.parse(process.argv);
