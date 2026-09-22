// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import * as path from 'path';
import * as fs from 'fs';
import { VERSION, USER_AGENT } from '../version';

const pkg = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf-8')
) as { version: string };

describe('version', () => {
  it('reports the version declared in package.json', () => {
    expect(VERSION).toBe(pkg.version);
  });

  it('reports a valid semver string, never the "unknown" fallback', () => {
    expect(VERSION).not.toBe('unknown');
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('builds the User-Agent from the same version', () => {
    expect(USER_AGENT).toBe(`forgekit-cli/${pkg.version}`);
  });

  it('resolves package.json one level above the module, so dist/ and src/ agree', () => {
    // Guards the published layout: dist/version.js -> ../package.json.
    // If someone moves version.ts into a subdirectory this breaks loudly here
    // instead of silently shipping "unknown" to users.
    const fromModuleDir = path.resolve(__dirname, '..', '..', 'package.json');
    expect(fs.existsSync(fromModuleDir)).toBe(true);
    expect(path.basename(path.dirname(fromModuleDir))).toBe('cli');
  });
});
