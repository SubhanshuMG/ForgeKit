// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/Subhanshumohangupta/ForgeKit

jest.mock('fs');

import * as fs from 'fs';
import { loadConfig, saveConfig, getUserId, ForgeKitConfig } from '../core/config';

const mockReadFileSync = fs.readFileSync as jest.MockedFunction<typeof fs.readFileSync>;
const mockExistsSync = fs.existsSync as jest.MockedFunction<typeof fs.existsSync>;
const mockMkdirSync = fs.mkdirSync as jest.MockedFunction<typeof fs.mkdirSync>;
const mockWriteFileSync = fs.writeFileSync as jest.MockedFunction<typeof fs.writeFileSync>;
const mockRenameSync = fs.renameSync as jest.MockedFunction<typeof fs.renameSync>;

describe('config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── loadConfig ─────────────────────────────────────────────────────────────

  describe('loadConfig', () => {
    it('returns default config when config file does not exist', () => {
      mockReadFileSync.mockImplementation(() => {
        const err: NodeJS.ErrnoException = new Error('ENOENT');
        err.code = 'ENOENT';
        throw err;
      });

      const config = loadConfig();

      expect(config.telemetry).toBe(false);
      expect(config.userId).toBe('');
      expect(config.firstRun).toBe(true);
    });

    it('returns parsed config when config file exists', () => {
      const stored: ForgeKitConfig = {
        telemetry: true,
        userId: 'existing-user-id',
        firstRun: false,
      };
      mockReadFileSync.mockReturnValue(JSON.stringify(stored));

      const config = loadConfig();

      expect(config.telemetry).toBe(true);
      expect(config.userId).toBe('existing-user-id');
      expect(config.firstRun).toBe(false);
    });

    it('returns defaults for fields with wrong types in stored config', () => {
      const corrupted = { telemetry: 'yes', userId: 42, firstRun: 'nope' };
      mockReadFileSync.mockReturnValue(JSON.stringify(corrupted));

      const config = loadConfig();

      expect(config.telemetry).toBe(false);
      expect(config.userId).toBe('');
      expect(config.firstRun).toBe(true);
    });

    it('returns default config when file contains invalid JSON', () => {
      mockReadFileSync.mockReturnValue('{ this is not json');

      const config = loadConfig();

      expect(config.telemetry).toBe(false);
      expect(config.userId).toBe('');
      expect(config.firstRun).toBe(true);
    });

    it('returns default config when file is empty', () => {
      mockReadFileSync.mockReturnValue('');

      const config = loadConfig();

      expect(config.telemetry).toBe(false);
      expect(config.userId).toBe('');
      expect(config.firstRun).toBe(true);
    });

    it('preserves telemetry:false explicitly set in stored config', () => {
      const stored: ForgeKitConfig = { telemetry: false, userId: 'abc', firstRun: false };
      mockReadFileSync.mockReturnValue(JSON.stringify(stored));

      const config = loadConfig();

      expect(config.telemetry).toBe(false);
    });
  });

  // ── saveConfig ─────────────────────────────────────────────────────────────

  describe('saveConfig', () => {
    it('creates the config directory if it does not exist', () => {
      mockExistsSync.mockReturnValue(false);
      mockMkdirSync.mockReturnValue(undefined);
      mockWriteFileSync.mockReturnValue(undefined);
      mockRenameSync.mockReturnValue(undefined);

      saveConfig({ telemetry: false, userId: 'u1', firstRun: false });

      expect(mockMkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    });

    it('skips directory creation when it already exists', () => {
      mockExistsSync.mockReturnValue(true);
      mockWriteFileSync.mockReturnValue(undefined);
      mockRenameSync.mockReturnValue(undefined);

      saveConfig({ telemetry: false, userId: 'u1', firstRun: false });

      expect(mockMkdirSync).not.toHaveBeenCalled();
    });

    it('writes to a .tmp file then renames atomically', () => {
      mockExistsSync.mockReturnValue(true);
      mockWriteFileSync.mockReturnValue(undefined);
      mockRenameSync.mockReturnValue(undefined);

      saveConfig({ telemetry: true, userId: 'u2', firstRun: false });

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringMatching(/\.tmp$/),
        expect.stringContaining('"telemetry": true'),
        'utf-8'
      );
      expect(mockRenameSync).toHaveBeenCalledWith(
        expect.stringMatching(/\.tmp$/),
        expect.not.stringMatching(/\.tmp$/)
      );
    });

    it('does not throw when the filesystem write fails', () => {
      mockExistsSync.mockReturnValue(true);
      mockWriteFileSync.mockImplementation(() => { throw new Error('EACCES'); });

      expect(() => saveConfig({ telemetry: false, userId: '', firstRun: true })).not.toThrow();
    });

    it('serializes the full config object correctly', () => {
      mockExistsSync.mockReturnValue(true);
      mockWriteFileSync.mockReturnValue(undefined);
      mockRenameSync.mockReturnValue(undefined);

      const cfg: ForgeKitConfig = { telemetry: true, userId: 'test-uid', firstRun: false };
      saveConfig(cfg);

      const writtenContent = mockWriteFileSync.mock.calls[0][1] as string;
      const parsed = JSON.parse(writtenContent);
      expect(parsed).toEqual(cfg);
    });
  });

  // ── getUserId ──────────────────────────────────────────────────────────────

  describe('getUserId', () => {
    it('returns the existing userId when one is already stored', () => {
      const stored: ForgeKitConfig = { telemetry: false, userId: 'stored-uid-abc', firstRun: false };
      mockReadFileSync.mockReturnValue(JSON.stringify(stored));

      const id = getUserId();

      expect(id).toBe('stored-uid-abc');
    });

    it('generates and persists a new UUID when no userId exists', () => {
      // loadConfig returns empty userId
      mockReadFileSync.mockImplementation(() => {
        throw new Error('ENOENT');
      });
      mockExistsSync.mockReturnValue(true);
      mockWriteFileSync.mockReturnValue(undefined);
      mockRenameSync.mockReturnValue(undefined);

      const id = getUserId();

      // UUID v4 format
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('calls saveConfig to persist the new UUID', () => {
      mockReadFileSync.mockImplementation(() => {
        throw new Error('ENOENT');
      });
      mockExistsSync.mockReturnValue(true);
      mockWriteFileSync.mockReturnValue(undefined);
      mockRenameSync.mockReturnValue(undefined);

      getUserId();

      // saveConfig internally calls writeFileSync
      expect(mockWriteFileSync).toHaveBeenCalled();
    });

    it('returns a non-empty string in all cases', () => {
      mockReadFileSync.mockImplementation(() => {
        throw new Error('ENOENT');
      });
      mockExistsSync.mockReturnValue(true);
      mockWriteFileSync.mockReturnValue(undefined);
      mockRenameSync.mockReturnValue(undefined);

      const id = getUserId();

      expect(id.length).toBeGreaterThan(0);
    });
  });
});
