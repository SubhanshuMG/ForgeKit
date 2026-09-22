// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import * as path from 'path';
import * as fs from 'fs';

/**
 * Single source of truth for the CLI version.
 *
 * package.json is the only place a version is declared. Everything that
 * reports a version — `forgekit --version`, telemetry events, outbound
 * HTTP User-Agent — reads it from here, so they can never disagree.
 *
 * Resolution works in both layouts because package.json sits one level
 * above each:
 *   published:  dist/version.js -> ../package.json
 *   dev/tests:  src/version.ts  -> ../package.json
 *
 * npm always includes package.json in the published tarball regardless of
 * the "files" allowlist, so this is safe in the installed package.
 */
function readVersion(): string {
  try {
    const pkgPath = path.resolve(__dirname, '../package.json');
    const pkg: unknown = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    if (pkg && typeof pkg === 'object' && 'version' in pkg) {
      const v = (pkg as { version: unknown }).version;
      if (typeof v === 'string' && v.length > 0) return v;
    }
  } catch {
    // Fall through — a missing or malformed package.json must never stop
    // the CLI from running. Reporting "unknown" is better than crashing.
  }
  return 'unknown';
}

export const VERSION = readVersion();

/** User-Agent for every outbound request the CLI makes. */
export const USER_AGENT = `forgekit-cli/${VERSION}`;
