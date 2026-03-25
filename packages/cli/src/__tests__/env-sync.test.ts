// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import * as fs from 'fs';
import * as os from 'os';
import * as crypto from 'crypto';
import {
  encryptEnv,
  decryptEnv,
  pushEnv,
  pullEnv,
  listEnvs,
  parseEnvFile,
  diffEnvs,
} from '../core/env-sync';

jest.mock('fs');
jest.mock('os', () => ({
  ...jest.requireActual('os'),
  homedir: jest.fn(() => '/home/testuser'),
}));

const HOME = '/home/testuser';

const mockFs = fs as jest.Mocked<typeof fs>;

const PROJECT = '/tmp/test-project';

beforeEach(() => {
  jest.clearAllMocks();
  (os.homedir as jest.Mock).mockReturnValue(HOME);
});

// ── encryptEnv / decryptEnv round-trip ───────────────────────────────────────

describe('encryptEnv and decryptEnv', () => {
  it('should survive an encrypt-then-decrypt round-trip', () => {
    const data = 'API_KEY=secret123\nDB_URL=postgres://localhost/db';
    const passphrase = 'my-strong-passphrase';

    const payload = encryptEnv(data, passphrase);
    const result = decryptEnv(payload, passphrase);

    expect(result).toBe(data);
  });

  it('should produce different encrypted output for same input (random salt/iv)', () => {
    const data = 'SECRET=value';
    const passphrase = 'pass';

    const payload1 = encryptEnv(data, passphrase);
    const payload2 = encryptEnv(data, passphrase);

    // Salt and IV should differ (overwhelmingly likely with 16-byte random)
    expect(payload1.salt).not.toBe(payload2.salt);
    expect(payload1.iv).not.toBe(payload2.iv);
  });

  it('should fail decryption with wrong passphrase', () => {
    const data = 'MY_VAR=hello';
    const payload = encryptEnv(data, 'correct-passphrase');

    expect(() => decryptEnv(payload, 'wrong-passphrase')).toThrow();
  });

  it('should fail decryption with tampered ciphertext', () => {
    const data = 'DATA=important';
    const payload = encryptEnv(data, 'pass');

    // Tamper with the encrypted data
    const tampered = { ...payload, encrypted: payload.encrypted.replace(/./g, 'a') };
    expect(() => decryptEnv(tampered, 'pass')).toThrow();
  });

  it('should fail decryption with tampered auth tag', () => {
    const data = 'DATA=important';
    const payload = encryptEnv(data, 'pass');

    const tampered = { ...payload, tag: crypto.randomBytes(16).toString('hex') };
    expect(() => decryptEnv(tampered, 'pass')).toThrow();
  });

  it('should handle empty string data', () => {
    const payload = encryptEnv('', 'pass');
    const result = decryptEnv(payload, 'pass');
    expect(result).toBe('');
  });

  it('should handle unicode content', () => {
    const data = 'GREETING=こんにちは\nEMOJI=🔑';
    const payload = encryptEnv(data, 'pass');
    const result = decryptEnv(payload, 'pass');
    expect(result).toBe(data);
  });
});

// ── parseEnvFile ─────────────────────────────────────────────────────────────

