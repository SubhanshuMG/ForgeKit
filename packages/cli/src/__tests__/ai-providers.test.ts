// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import { buildSystemPrompt, parseAIResponse } from '../core/ai-providers/shared';
import { Template } from '../types';

// ── Test fixtures ────────────────────────────────────────────────────────────

const TEMPLATES: Template[] = [
  {
    id: 'web-app',
    name: 'Web Application',
    description: 'A full-stack web application',
    stack: ['React', 'Node.js'],
    version: '1.0.0',
    author: 'ForgeKit',
    files: [],
    hooks: [],
    variables: [],
  },
  {
    id: 'api-server',
    name: 'API Server',
    description: 'A REST API server',
    stack: ['Express', 'TypeScript'],
    version: '1.0.0',
    author: 'ForgeKit',
    files: [],
    hooks: [],
    variables: [],
  },
  {
    id: 'cli-tool',
    name: 'CLI Tool',
    description: 'A command-line tool',
    stack: ['Node.js', 'TypeScript'],
    version: '1.0.0',
    author: 'ForgeKit',
    files: [],
    hooks: [],
    variables: [],
  },
];

// ── buildSystemPrompt ────────────────────────────────────────────────────────

describe('buildSystemPrompt', () => {
  it('should include all template IDs in the prompt', () => {
    const prompt = buildSystemPrompt(TEMPLATES);

    expect(prompt).toContain('web-app');
    expect(prompt).toContain('api-server');
    expect(prompt).toContain('cli-tool');
  });

  it('should include template names and descriptions', () => {
    const prompt = buildSystemPrompt(TEMPLATES);

    expect(prompt).toContain('Web Application');
    expect(prompt).toContain('A full-stack web application');
    expect(prompt).toContain('API Server');
    expect(prompt).toContain('A REST API server');
  });

  it('should include stack information', () => {
    const prompt = buildSystemPrompt(TEMPLATES);

    expect(prompt).toContain('React');
    expect(prompt).toContain('Node.js');
    expect(prompt).toContain('Express');
    expect(prompt).toContain('TypeScript');
  });

  it('should instruct the AI to respond with JSON', () => {
    const prompt = buildSystemPrompt(TEMPLATES);

    expect(prompt).toContain('JSON');
    expect(prompt).toContain('templateId');
    expect(prompt).toContain('projectName');
  });

  it('should handle empty template list', () => {
    const prompt = buildSystemPrompt([]);

    expect(prompt).toContain('Available templates');
    // Should not throw
    expect(typeof prompt).toBe('string');
  });
});

// ── parseAIResponse ──────────────────────────────────────────────────────────

describe('parseAIResponse', () => {
  it('should parse valid JSON response', () => {
    const content = JSON.stringify({
      templateId: 'web-app',
      projectName: 'my-project',
      explanation: 'Good fit for a web app',
    });

    const result = parseAIResponse(content, TEMPLATES);

    expect(result.templateId).toBe('web-app');
    expect(result.projectName).toBe('my-project');
    expect(result.explanation).toBe('Good fit for a web app');
    expect(result.variables).toEqual({ name: 'my-project' });
  });

  it('should parse JSON wrapped in markdown code blocks', () => {
    const content = '```json\n' + JSON.stringify({
      templateId: 'api-server',
      projectName: 'my-api',
      explanation: 'Perfect for REST APIs',
    }) + '\n```';

    const result = parseAIResponse(content, TEMPLATES);

    expect(result.templateId).toBe('api-server');
    expect(result.projectName).toBe('my-api');
  });

  it('should parse JSON wrapped in plain code blocks (no language tag)', () => {
    const content = '```\n' + JSON.stringify({
      templateId: 'cli-tool',
      projectName: 'my-cli',
      explanation: 'CLI template',
    }) + '\n```';

    const result = parseAIResponse(content, TEMPLATES);

    expect(result.templateId).toBe('cli-tool');
  });

  it('should throw on completely invalid JSON', () => {
    expect(() => parseAIResponse('not json at all', TEMPLATES)).toThrow(
      'AI returned an invalid response'
    );
  });

  it('should throw on malformed JSON', () => {
    expect(() => parseAIResponse('{ broken: json }', TEMPLATES)).toThrow(
      'AI returned an invalid response'
    );
  });

  it('should throw when templateId does not exist in available templates', () => {
    const content = JSON.stringify({
      templateId: 'nonexistent-template',
      projectName: 'test',
      explanation: 'bad',
    });

    expect(() => parseAIResponse(content, TEMPLATES)).toThrow(
      'doesn\'t exist'
    );
  });

  it('should include available template IDs in error message for invalid templateId', () => {
    const content = JSON.stringify({
      templateId: 'wrong',
      projectName: 'test',
      explanation: 'bad',
    });

    expect(() => parseAIResponse(content, TEMPLATES)).toThrow('web-app');
    expect(() => parseAIResponse(content, TEMPLATES)).toThrow('api-server');
  });

  it('should sanitize project name', () => {
    const content = JSON.stringify({
      templateId: 'web-app',
      projectName: 'My Cool App!!',
      explanation: 'test',
    });

    const result = parseAIResponse(content, TEMPLATES);

    // sanitizeProjectName lowercases, replaces special chars with hyphens
    expect(result.projectName).toMatch(/^[a-z0-9-_]+$/);
    expect(result.projectName).toContain('my');
    expect(result.projectName).toContain('cool');
    expect(result.projectName).toContain('app');
  });

  it('should use default project name when none provided', () => {
    const content = JSON.stringify({
      templateId: 'web-app',
      explanation: 'test',
    });

    const result = parseAIResponse(content, TEMPLATES);

    expect(result.projectName).toBe('my-project');
  });

  it('should handle missing explanation gracefully', () => {
    const content = JSON.stringify({
      templateId: 'web-app',
      projectName: 'test-app',
    });

    const result = parseAIResponse(content, TEMPLATES);

    expect(result.explanation).toBe('');
  });

  it('should handle empty string response', () => {
    expect(() => parseAIResponse('', TEMPLATES)).toThrow(
      'AI returned an invalid response'
    );
  });

  it('should handle whitespace-only response', () => {
    expect(() => parseAIResponse('   \n\n  ', TEMPLATES)).toThrow(
      'AI returned an invalid response'
    );
  });

  it('should handle JSON with extra fields without crashing', () => {
    const content = JSON.stringify({
      templateId: 'web-app',
      projectName: 'test',
      explanation: 'ok',
      extraField: 'should be ignored',
      confidence: 0.95,
    });

    const result = parseAIResponse(content, TEMPLATES);

    expect(result.templateId).toBe('web-app');
    // Extra fields should not be in the result
    expect((result as unknown as Record<string, unknown>)['extraField']).toBeUndefined();
  });
});
