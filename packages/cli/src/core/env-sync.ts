// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { EncryptedPayload } from '../types';

const STORE_DIR = path.join(os.homedir(), '.forgekit', 'envs');

function getProjectHash(projectPath: string): string {
  return crypto.createHash('sha256').update(path.resolve(projectPath)).digest('hex').slice(0, 16);
}

function getProjectStoreDir(projectPath: string): string {
  return path.join(STORE_DIR, getProjectHash(projectPath));
}

function deriveKey(passphrase: string, salt: Buffer): Buffer {
  return crypto.scryptSync(passphrase, salt, 32);
}

export function encryptEnv(data: string, passphrase: string): EncryptedPayload {
  const salt = crypto.randomBytes(16);
  const key = deriveKey(passphrase, salt);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(data, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return {
    encrypted,
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

export function decryptEnv(payload: EncryptedPayload, passphrase: string): string {
  const salt = Buffer.from(payload.salt, 'hex');
  const key = deriveKey(passphrase, salt);
  const iv = Buffer.from(payload.iv, 'hex');
  const tag = Buffer.from(payload.tag, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(payload.encrypted, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
}

export function pushEnv(projectPath: string, environment: string, envContent: string, passphrase: string): void {
  const storeDir = getProjectStoreDir(projectPath);
  if (!fs.existsSync(storeDir)) {
    fs.mkdirSync(storeDir, { recursive: true, mode: 0o700 });
  }

  const payload = encryptEnv(envContent, passphrase);
  const metadata = {
    environment,
    updatedAt: new Date().toISOString(),
    payload,
  };

  const filePath = path.join(storeDir, `${environment}.enc.json`);
  fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2), { mode: 0o600 });
}

export function pullEnv(projectPath: string, environment: string, passphrase: string): string {
  const storeDir = getProjectStoreDir(projectPath);
  const filePath = path.join(storeDir, `${environment}.enc.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`No stored environment "${environment}" found for this project.`);
  }

  const metadata = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return decryptEnv(metadata.payload, passphrase);
}

export function listEnvs(projectPath: string): string[] {
  const storeDir = getProjectStoreDir(projectPath);
  if (!fs.existsSync(storeDir)) return [];

  return fs.readdirSync(storeDir)
    .filter(f => f.endsWith('.enc.json'))
    .map(f => f.replace('.enc.json', ''));
}

export function parseEnvFile(content: string): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

export function diffEnvs(
  env1: Record<string, string>,
  env2: Record<string, string>
): { added: string[]; removed: string[]; changed: string[]; unchanged: string[] } {
  const allKeys = new Set([...Object.keys(env1), ...Object.keys(env2)]);
  const added: string[] = [];
  const removed: string[] = [];
  const changed: string[] = [];
  const unchanged: string[] = [];

  for (const key of allKeys) {
    if (!(key in env1)) added.push(key);
    else if (!(key in env2)) removed.push(key);
    else if (env1[key] !== env2[key]) changed.push(key);
    else unchanged.push(key);
  }

  return { added, removed, changed, unchanged };
}
