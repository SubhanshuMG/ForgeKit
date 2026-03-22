// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

export interface ForgeKitConfig {
  telemetry: boolean;
  userId: string;
  firstRun: boolean;
}

const CONFIG_DIR = path.join(os.homedir(), '.forgekit');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

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
    return {
      telemetry: typeof parsed.telemetry === 'boolean' ? parsed.telemetry : false,
      userId: typeof parsed.userId === 'string' ? parsed.userId : '',
      firstRun: typeof parsed.firstRun === 'boolean' ? parsed.firstRun : true,
    };
  } catch {
    return defaultConfig();
  }
}

export function saveConfig(config: ForgeKitConfig): void {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    const tmpPath = CONFIG_PATH + '.tmp';
    fs.writeFileSync(tmpPath, JSON.stringify(config, null, 2), 'utf-8');
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
