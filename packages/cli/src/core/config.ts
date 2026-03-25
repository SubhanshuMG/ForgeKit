// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

export interface ForgeKitConfig {
  telemetry: boolean;
  userId: string;
  firstRun: boolean;
  ai?: {
    provider: 'openai' | 'anthropic';
    model?: string;
  };
  plugins?: string[];
  envSync?: {
    defaultEnvironment?: string;
  };
}

const CONFIG_DIR = path.join(os.homedir(), '.forgekit');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

export { CONFIG_DIR };

function defaultConfig(): ForgeKitConfig {
  return {
    telemetry: false,
    userId: '',
    firstRun: true,
  };
}

export function loadConfig(): ForgeKitConfig {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    const config: ForgeKitConfig = {
      telemetry: typeof parsed.telemetry === 'boolean' ? parsed.telemetry : false,
      userId: typeof parsed.userId === 'string' ? parsed.userId : '',
      firstRun: typeof parsed.firstRun === 'boolean' ? parsed.firstRun : true,
    };
    // Preserve optional fields if present
    if (parsed.ai && typeof parsed.ai === 'object') {
      config.ai = parsed.ai;
    }
    if (Array.isArray(parsed.plugins)) {
      config.plugins = parsed.plugins;
    }
    if (parsed.envSync && typeof parsed.envSync === 'object') {
      config.envSync = parsed.envSync;
    }
    return config;
  } catch {
    return defaultConfig();
  }
}

export function saveConfig(config: ForgeKitConfig): void {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
    }
    // Merge with existing config to preserve unknown fields
    let existing: Record<string, unknown> = {};
    try {
      existing = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    } catch {
      // No existing config
    }
    const merged = { ...existing, ...config };
    const tmpPath = CONFIG_PATH + '.tmp';
    fs.writeFileSync(tmpPath, JSON.stringify(merged, null, 2), { encoding: 'utf-8', mode: 0o600 });
    fs.renameSync(tmpPath, CONFIG_PATH);
  } catch {
    // Never throw from config writes
  }
}

export function getUserId(): string {
  const config = loadConfig();
  if (config.userId) {
    return config.userId;
  }
  const userId = crypto.randomUUID();
  saveConfig({ ...config, userId });
  return userId;
}
