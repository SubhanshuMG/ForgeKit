// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';
import { AuditResult, OutdatedPackage } from '../types';

export function detectPackageManager(projectPath: string): string | null {
  if (fs.existsSync(path.join(projectPath, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(projectPath, 'yarn.lock'))) return 'yarn';
  if (fs.existsSync(path.join(projectPath, 'package-lock.json'))) return 'npm';
  if (fs.existsSync(path.join(projectPath, 'package.json'))) return 'npm';
  if (fs.existsSync(path.join(projectPath, 'Pipfile'))) return 'pip';
  if (fs.existsSync(path.join(projectPath, 'requirements.txt'))) return 'pip';
  return null;
}

export async function runAudit(projectPath: string): Promise<AuditResult> {
  const pm = detectPackageManager(projectPath);

  if (!pm) {
    throw new Error('No recognized package manager found. Ensure package.json, Pipfile, or requirements.txt exists.');
  }

  const vulnerabilities = { critical: 0, high: 0, moderate: 0, low: 0, total: 0 };
  const outdated: OutdatedPackage[] = [];

  if (pm === 'npm' || pm === 'yarn' || pm === 'pnpm') {
    // Run npm audit
    try {
      const auditResult = spawnSync('npm', ['audit', '--json'], {
        cwd: projectPath,
        encoding: 'utf-8',
        timeout: 30000,
      });

      if (auditResult.stdout) {
        const data = JSON.parse(auditResult.stdout);
        const vulns = data.metadata?.vulnerabilities || {};
        vulnerabilities.critical = vulns.critical || 0;
        vulnerabilities.high = vulns.high || 0;
        vulnerabilities.moderate = vulns.moderate || 0;
        vulnerabilities.low = vulns.low || 0;
        vulnerabilities.total = vulns.total || (vulnerabilities.critical + vulnerabilities.high + vulnerabilities.moderate + vulnerabilities.low);
      }
    } catch {
      // npm audit failed - continue with zero vulns
    }

    // Run npm outdated
    try {
      const outdatedResult = spawnSync('npm', ['outdated', '--json'], {
        cwd: projectPath,
        encoding: 'utf-8',
        timeout: 30000,
      });

      if (outdatedResult.stdout) {
        const data = JSON.parse(outdatedResult.stdout);
        for (const [name, info] of Object.entries(data)) {
          const pkg = info as { current: string; wanted: string; latest: string };
          if (!pkg.current || !pkg.latest) continue;

          const currentParts = pkg.current.split('.');
          const latestParts = pkg.latest.split('.');

          let updateType: 'major' | 'minor' | 'patch' = 'patch';
          if (currentParts[0] !== latestParts[0]) updateType = 'major';
          else if (currentParts[1] !== latestParts[1]) updateType = 'minor';

          outdated.push({
            name,
            current: pkg.current,
            wanted: pkg.wanted || pkg.current,
            latest: pkg.latest,
            type: updateType,
          });
        }
      }
    } catch {
      // npm outdated failed - continue with empty list
    }
  }

  // Calculate score: start at 100, deduct for issues
  let score = 100;
  score -= vulnerabilities.critical * 20;
  score -= vulnerabilities.high * 10;
  score -= vulnerabilities.moderate * 3;
  score -= vulnerabilities.low * 1;
  score -= outdated.filter(p => p.type === 'major').length * 5;
  score -= outdated.filter(p => p.type === 'minor').length * 2;
  score = Math.max(0, Math.min(100, score));

  return {
    vulnerabilities,
    outdated,
    score,
    packageManager: pm,
  };
}
