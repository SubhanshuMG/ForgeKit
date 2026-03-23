// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.

/**
 * Tests for template-loader.ts  (isExternalTemplate, loadExternalTemplate)
 * and the security helpers it delegates to (validateExternalTemplateId from
 * security.ts).
 *
 * loadExternalTemplate makes real network calls and spawns processes; we mock
 * those at the module boundary so every test is deterministic and offline.
 */

// ---- module mocks MUST be hoisted above imports ----------------------------
jest.mock('https');
jest.mock('fs');
jest.mock('child_process');

import { EventEmitter } from 'events';
import * as https from 'https';
import * as fs from 'fs';
import * as childProcess from 'child_process';

import { validateExternalTemplateId } from '../core/security';
import { isExternalTemplate, loadExternalTemplate } from '../core/template-loader';

// ---------------------------------------------------------------------------
// Mocked module references
// ---------------------------------------------------------------------------

// We use `as unknown as jest.Mock` casts because the overloaded signatures on
// spawnSync / https.get are not directly compatible with jest.MockedFunction's
// constraint.  Casting through unknown is the standard Jest+TypeScript pattern
// for overloaded built-ins.
const mockHttpsGet = https.get as unknown as jest.Mock;
const mockSpawnSync = childProcess.spawnSync as unknown as jest.Mock;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// isExternalTemplate
// ---------------------------------------------------------------------------

