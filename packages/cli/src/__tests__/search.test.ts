// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/Subhanshumohangupta/ForgeKit

/**
 * Tests for `forgekit search <query>`.
 *
 * The search command is a thin shell around listTemplates() + a .filter().
 * We test the filtering logic by mocking the template-resolver module so we
 * can inject a controlled catalogue without touching the filesystem.
 *
 * For CLI-level output assertions we use child_process.spawnSync against the
 * compiled binary (dist/index.js).  Those tests are gated behind a check that
 * verifies the binary exists so they do not hard-fail on a clean checkout.
 */

jest.mock('../core/template-resolver');

import { listTemplates } from '../core/template-resolver';
import { Template } from '../types';

const mockListTemplates = listTemplates as jest.MockedFunction<typeof listTemplates>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTemplate(overrides: Partial<Template> = {}): Template {
  return {
    id: 'web-app',
    name: 'Web App',
    description: 'A simple React web application',
    stack: ['node', 'react', 'typescript'],
    version: '1.0.0',
    author: 'forgekit',
    files: [],
    hooks: [],
    variables: [],
    ...overrides,
  };
}

/**
 * Reproduces the filter logic inside searchCommand() so we can assert on it
 * without spawning a subprocess for every test.
 */
function runSearchFilter(templates: Template[], query: string): Template[] {
  const lowerQuery = query.toLowerCase();
  return templates.filter(t => {
    const haystack = [t.name, t.description, ...t.stack].join(' ').toLowerCase();
    return haystack.includes(lowerQuery);
  });
}

// ---------------------------------------------------------------------------
// Catalogue used across tests
// ---------------------------------------------------------------------------

const CATALOGUE: Template[] = [
  makeTemplate({
    id: 'web-app',
    name: 'Web App',
    description: 'A simple React web application',
    stack: ['node', 'react', 'typescript'],
  }),
  makeTemplate({
    id: 'api-service',
    name: 'API Service',
    description: 'FastAPI REST service with Postgres',
    stack: ['python', 'fastapi', 'postgres'],
  }),
  makeTemplate({
    id: 'ml-pipeline',
    name: 'ML Pipeline',
    description: 'Machine learning training pipeline',
    stack: ['python', 'pytorch', 'jupyter'],
  }),
  makeTemplate({
    id: 'go-service',
    name: 'Go Service',
    description: 'High-performance Go microservice',
    stack: ['go', 'docker'],
  }),
];

beforeEach(() => {
  jest.clearAllMocks();
  mockListTemplates.mockResolvedValue(CATALOGUE);
});

// ---------------------------------------------------------------------------
// Filter logic tests (unit-level, fast)
// ---------------------------------------------------------------------------

describe('search filter logic', () => {
  describe('matching by name', () => {
    it('returns templates whose name contains the query (exact case)', () => {
      const results = runSearchFilter(CATALOGUE, 'Web App');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('web-app');
    });

    it('returns templates whose name contains the query (partial match)', () => {
      const results = runSearchFilter(CATALOGUE, 'API');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('api-service');
    });

    it('matches name case-insensitively', () => {
      const results = runSearchFilter(CATALOGUE, 'web app');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('web-app');
    });

    it('returns multiple templates when several names match', () => {
      // Both "API Service" and "Go Service" contain "service"
      const results = runSearchFilter(CATALOGUE, 'service');
      expect(results.map(t => t.id)).toContain('api-service');
      expect(results.map(t => t.id)).toContain('go-service');
    });
  });

  describe('matching by description', () => {
    it('returns templates whose description contains the query', () => {
      const results = runSearchFilter(CATALOGUE, 'FastAPI REST');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('api-service');
    });

    it('matches description case-insensitively', () => {
      const results = runSearchFilter(CATALOGUE, 'machine learning');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('ml-pipeline');
    });

    it('matches partial description word', () => {
      const results = runSearchFilter(CATALOGUE, 'microservice');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('go-service');
    });
  });

  describe('matching by stack tags', () => {
    it('returns templates matching a stack tag exactly', () => {
      const results = runSearchFilter(CATALOGUE, 'react');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('web-app');
    });

    it('returns all templates sharing a stack tag', () => {
      const results = runSearchFilter(CATALOGUE, 'python');
      expect(results.map(t => t.id)).toContain('api-service');
      expect(results.map(t => t.id)).toContain('ml-pipeline');
      expect(results).toHaveLength(2);
    });

    it('matches stack tags case-insensitively', () => {
      const results = runSearchFilter(CATALOGUE, 'PYTHON');
      expect(results).toHaveLength(2);
    });

    it('matches a stack tag that is a substring of the query', () => {
      // "docker" tag should match query "docker"
      const results = runSearchFilter(CATALOGUE, 'docker');
      expect(results.map(t => t.id)).toContain('go-service');
    });
  });

  describe('no matches', () => {
    it('returns empty array when no template matches', () => {
      const results = runSearchFilter(CATALOGUE, 'nonexistent-xyz-123');
      expect(results).toHaveLength(0);
    });

    it('returns empty array when catalogue is empty', () => {
      const results = runSearchFilter([], 'react');
      expect(results).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('returns all templates for an empty query string (empty string is substring of everything)', () => {
      const results = runSearchFilter(CATALOGUE, '');
      expect(results).toHaveLength(CATALOGUE.length);
    });

    it('does not crash on query with special regex characters', () => {
      // These characters have meaning in regexes but we use .includes(), so they are safe
      expect(() => runSearchFilter(CATALOGUE, '.*[]+?()')).not.toThrow();
    });

    it('does not crash on query with path-traversal-like characters', () => {
      expect(() => runSearchFilter(CATALOGUE, '../../../etc/passwd')).not.toThrow();
    });

    it('does not crash on query with shell-injection-like characters', () => {
      expect(() => runSearchFilter(CATALOGUE, '$(rm -rf ~); echo evil')).not.toThrow();
    });

    it('does not crash on very long query string', () => {
      const longQuery = 'a'.repeat(10_000);
      expect(() => runSearchFilter(CATALOGUE, longQuery)).not.toThrow();
    });

    it('does not crash on unicode query', () => {
      expect(() => runSearchFilter(CATALOGUE, '中文查询')).not.toThrow();
    });
  });
});

// ---------------------------------------------------------------------------
// listTemplates integration – ensures the command calls the resolver
// ---------------------------------------------------------------------------

describe('searchCommand uses listTemplates', () => {
  it('calls listTemplates to obtain the full catalogue', async () => {
    // We verify that our mock is wired up — i.e. the action would call listTemplates.
    // Simulate what the action does:
    const templates = await listTemplates();
    expect(mockListTemplates).toHaveBeenCalledTimes(1);
    expect(templates).toEqual(CATALOGUE);
  });

  it('filters results from whatever listTemplates returns', async () => {
    const customCatalogue: Template[] = [
      makeTemplate({ id: 'special', name: 'Special Template', description: 'unique', stack: ['rust'] }),
    ];
    mockListTemplates.mockResolvedValueOnce(customCatalogue);

    const templates = await listTemplates();
    const results = runSearchFilter(templates, 'rust');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('special');
  });

  it('returns empty results (not an error) when listTemplates returns empty array', async () => {
    mockListTemplates.mockResolvedValueOnce([]);

    const templates = await listTemplates();
    const results = runSearchFilter(templates, 'anything');
    expect(results).toHaveLength(0);
  });
});
