// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/Subhanshumohangupta/ForgeKit

jest.mock('fs-extra');
jest.mock('fs');

import * as fsExtra from 'fs-extra';
import * as nativeFs from 'fs';
import { logAuditEntry, AuditEntry } from '../core/audit';

const mockEnsureDir = fsExtra.ensureDir as jest.MockedFunction<typeof fsExtra.ensureDir>;
const mockOpenSync = nativeFs.openSync as jest.MockedFunction<typeof nativeFs.openSync>;
const mockWriteSync = nativeFs.writeSync as jest.MockedFunction<typeof nativeFs.writeSync>;
const mockCloseSync = nativeFs.closeSync as jest.MockedFunction<typeof nativeFs.closeSync>;

type PartialEntry = Omit<AuditEntry, 'timestamp' | 'forgeKitVersion' | 'nodeVersion' | 'platform'>;

function makeEntry(overrides: Partial<PartialEntry> = {}): PartialEntry {
  return {
    command: 'scaffold',
    result: 'success',
    ...overrides,
  };
}

describe('logAuditEntry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockEnsureDir as unknown as jest.Mock).mockResolvedValue(undefined);
    (mockOpenSync as unknown as jest.Mock).mockReturnValue(42); // fake fd
    (mockWriteSync as unknown as jest.Mock).mockReturnValue(0);
    (mockCloseSync as unknown as jest.Mock).mockReturnValue(undefined);
  });

  describe('correct fields are written', () => {
    it('writes a JSON line terminated with a newline', async () => {
      await logAuditEntry(makeEntry());

      const written = (mockWriteSync as unknown as jest.Mock).mock.calls[0][1] as string;
      expect(written.endsWith('\n')).toBe(true);
    });

    it('written content is valid JSON', async () => {
      await logAuditEntry(makeEntry());

      const written = (mockWriteSync as unknown as jest.Mock).mock.calls[0][1] as string;
      expect(() => JSON.parse(written.trim())).not.toThrow();
    });

    it('includes a timestamp field in ISO 8601 format', async () => {
      await logAuditEntry(makeEntry());

      const written = (mockWriteSync as unknown as jest.Mock).mock.calls[0][1] as string;
      const parsed = JSON.parse(written.trim());
      expect(parsed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('includes the command field passed in', async () => {
      await logAuditEntry(makeEntry({ command: 'init' }));

      const written = (mockWriteSync as unknown as jest.Mock).mock.calls[0][1] as string;
      const parsed = JSON.parse(written.trim());
      expect(parsed.command).toBe('init');
    });

    it('includes the result field', async () => {
      await logAuditEntry(makeEntry({ result: 'failure' }));

      const written = (mockWriteSync as unknown as jest.Mock).mock.calls[0][1] as string;
      const parsed = JSON.parse(written.trim());
      expect(parsed.result).toBe('failure');
    });

    it('includes the forgeKitVersion field', async () => {
      await logAuditEntry(makeEntry());

      const written = (mockWriteSync as unknown as jest.Mock).mock.calls[0][1] as string;
      const parsed = JSON.parse(written.trim());
      expect(typeof parsed.forgeKitVersion).toBe('string');
      expect(parsed.forgeKitVersion.length).toBeGreaterThan(0);
    });

    it('includes the nodeVersion field', async () => {
      await logAuditEntry(makeEntry());

      const written = (mockWriteSync as unknown as jest.Mock).mock.calls[0][1] as string;
      const parsed = JSON.parse(written.trim());
      expect(parsed.nodeVersion).toBe(process.version);
    });

    it('includes the platform field', async () => {
      await logAuditEntry(makeEntry());

      const written = (mockWriteSync as unknown as jest.Mock).mock.calls[0][1] as string;
      const parsed = JSON.parse(written.trim());
      expect(typeof parsed.platform).toBe('string');
    });

    it('includes optional templateId when provided', async () => {
      await logAuditEntry(makeEntry({ templateId: 'web-app' }));

      const written = (mockWriteSync as unknown as jest.Mock).mock.calls[0][1] as string;
      const parsed = JSON.parse(written.trim());
      expect(parsed.templateId).toBe('web-app');
    });

    it('includes optional projectName when provided', async () => {
      await logAuditEntry(makeEntry({ projectName: 'my-project' }));

      const written = (mockWriteSync as unknown as jest.Mock).mock.calls[0][1] as string;
      const parsed = JSON.parse(written.trim());
      expect(parsed.projectName).toBe('my-project');
    });

    it('includes optional error message when provided', async () => {
      await logAuditEntry(makeEntry({ result: 'failure', error: 'Template not found' }));

      const written = (mockWriteSync as unknown as jest.Mock).mock.calls[0][1] as string;
      const parsed = JSON.parse(written.trim());
      expect(parsed.error).toBe('Template not found');
    });
  });

  describe('log file and directory creation', () => {
    it('calls ensureDir before writing to guarantee the directory exists', async () => {
      await logAuditEntry(makeEntry());

      expect(mockEnsureDir).toHaveBeenCalledTimes(1);
    });

    it('opens the log file with append mode and owner-only permissions', async () => {
      await logAuditEntry(makeEntry());

      expect(mockOpenSync).toHaveBeenCalledWith(
        expect.any(String),
        'a',
        0o600
      );
    });

    it('calls writeSync exactly once per logAuditEntry call', async () => {
      await logAuditEntry(makeEntry());

      expect(mockWriteSync).toHaveBeenCalledTimes(1);
    });

    it('always closes the file descriptor after writing', async () => {
      await logAuditEntry(makeEntry());

      expect(mockCloseSync).toHaveBeenCalledWith(42);
    });
  });

  describe('multiple entries', () => {
    it('appends a separate line for each logAuditEntry call', async () => {
      await logAuditEntry(makeEntry({ command: 'scaffold' }));
      await logAuditEntry(makeEntry({ command: 'list' }));

      expect(mockWriteSync).toHaveBeenCalledTimes(2);

      const firstLine = (mockWriteSync as unknown as jest.Mock).mock.calls[0][1] as string;
      const secondLine = (mockWriteSync as unknown as jest.Mock).mock.calls[1][1] as string;
      expect(JSON.parse(firstLine.trim()).command).toBe('scaffold');
      expect(JSON.parse(secondLine.trim()).command).toBe('list');
    });
  });

  describe('error resilience', () => {
    it('does not throw when ensureDir fails', async () => {
      (mockEnsureDir as unknown as jest.Mock).mockRejectedValue(new Error('EACCES'));

      await expect(logAuditEntry(makeEntry())).resolves.toBeUndefined();
    });

    it('does not throw when openSync fails', async () => {
      (mockOpenSync as unknown as jest.Mock).mockImplementation(() => {
        throw new Error('ENOSPC: no space left');
      });

      await expect(logAuditEntry(makeEntry())).resolves.toBeUndefined();
    });

    it('does not propagate filesystem errors to callers', async () => {
      (mockEnsureDir as unknown as jest.Mock).mockRejectedValue(new Error('permission denied'));

      let threw = false;
      try {
        await logAuditEntry(makeEntry());
      } catch {
        threw = true;
      }
      expect(threw).toBe(false);
    });
  });

  describe('cancelled result', () => {
    it('records a cancelled result correctly', async () => {
      await logAuditEntry(makeEntry({ result: 'cancelled' }));

      const written = (mockWriteSync as unknown as jest.Mock).mock.calls[0][1] as string;
      const parsed = JSON.parse(written.trim());
      expect(parsed.result).toBe('cancelled');
    });
  });
});