describe('isExternalTemplate', () => {
  it('returns true for github: prefix', () => {
    expect(isExternalTemplate('github:owner/repo')).toBe(true);
  });

  it('returns true for npm: prefix', () => {
    expect(isExternalTemplate('npm:my-template')).toBe(true);
  });

  it('returns false for a built-in template id', () => {
    expect(isExternalTemplate('web-app')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isExternalTemplate('')).toBe(false);
  });

  it('returns false for an id that nearly starts with github (capital G)', () => {
    expect(isExternalTemplate('Github:owner/repo')).toBe(false);
  });

  it('returns false for a plain URL without a supported prefix', () => {
    expect(isExternalTemplate('https://github.com/owner/repo')).toBe(false);
  });

  it('returns false for template id with leading whitespace', () => {
    expect(isExternalTemplate(' github:owner/repo')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateExternalTemplateId – github:
// (imported directly from security to keep tests co-located with the loader)
// ---------------------------------------------------------------------------

describe('validateExternalTemplateId - github:', () => {
  it('accepts valid owner/repo', () => {
    expect(validateExternalTemplateId('github:owner/repo')).toBe(true);
  });

  it('accepts owner/repo with branch', () => {
    expect(validateExternalTemplateId('github:owner/repo#develop')).toBe(true);
  });

  it('accepts owner/repo with dots and underscores', () => {
    expect(validateExternalTemplateId('github:my_org/my.repo')).toBe(true);
  });

  it('rejects missing repo name', () => {
    expect(validateExternalTemplateId('github:owner/')).toBe(false);
  });

  it('rejects missing owner', () => {
    expect(validateExternalTemplateId('github:/repo')).toBe(false);
  });

  it('rejects path traversal in owner', () => {
    expect(validateExternalTemplateId('github:../evil/repo')).toBe(false);
  });

  it('rejects spaces in owner', () => {
    expect(validateExternalTemplateId('github:bad owner/repo')).toBe(false);
  });

  it('rejects empty after prefix', () => {
    expect(validateExternalTemplateId('github:')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateExternalTemplateId – npm:
// ---------------------------------------------------------------------------

describe('validateExternalTemplateId - npm:', () => {
  it('accepts valid package name', () => {
    expect(validateExternalTemplateId('npm:my-template')).toBe(true);
  });

  it('accepts scoped package name', () => {
    expect(validateExternalTemplateId('npm:@forgekit/template-react')).toBe(true);
  });

  it('rejects uppercase characters', () => {
    expect(validateExternalTemplateId('npm:MyTemplate')).toBe(false);
  });

  it('rejects empty after prefix', () => {
    expect(validateExternalTemplateId('npm:')).toBe(false);
  });

  it('rejects path traversal', () => {
    expect(validateExternalTemplateId('npm:../etc/passwd')).toBe(false);
  });

  it('rejects spaces', () => {
    expect(validateExternalTemplateId('npm:bad name')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// loadExternalTemplate – input validation (no network/process needed)
// ---------------------------------------------------------------------------

describe('loadExternalTemplate – input validation', () => {
  it('throws with a clear error message for an invalid github ID', async () => {
    await expect(loadExternalTemplate('github:bad owner/repo'))
      .rejects
      .toThrow(/Invalid external template ID/);
  });

  it('throws with a clear error message for an invalid npm ID', async () => {
    await expect(loadExternalTemplate('npm:MyUpperCase'))
      .rejects
      .toThrow(/Invalid external template ID/);
  });

  it('throws with a clear error message for an empty string', async () => {
    await expect(loadExternalTemplate(''))
      .rejects
      .toThrow(/Invalid external template ID/);
  });

  it('throws with a clear error message for a built-in template id (no prefix)', async () => {
    await expect(loadExternalTemplate('web-app'))
      .rejects
      .toThrow(/Invalid external template ID/);
  });

  it('throws for a path-traversal ID', async () => {
    await expect(loadExternalTemplate('github:../evil/repo'))
      .rejects
      .toThrow(/Invalid external template ID/);
  });

  it('throws with clear error for unsupported prefix', async () => {
    // Force an ID that passes the github/npm prefix checks but routes to neither arm.
    // We do this by patching validateExternalTemplateId via the real security module —
    // but since that is imported directly we instead test the guard path by crafting
    // an impossible-but-valid-looking id (the real code throws for unknown prefixes).
    // The only way to reach the "Unsupported template prefix" branch is to have a
    // valid-looking id that passes validateExternalTemplateId but starts with neither
    // "github:" nor "npm:".  Since the validator only allows those two, we instead
    // verify that totally unknown input triggers the "Invalid external template ID"
    // error which is the correct first-line defence.
    await expect(loadExternalTemplate('http://evil.com/template'))
      .rejects
      .toThrow(/Invalid external template ID/);
  });
});

// ---------------------------------------------------------------------------
// loadExternalTemplate – download size limit (mocked https.get)
// ---------------------------------------------------------------------------

describe('loadExternalTemplate – download size limit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects when the download exceeds the 100 MB hard cap', async () => {
    const MAX_BYTES = 100 * 1024 * 1024; // 100 MB

    // Build an EventEmitter-based mock response that emits a single chunk
    // larger than the limit, simulating an oversized download.

    const fakeReq = new EventEmitter() as NodeJS.EventEmitter & { destroy: jest.Mock };
    fakeReq.destroy = jest.fn();

    const fakeRes = new EventEmitter() as NodeJS.EventEmitter & { statusCode: number; headers: Record<string, string> };
    fakeRes.statusCode = 200;
    fakeRes.headers = {};

    (mockHttpsGet as jest.Mock).mockImplementation(
      (_url: unknown, _opts: unknown, callback: (res: typeof fakeRes) => void) => {
        // Call the response callback asynchronously
        setImmediate(() => {
          callback(fakeRes);
          // Emit a single oversized chunk
          setImmediate(() => {
            fakeRes.emit('data', Buffer.alloc(MAX_BYTES + 1));
          });
        });
        return fakeReq;
      }
    );

    // Also mock fs so createTempDir (mkdtempSync) does not touch real filesystem
    (fs.mkdtempSync as jest.Mock).mockReturnValue('/tmp/forgekit-gh-fake');

    await expect(loadExternalTemplate('github:owner/repo'))
      .rejects
      .toThrow(/100 MB limit|exceeded/i);
  });
});

// ---------------------------------------------------------------------------
// loadExternalTemplate – SSRF redirect rejection (mocked https.get)
// ---------------------------------------------------------------------------

describe('loadExternalTemplate – SSRF redirect rejection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects a redirect to a non-allowed host', async () => {

    const fakeReq = new EventEmitter() as NodeJS.EventEmitter & { destroy: jest.Mock };
    fakeReq.destroy = jest.fn();

    // First call: 302 redirect to an internal/untrusted host
    const redirectRes = new EventEmitter() as NodeJS.EventEmitter & {
      statusCode: number;
      headers: Record<string, string>;
    };
    redirectRes.statusCode = 302;
    redirectRes.headers = { location: 'https://169.254.169.254/latest/meta-data/' };

    // Second call after following the redirect (should be rejected before
    // reaching network, but we set up the mock conservatively)
    const blockedReq = new EventEmitter() as NodeJS.EventEmitter & { destroy: jest.Mock };
    blockedReq.destroy = jest.fn();

    let callCount = 0;
    (mockHttpsGet as jest.Mock).mockImplementation(
      (_url: unknown, _opts: unknown, callback: (res: typeof redirectRes) => void) => {
        callCount++;
        if (callCount === 1) {
          setImmediate(() => callback(redirectRes));
          return fakeReq;
        }
        // Should not be reached — SSRF guard fires before issuing second request
        return blockedReq;
      }
    );

    (fs.mkdtempSync as jest.Mock).mockReturnValue('/tmp/forgekit-gh-fake');

    await expect(loadExternalTemplate('github:owner/repo'))
      .rejects
      .toThrow(/untrusted host|redirect|SSRF|security/i);
  });

  it('rejects a redirect to a plain HTTP URL (MITM downgrade attack)', async () => {

    const fakeReq = new EventEmitter() as NodeJS.EventEmitter & { destroy: jest.Mock };
    fakeReq.destroy = jest.fn();

    const redirectRes = new EventEmitter() as NodeJS.EventEmitter & {
      statusCode: number;
      headers: Record<string, string>;
    };
    redirectRes.statusCode = 301;
    redirectRes.headers = { location: 'http://evil.com/template' }; // plain HTTP!

    (mockHttpsGet as jest.Mock).mockImplementation(
      (_url: unknown, _opts: unknown, callback: (res: typeof redirectRes) => void) => {
        setImmediate(() => callback(redirectRes));
        return fakeReq;
      }
    );

    (fs.mkdtempSync as jest.Mock).mockReturnValue('/tmp/forgekit-gh-fake');

    await expect(loadExternalTemplate('github:owner/repo'))
      .rejects
      .toThrow(/non-HTTPS|insecure|redirect/i);
  });
});

// ---------------------------------------------------------------------------
// httpsGet – HTTP 4xx/5xx error and network error paths
// ---------------------------------------------------------------------------

/** Returns a mock https.get response that resolves with a 200 and a small buffer */
function mockSuccessfulDownload(data: Buffer = Buffer.from('fake-tarball')) {
  const fakeReq = new EventEmitter() as NodeJS.EventEmitter & { destroy: jest.Mock };
  fakeReq.destroy = jest.fn();
  const fakeRes = new EventEmitter() as NodeJS.EventEmitter & {
    statusCode: number;
    headers: Record<string, string>;
  };
  fakeRes.statusCode = 200;
  fakeRes.headers = {};

  mockHttpsGet.mockImplementation(
    (_url: unknown, _opts: unknown, callback: (res: typeof fakeRes) => void) => {
      setImmediate(() => {
        callback(fakeRes);
        setImmediate(() => {
          fakeRes.emit('data', data);
          fakeRes.emit('end');
        });
      });
      return fakeReq;
    }
  );
  return { fakeReq, fakeRes };
}

describe('httpsGet – HTTP error status', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejects when the server returns a 4xx status', async () => {
    const fakeReq = new EventEmitter() as NodeJS.EventEmitter & { destroy: jest.Mock };
    fakeReq.destroy = jest.fn();
    const fakeRes = new EventEmitter() as NodeJS.EventEmitter & {
      statusCode: number;
      headers: Record<string, string>;
    };
    fakeRes.statusCode = 404;
    fakeRes.headers = {};

    mockHttpsGet.mockImplementation(
      (_url: unknown, _opts: unknown, callback: (res: typeof fakeRes) => void) => {
        setImmediate(() => callback(fakeRes));
        return fakeReq;
      }
    );
    (fs.mkdtempSync as jest.Mock).mockReturnValue('/tmp/forgekit-gh-fake');

    await expect(loadExternalTemplate('github:owner/repo'))
      .rejects
      .toThrow(/HTTP 404|Failed to download/i);
  });

  it('rejects when the request emits a network error', async () => {
    const fakeReq = new EventEmitter() as NodeJS.EventEmitter & { destroy: jest.Mock };
    fakeReq.destroy = jest.fn();

    mockHttpsGet.mockImplementation(() => {
      setImmediate(() => fakeReq.emit('error', new Error('ECONNREFUSED')));
      return fakeReq;
    });
    (fs.mkdtempSync as jest.Mock).mockReturnValue('/tmp/forgekit-gh-fake');

    await expect(loadExternalTemplate('github:owner/repo'))
      .rejects
      .toThrow(/ECONNREFUSED|Failed to download/i);
  });
});

// ---------------------------------------------------------------------------
// loadGitHubTemplate – extraction and manifest paths
// ---------------------------------------------------------------------------

describe('loadGitHubTemplate – extraction failures', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejects when tar extraction fails', async () => {
    mockSuccessfulDownload();
    (fs.mkdtempSync as jest.Mock).mockReturnValue('/tmp/forgekit-gh-fake');
    (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
    (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    mockSpawnSync.mockReturnValue({ status: 1, stderr: 'corrupt archive', stdout: '' });
    (fs.rmSync as jest.Mock).mockReturnValue(undefined);

    await expect(loadExternalTemplate('github:owner/repo'))
      .rejects
      .toThrow(/Failed to extract|corrupt archive/i);
  });

  it('rejects when a symlink is found in the extracted directory', async () => {
    mockSuccessfulDownload();
    (fs.mkdtempSync as jest.Mock).mockReturnValue('/tmp/forgekit-gh-fake');
    (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
    (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    mockSpawnSync.mockReturnValue({ status: 0, stderr: '', stdout: '' });

    // readdirSync returns an entry that is a symlink
    const symlinkEntry = {
      name: 'evil-link',
      isSymbolicLink: () => true,
      isDirectory: () => false,
    };
    (fs.readdirSync as jest.Mock).mockReturnValue([symlinkEntry]);
    (fs.rmSync as jest.Mock).mockReturnValue(undefined);

    await expect(loadExternalTemplate('github:owner/repo'))
      .rejects
      .toThrow(/symlink|Security/i);
  });

  it('rejects when forgekit.json manifest is missing', async () => {
    mockSuccessfulDownload();
    (fs.mkdtempSync as jest.Mock).mockReturnValue('/tmp/forgekit-gh-fake');
    (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
    (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    mockSpawnSync.mockReturnValue({ status: 0, stderr: '', stdout: '' });
    // readdirSync returns empty (no symlinks)
    (fs.readdirSync as jest.Mock).mockReturnValue([]);
    // existsSync returns false — manifest not found
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.rmSync as jest.Mock).mockReturnValue(undefined);

    await expect(loadExternalTemplate('github:owner/repo'))
      .rejects
      .toThrow(/missing forgekit.json|manifest/i);
  });

  it('rejects when manifest file src escapes the extraction directory', async () => {
    mockSuccessfulDownload();
    (fs.mkdtempSync as jest.Mock).mockReturnValue('/tmp/forgekit-gh-fake');
    (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
    (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    mockSpawnSync.mockReturnValue({ status: 0, stderr: '', stdout: '' });
    (fs.readdirSync as jest.Mock).mockReturnValue([]);
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    // Manifest with a path-traversal src
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({
      id: 'evil',
      name: 'Evil',
      description: 'Escapes dir',
      language: 'bash',
      files: [{ src: '../../etc/passwd', dest: 'output.txt' }],
    }));
    (fs.rmSync as jest.Mock).mockReturnValue(undefined);

    await expect(loadExternalTemplate('github:owner/repo'))
      .rejects
      .toThrow(/escape|Security/i);
  });

  it('loads successfully when manifest is valid and no symlinks exist', async () => {
    mockSuccessfulDownload();
    (fs.mkdtempSync as jest.Mock).mockReturnValue('/tmp/forgekit-gh-fake');
    (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
    (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    mockSpawnSync.mockReturnValue({ status: 0, stderr: '', stdout: '' });
    (fs.readdirSync as jest.Mock).mockReturnValue([]);
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({
      id: 'gh-template',
      name: 'GitHub Template',
      description: 'A valid template',
      language: 'typescript',
      files: [{ src: 'package.json', dest: 'package.json' }],
    }));
    (fs.rmSync as jest.Mock).mockReturnValue(undefined);

    const template = await loadExternalTemplate('github:owner/repo');

    expect(template.id).toBe('gh-template');
    expect(template.name).toBe('GitHub Template');
    expect(template.stack).toContain('typescript');
  });

  it('parses github IDs with an explicit branch', async () => {
    mockSuccessfulDownload();
    (fs.mkdtempSync as jest.Mock).mockReturnValue('/tmp/forgekit-gh-fake');
    (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
    (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    mockSpawnSync.mockReturnValue({ status: 0, stderr: '', stdout: '' });
    (fs.readdirSync as jest.Mock).mockReturnValue([]);
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({
      id: 'branched',
      name: 'Branched',
      description: 'Uses a specific branch',
      language: 'go',
      files: [],
    }));
    (fs.rmSync as jest.Mock).mockReturnValue(undefined);

    const template = await loadExternalTemplate('github:owner/repo#my-feature');

    expect(template.id).toBe('branched');
  });
});

// ---------------------------------------------------------------------------
// loadNpmTemplate – basic paths
// ---------------------------------------------------------------------------

describe('loadNpmTemplate', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejects when the npm package is not found', async () => {
    // First spawnSync call (dry-run check) fails
    mockSpawnSync.mockReturnValueOnce({ status: 1, stderr: 'not found', stdout: '' });
    (fs.mkdtempSync as jest.Mock).mockReturnValue('/tmp/forgekit-npm-fake');
    (fs.rmSync as jest.Mock).mockReturnValue(undefined);

    await expect(loadExternalTemplate('npm:my-template'))
      .rejects
      .toThrow(/not found|not accessible/i);
  });

  it('rejects when npm pack download fails', async () => {
    // dry-run succeeds
    mockSpawnSync.mockReturnValueOnce({ status: 0, stderr: '', stdout: '[]' });
    // actual pack fails
    mockSpawnSync.mockReturnValueOnce({ status: 1, stderr: 'network error', stdout: '' });
    (fs.mkdtempSync as jest.Mock).mockReturnValue('/tmp/forgekit-npm-fake');
    (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    (fs.rmSync as jest.Mock).mockReturnValue(undefined);

    await expect(loadExternalTemplate('npm:my-template'))
      .rejects
      .toThrow(/Failed to download npm package|network error/i);
  });

  it('loads successfully from npm when manifest is valid', async () => {
    // dry-run succeeds
    mockSpawnSync.mockReturnValueOnce({ status: 0, stderr: '', stdout: '[]' });
    // npm pack succeeds, returns filename
    mockSpawnSync.mockReturnValueOnce({ status: 0, stderr: '', stdout: 'my-template-1.0.0.tgz\n' });
    // tar extraction succeeds
    mockSpawnSync.mockReturnValueOnce({ status: 0, stderr: '', stdout: '' });

    (fs.mkdtempSync as jest.Mock).mockReturnValue('/tmp/forgekit-npm-fake');
    (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    (fs.readdirSync as jest.Mock).mockReturnValue([]);
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({
      id: 'npm-template',
      name: 'NPM Template',
      description: 'From npm',
      language: 'javascript',
      files: [],
    }));
    (fs.rmSync as jest.Mock).mockReturnValue(undefined);

    const template = await loadExternalTemplate('npm:my-template');

    expect(template.id).toBe('npm-template');
    expect(template.stack).toContain('javascript');
  });
});
