// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

export interface AuditEntry {
  timestamp: string;
  command: string;
  templateId?: string;
  projectName?: string;
  outputDir?: string;
  result: 'success' | 'failure' | 'cancelled';
  error?: string;
  forgeKitVersion: string;
  nodeVersion: string;
  platform: string;
}

const AUDIT_LOG_PATH = path.join(os.homedir(), '.forgekit', 'audit.log');
const VERSION = '0.1.0';

/**
 * Logs a CLI action to the local audit log.
 * The audit log is stored locally on the user's machine only.
 * No data is sent to external servers.
 */
export async function logAuditEntry(entry: Omit<AuditEntry, 'timestamp' | 'forgeKitVersion' | 'nodeVersion' | 'platform'>): Promise<void> {
  const fullEntry: AuditEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
    forgeKitVersion: VERSION,
    nodeVersion: process.version,
    platform: os.platform(),
  };

  try {
    await fs.ensureDir(path.dirname(AUDIT_LOG_PATH));
    const line = JSON.stringify(fullEntry) + '\n';
    await fs.appendFile(AUDIT_LOG_PATH, line, 'utf-8');
  } catch {
    // Audit log failure is non-fatal, never block the user's workflow
  }
}
