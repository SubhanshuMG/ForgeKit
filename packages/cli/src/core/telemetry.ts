// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import * as https from 'https';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { loadConfig, saveConfig, getUserId } from './config';

const VERSION = '0.4.0';

export function trackEvent(event: string, properties: Record<string, unknown>): void {
  try {
    const config = loadConfig();
    if (!config.telemetry) return;
    if (process.env.CI) return;

    const payload = JSON.stringify({
      name: event,
      url: `app://forgekit/${event}`,
      domain: 'forgekit.build',
      props: { ...properties, version: VERSION },
    });

    const req = https.request(
      {
        hostname: 'plausible.io',
        path: '/api/event',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `forgekit-cli/${VERSION}`,
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      () => {
        // Response intentionally ignored (fire-and-forget)
      }
    );

    req.on('error', () => {
      // Silently ignore network errors
    });

    req.write(payload);
    req.end();
  } catch {
    // Never throw from telemetry
  }
}

export async function askTelemetryConsent(): Promise<void> {
  try {
    const config = loadConfig();
    if (!config.firstRun) return;
    if (!process.stdout.isTTY) {
      saveConfig({ ...config, firstRun: false });
      return;
    }

    // Ensure userId is generated on first run
    getUserId();

    console.log(
      chalk.dim(
        '\n  ForgeKit collects anonymous usage data to improve the tool.\n' +
        '  No personal information or project contents are ever sent.\n' +
        '  You can change this anytime with: forgekit telemetry enable/disable\n'
      )
    );

    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'telemetry',
        message: 'Enable anonymous telemetry?',
        default: false,
      },
    ]);

    saveConfig({
      ...config,
      telemetry: answer.telemetry,
      firstRun: false,
      userId: getUserId(),
    });
  } catch {
    // Never block CLI startup due to telemetry
    try {
      const config = loadConfig();
      saveConfig({ ...config, firstRun: false });
    } catch {
      // Truly give up
    }
  }
}
