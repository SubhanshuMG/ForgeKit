// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import {
  validatePathContainment,
  sanitizeProjectName,
  validateHookCommand,
  validateTemplateId,
  validateExternalTemplateId,
} from '../core/security';

describe('security', () => {
  const root = '/tmp/test-output/my-project';

  // ── validatePathContainment ────────────────────────────────────────────────

  describe('validatePathContainment', () => {
    it('allows files within root', () => {
      expect(validatePathContainment(root, 'src/index.ts')).toBe(true);
    });

    it('allows deeply nested files within root', () => {
      expect(validatePathContainment(root, 'a/b/c/d/e/file.ts')).toBe(true);
    });

    it('blocks directory traversal with ../', () => {
      expect(validatePathContainment(root, '../../../etc/passwd')).toBe(false);
    });

    it('blocks absolute paths outside root', () => {
      expect(validatePathContainment(root, '/etc/passwd')).toBe(false);
    });

    it('blocks traversal that would escape via encoded sequence', () => {
      // path.resolve handles these at OS level, so resolved path leaks out
      expect(validatePathContainment(root, 'src/../../etc/shadow')).toBe(false);
    });

    it('allows a path that resolves exactly to root itself', () => {
      // An empty relative path resolves to the root which is allowed
      expect(validatePathContainment(root, '.')).toBe(true);
    });

    it('blocks absolute path pointing directly to root of another tree', () => {
      expect(validatePathContainment(root, '/tmp/other-project/file.ts')).toBe(false);
    });
  });

  // ── sanitizeProjectName ───────────────────────────────────────────────────

  describe('sanitizeProjectName', () => {
    it('lowercases and replaces spaces', () => {
      expect(sanitizeProjectName('My Cool App')).toBe('my-cool-app');
    });

    it('removes leading/trailing hyphens', () => {
      expect(sanitizeProjectName('--test--')).toBe('test');
    });

    it('collapses multiple hyphens', () => {
      expect(sanitizeProjectName('my---app')).toBe('my-app');
    });

    it('replaces special characters with hyphens', () => {
      const result = sanitizeProjectName('my@app!name');
      // special chars become hyphens, then collapsed
      expect(result).toMatch(/^[a-z0-9-_]+$/);
      expect(result).toContain('my');
      expect(result).toContain('app');
    });

    it('replaces dots with hyphens', () => {
      const result = sanitizeProjectName('my.app.name');
      expect(result).toMatch(/^[a-z0-9-_]+$/);
    });

    it('replaces slashes with hyphens', () => {
      const result = sanitizeProjectName('my/app');
      expect(result).toMatch(/^[a-z0-9-_]+$/);
    });

    it('handles a name that is entirely special characters', () => {
      // After sanitise everything is hyphens, which are then stripped → empty
      const result = sanitizeProjectName('!!!');
      // leading/trailing hyphens stripped → empty string is acceptable
      expect(typeof result).toBe('string');
    });

    it('truncates the name to 214 characters (npm package name max length)', () => {
      const longName = 'a'.repeat(300);
      const result = sanitizeProjectName(longName);
      expect(result.length).toBeLessThanOrEqual(214);
    });

    it('preserves underscores', () => {
      expect(sanitizeProjectName('my_app')).toBe('my_app');
    });

    it('preserves hyphens that are within the name', () => {
      expect(sanitizeProjectName('my-app')).toBe('my-app');
    });

    it('lowercases uppercase characters', () => {
      expect(sanitizeProjectName('MYAPP')).toBe('myapp');
    });
  });

  // ── validateHookCommand ───────────────────────────────────────────────────

  describe('validateHookCommand', () => {
    // Allowed commands
    it('allows npm', () => expect(validateHookCommand('npm')).toBe(true));
    it('allows npx', () => expect(validateHookCommand('npx')).toBe(true));
    it('allows yarn', () => expect(validateHookCommand('yarn')).toBe(true));
    it('allows pnpm', () => expect(validateHookCommand('pnpm')).toBe(true));
    it('allows pip', () => expect(validateHookCommand('pip')).toBe(true));
    it('allows pip3', () => expect(validateHookCommand('pip3')).toBe(true));
    it('allows python', () => expect(validateHookCommand('python')).toBe(true));
    it('allows python3', () => expect(validateHookCommand('python3')).toBe(true));

    // Disallowed commands
    it('blocks rm', () => expect(validateHookCommand('rm')).toBe(false));
    it('blocks curl', () => expect(validateHookCommand('curl')).toBe(false));
    it('blocks bash', () => expect(validateHookCommand('bash')).toBe(false));
    it('blocks sh', () => expect(validateHookCommand('sh')).toBe(false));
    it('blocks wget', () => expect(validateHookCommand('wget')).toBe(false));
    it('blocks eval', () => expect(validateHookCommand('eval')).toBe(false));
    it('blocks empty string', () => expect(validateHookCommand('')).toBe(false));
    it('blocks command with path prefix (e.g. /bin/npm)', () => {
      expect(validateHookCommand('/bin/npm')).toBe(false);
    });
    it('blocks command with shell injection suffix', () => {
      expect(validateHookCommand('npm; rm -rf /')).toBe(false);
    });
  });

  // ── validateTemplateId ────────────────────────────────────────────────────

  describe('validateTemplateId', () => {
    it('allows valid lowercase-hyphen ids', () => expect(validateTemplateId('web-app')).toBe(true));
    it('allows ids with numbers', () => expect(validateTemplateId('web-app-2')).toBe(true));
    it('allows ids with underscores', () => expect(validateTemplateId('web_app')).toBe(true));
    it('blocks path traversal', () => expect(validateTemplateId('../evil')).toBe(false));
    it('blocks uppercase', () => expect(validateTemplateId('WebApp')).toBe(false));
    it('blocks spaces', () => expect(validateTemplateId('web app')).toBe(false));
    it('blocks slashes', () => expect(validateTemplateId('web/app')).toBe(false));
    it('blocks empty string', () => expect(validateTemplateId('')).toBe(false));
  });

  // ── validateExternalTemplateId – github: prefix ───────────────────────────

  describe('validateExternalTemplateId – github:', () => {
    it('accepts valid owner/repo', () => {
      expect(validateExternalTemplateId('github:owner/repo')).toBe(true);
    });

    it('accepts owner/repo with branch ref', () => {
      expect(validateExternalTemplateId('github:owner/repo#develop')).toBe(true);
    });

    it('accepts owner/repo with dots and underscores', () => {
      expect(validateExternalTemplateId('github:my_org/my.repo')).toBe(true);
    });

    it('accepts owner/repo with numeric segments', () => {
      expect(validateExternalTemplateId('github:org123/repo456')).toBe(true);
    });

    it('rejects missing repo name', () => {
      expect(validateExternalTemplateId('github:owner/')).toBe(false);
    });

    it('rejects missing owner', () => {
      expect(validateExternalTemplateId('github:/repo')).toBe(false);
    });

    it('rejects path traversal in owner segment', () => {
      expect(validateExternalTemplateId('github:../evil/repo')).toBe(false);
    });

    it('rejects path traversal in repo segment', () => {
      expect(validateExternalTemplateId('github:owner/../etc')).toBe(false);
    });

    it('rejects spaces in owner', () => {
      expect(validateExternalTemplateId('github:bad owner/repo')).toBe(false);
    });

    it('rejects shell injection characters', () => {
      expect(validateExternalTemplateId('github:owner/repo;rm -rf /')).toBe(false);
    });

    it('rejects empty string after prefix', () => {
      expect(validateExternalTemplateId('github:')).toBe(false);
    });

    it('rejects bare github: with no path', () => {
      expect(validateExternalTemplateId('github:')).toBe(false);
    });
  });

  // ── validateExternalTemplateId – npm: prefix ─────────────────────────────

  describe('validateExternalTemplateId – npm:', () => {
    it('accepts a simple package name', () => {
      expect(validateExternalTemplateId('npm:my-template')).toBe(true);
    });

    it('accepts scoped package name', () => {
      expect(validateExternalTemplateId('npm:@forgekit/template-react')).toBe(true);
    });

    it('accepts package name with numbers', () => {
      expect(validateExternalTemplateId('npm:template-v2')).toBe(true);
    });

    it('rejects uppercase characters', () => {
      expect(validateExternalTemplateId('npm:MyTemplate')).toBe(false);
    });

    it('rejects empty string after prefix', () => {
      expect(validateExternalTemplateId('npm:')).toBe(false);
    });

    it('rejects path traversal in package name', () => {
      expect(validateExternalTemplateId('npm:../etc/passwd')).toBe(false);
    });

    it('rejects spaces in package name', () => {
      expect(validateExternalTemplateId('npm:bad name')).toBe(false);
    });

    it('rejects shell injection characters', () => {
      expect(validateExternalTemplateId('npm:pkg; rm -rf /')).toBe(false);
    });
  });

  // ── validateExternalTemplateId – unknown/missing prefix ──────────────────

  describe('validateExternalTemplateId – unknown prefix', () => {
    it('rejects a built-in template id without prefix', () => {
      expect(validateExternalTemplateId('web-app')).toBe(false);
    });

    it('rejects http: prefix (not supported)', () => {
      expect(validateExternalTemplateId('http://example.com/template')).toBe(false);
    });

    it('rejects completely empty string', () => {
      expect(validateExternalTemplateId('')).toBe(false);
    });

    it('rejects a prefix that looks like github: but differs', () => {
      expect(validateExternalTemplateId('Github:owner/repo')).toBe(false);
    });
  });
});