describe('parseEnvFile', () => {
  it('should parse simple KEY=VALUE pairs', () => {
    const result = parseEnvFile('FOO=bar\nBAZ=qux');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('should skip comment lines', () => {
    const result = parseEnvFile('# This is a comment\nFOO=bar\n# Another comment');
    expect(result).toEqual({ FOO: 'bar' });
  });

  it('should skip empty lines', () => {
    const result = parseEnvFile('\n\nFOO=bar\n\n\nBAZ=qux\n\n');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('should handle double-quoted values', () => {
    const result = parseEnvFile('FOO="bar baz"');
    expect(result).toEqual({ FOO: 'bar baz' });
  });

  it('should handle single-quoted values', () => {
    const result = parseEnvFile("FOO='bar baz'");
    expect(result).toEqual({ FOO: 'bar baz' });
  });

  it('should handle values with equals signs', () => {
    const result = parseEnvFile('URL=postgres://user:pass@host/db?opt=val');
    expect(result).toEqual({ URL: 'postgres://user:pass@host/db?opt=val' });
  });

  it('should handle empty values', () => {
    const result = parseEnvFile('EMPTY=\nFOO=bar');
    expect(result).toEqual({ EMPTY: '', FOO: 'bar' });
  });

  it('should skip lines without equals sign', () => {
    const result = parseEnvFile('INVALID_LINE\nFOO=bar');
    expect(result).toEqual({ FOO: 'bar' });
  });

  it('should trim keys and values', () => {
    const result = parseEnvFile('  FOO  =  bar  ');
    expect(result).toEqual({ FOO: 'bar' });
  });

  it('should handle completely empty content', () => {
    expect(parseEnvFile('')).toEqual({});
  });

  it('should handle content with only comments and blanks', () => {
    expect(parseEnvFile('# comment\n\n# another')).toEqual({});
  });
});

// ── diffEnvs ─────────────────────────────────────────────────────────────────

describe('diffEnvs', () => {
  it('should detect added keys', () => {
    const result = diffEnvs({}, { NEW_KEY: 'value' });
    expect(result.added).toEqual(['NEW_KEY']);
    expect(result.removed).toEqual([]);
    expect(result.changed).toEqual([]);
    expect(result.unchanged).toEqual([]);
  });

  it('should detect removed keys', () => {
    const result = diffEnvs({ OLD_KEY: 'value' }, {});
    expect(result.removed).toEqual(['OLD_KEY']);
    expect(result.added).toEqual([]);
  });

  it('should detect changed keys', () => {
    const result = diffEnvs({ KEY: 'old' }, { KEY: 'new' });
    expect(result.changed).toEqual(['KEY']);
    expect(result.unchanged).toEqual([]);
  });

  it('should detect unchanged keys', () => {
    const result = diffEnvs({ KEY: 'same' }, { KEY: 'same' });
    expect(result.unchanged).toEqual(['KEY']);
    expect(result.changed).toEqual([]);
  });

  it('should handle a mix of all categories', () => {
    const env1 = { KEEP: 'v1', CHANGE: 'old', REMOVE: 'gone' };
    const env2 = { KEEP: 'v1', CHANGE: 'new', ADD: 'fresh' };

    const result = diffEnvs(env1, env2);

    expect(result.unchanged).toEqual(['KEEP']);
    expect(result.changed).toEqual(['CHANGE']);
    expect(result.removed).toEqual(['REMOVE']);
    expect(result.added).toEqual(['ADD']);
  });

  it('should handle two empty envs', () => {
    const result = diffEnvs({}, {});
    expect(result.added).toEqual([]);
    expect(result.removed).toEqual([]);
    expect(result.changed).toEqual([]);
    expect(result.unchanged).toEqual([]);
  });
});

// ── pushEnv / pullEnv ────────────────────────────────────────────────────────

describe('pushEnv and pullEnv', () => {
  it('should write encrypted env file to store directory', () => {
    mockFs.existsSync.mockReturnValue(false);
    mockFs.mkdirSync.mockReturnValue(undefined);
    mockFs.writeFileSync.mockReturnValue(undefined);

    pushEnv(PROJECT, 'production', 'API_KEY=secret', 'passphrase');

    expect(mockFs.mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining('.forgekit/envs/'),
      expect.objectContaining({ recursive: true, mode: 0o700 })
    );
    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      expect.stringMatching(/production\.enc\.json$/),
      expect.any(String),
      expect.objectContaining({ mode: 0o600 })
    );
  });

  it('should write valid JSON containing encrypted payload', () => {
    mockFs.existsSync.mockReturnValue(false);
    mockFs.mkdirSync.mockReturnValue(undefined);

    let writtenContent = '';
    mockFs.writeFileSync.mockImplementation((_p, data) => {
      writtenContent = String(data);
    });

    pushEnv(PROJECT, 'staging', 'SECRET=value', 'pass');

    const parsed = JSON.parse(writtenContent);
    expect(parsed.environment).toBe('staging');
    expect(parsed.updatedAt).toBeDefined();
    expect(parsed.payload).toBeDefined();
    expect(parsed.payload.encrypted).toBeDefined();
    expect(parsed.payload.salt).toBeDefined();
    expect(parsed.payload.iv).toBeDefined();
    expect(parsed.payload.tag).toBeDefined();
  });

  it('pullEnv should throw when environment file does not exist', () => {
    mockFs.existsSync.mockReturnValue(false);

    expect(() => pullEnv(PROJECT, 'nonexistent', 'pass')).toThrow(
      'No stored environment "nonexistent" found'
    );
  });

  it('pullEnv should decrypt and return env content', () => {
    // First push, capture the written data
    mockFs.existsSync.mockReturnValue(false);
    mockFs.mkdirSync.mockReturnValue(undefined);

    let writtenContent = '';
    mockFs.writeFileSync.mockImplementation((_p, data) => {
      writtenContent = String(data);
    });

    pushEnv(PROJECT, 'dev', 'DB_URL=localhost', 'mypass');

    // Now pull by returning the written data
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(writtenContent);

    const result = pullEnv(PROJECT, 'dev', 'mypass');
    expect(result).toBe('DB_URL=localhost');
  });

  it('pullEnv should fail with wrong passphrase', () => {
    mockFs.existsSync.mockReturnValue(false);
    mockFs.mkdirSync.mockReturnValue(undefined);

    let writtenContent = '';
    mockFs.writeFileSync.mockImplementation((_p, data) => {
      writtenContent = String(data);
    });

    pushEnv(PROJECT, 'dev', 'SECRET=data', 'correct');

    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(writtenContent);

    expect(() => pullEnv(PROJECT, 'dev', 'wrong')).toThrow();
  });
});

// ── listEnvs ─────────────────────────────────────────────────────────────────

describe('listEnvs', () => {
  it('should return empty array when store directory does not exist', () => {
    mockFs.existsSync.mockReturnValue(false);
    expect(listEnvs(PROJECT)).toEqual([]);
  });

  it('should return environment names from .enc.json files', () => {
    mockFs.existsSync.mockReturnValue(true);
    (mockFs.readdirSync as jest.Mock).mockReturnValue([
      'production.enc.json',
      'staging.enc.json',
      'other-file.txt',
    ]);

    const result = listEnvs(PROJECT);

    expect(result).toEqual(['production', 'staging']);
  });

  it('should filter out non-.enc.json files', () => {
    mockFs.existsSync.mockReturnValue(true);
    (mockFs.readdirSync as jest.Mock).mockReturnValue([
      'README.md',
      '.gitkeep',
    ]);

    expect(listEnvs(PROJECT)).toEqual([]);
  });

  it('should return empty array when directory is empty', () => {
    mockFs.existsSync.mockReturnValue(true);
    (mockFs.readdirSync as jest.Mock).mockReturnValue([]);

    expect(listEnvs(PROJECT)).toEqual([]);
  });
});
