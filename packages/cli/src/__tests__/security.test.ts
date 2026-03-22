// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import { validatePathContainment, sanitizeProjectName, validateHookCommand, validateTemplateId } from '../core/security';

describe('security', () => {
  const root = '/tmp/test-output/my-project';

  describe('validatePathContainment', () => {
    it('allows files within root', () => {
      expect(validatePathContainment(root, 'src/index.ts')).toBe(true);
    });
    it('blocks directory traversal', () => {
      expect(validatePathContainment(root, '../../../etc/passwd')).toBe(false);
    });
    it('blocks absolute paths outside root', () => {
      expect(validatePathContainment(root, '/etc/passwd')).toBe(false);
    });
  });

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
  });

  describe('validateHookCommand', () => {
    it('allows npm', () => expect(validateHookCommand('npm')).toBe(true));
    it('allows pip', () => expect(validateHookCommand('pip')).toBe(true));
    it('blocks rm', () => expect(validateHookCommand('rm')).toBe(false));
    it('blocks curl', () => expect(validateHookCommand('curl')).toBe(false));
    it('blocks bash', () => expect(validateHookCommand('bash')).toBe(false));
  });

  describe('validateTemplateId', () => {
    it('allows valid ids', () => expect(validateTemplateId('web-app')).toBe(true));
    it('blocks path traversal', () => expect(validateTemplateId('../evil')).toBe(false));
    it('blocks uppercase', () => expect(validateTemplateId('WebApp')).toBe(false));
  });
});
