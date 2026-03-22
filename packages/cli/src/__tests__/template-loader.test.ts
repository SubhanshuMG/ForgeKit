// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import { validateExternalTemplateId } from '../core/security';
import { isExternalTemplate } from '../core/template-loader';

describe('template-loader', () => {
  describe('isExternalTemplate', () => {
    it('returns true for github: prefix', () => {
      expect(isExternalTemplate('github:owner/repo')).toBe(true);
    });

    it('returns true for npm: prefix', () => {
      expect(isExternalTemplate('npm:my-template')).toBe(true);
    });

    it('returns false for regular template IDs', () => {
      expect(isExternalTemplate('web-app')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isExternalTemplate('')).toBe(false);
    });
  });

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
});
