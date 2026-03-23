// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0

jest.mock('fs-extra');
jest.mock('../core/template-loader');

import * as fsExtra from 'fs-extra';
import { isExternalTemplate, loadExternalTemplate } from '../core/template-loader';
import { loadRegistry, getTemplate, listTemplates, getTemplateDir } from '../core/template-resolver';
import { Template, TemplateRegistry } from '../types';

const mockPathExists = fsExtra.pathExists as jest.MockedFunction<typeof fsExtra.pathExists>;
const mockReadJson = fsExtra.readJson as jest.MockedFunction<typeof fsExtra.readJson>;
const mockIsExternalTemplate = isExternalTemplate as jest.MockedFunction<typeof isExternalTemplate>;
const mockLoadExternalTemplate = loadExternalTemplate as jest.MockedFunction<typeof loadExternalTemplate>;

function makeTemplate(id: string): Template {
  return {
    id,
    name: `${id} template`,
    description: `A ${id} template`,
    stack: ['Node.js'],
    version: '1.0.0',
    author: 'ForgeKit',
    files: [],
    hooks: [],
    variables: [],
  };
}

function makeRegistry(ids: string[]): TemplateRegistry {
  return { version: '1.0.0', templates: ids.map(makeTemplate) };
}

describe('loadRegistry', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns parsed registry when file exists', async () => {
    (mockPathExists as unknown as jest.Mock).mockResolvedValue(true);
    mockReadJson.mockResolvedValue(makeRegistry(['web-app', 'api-service']));

    const registry = await loadRegistry();

    expect(registry.templates).toHaveLength(2);
    expect(registry.templates[0].id).toBe('web-app');
  });

  it('throws when registry file does not exist', async () => {
    (mockPathExists as unknown as jest.Mock).mockResolvedValue(false);

    await expect(loadRegistry()).rejects.toThrow('Template registry not found');
  });
});

describe('getTemplate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsExternalTemplate.mockReturnValue(false);
  });

  it('delegates to loadExternalTemplate for external IDs', async () => {
    mockIsExternalTemplate.mockReturnValue(true);
    const external = makeTemplate('github:owner/repo');
    mockLoadExternalTemplate.mockResolvedValue(external);

    const result = await getTemplate('github:owner/repo');

    expect(mockLoadExternalTemplate).toHaveBeenCalledWith('github:owner/repo');
    expect(result.id).toBe('github:owner/repo');
  });

  it('throws for invalid template IDs', async () => {
    await expect(getTemplate('INVALID ID!')).rejects.toThrow('Invalid template ID');
  });

  it('throws when template is not in registry', async () => {
    (mockPathExists as unknown as jest.Mock).mockResolvedValue(true);
    mockReadJson.mockResolvedValue(makeRegistry(['web-app']));

    await expect(getTemplate('unknown-template')).rejects.toThrow('not found');
  });

  it('returns the matching template when found', async () => {
    (mockPathExists as unknown as jest.Mock).mockResolvedValue(true);
    mockReadJson.mockResolvedValue(makeRegistry(['web-app', 'api-service', 'ml-pipeline']));

    const template = await getTemplate('api-service');

    expect(template.id).toBe('api-service');
  });

  it('includes available template IDs in the not-found error message', async () => {
    (mockPathExists as unknown as jest.Mock).mockResolvedValue(true);
    mockReadJson.mockResolvedValue(makeRegistry(['web-app', 'api-service']));

    await expect(getTemplate('missing')).rejects.toThrow(/web-app.*api-service|api-service.*web-app/);
  });
});

describe('listTemplates', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns all templates from the registry', async () => {
    (mockPathExists as unknown as jest.Mock).mockResolvedValue(true);
    mockReadJson.mockResolvedValue(makeRegistry(['web-app', 'api-service', 'ml-pipeline']));

    const templates = await listTemplates();

    expect(templates).toHaveLength(3);
    expect(templates.map(t => t.id)).toContain('ml-pipeline');
  });

  it('returns empty array when registry has no templates', async () => {
    (mockPathExists as unknown as jest.Mock).mockResolvedValue(true);
    mockReadJson.mockResolvedValue({ version: '1.0.0', templates: [] });

    const templates = await listTemplates();

    expect(templates).toHaveLength(0);
  });
});

describe('getTemplateDir', () => {
  it('returns a path ending with the template ID', () => {
    const dir = getTemplateDir('web-app');

    expect(dir.endsWith('web-app') || dir.endsWith('web-app/')).toBe(true);
  });

  it('returns different paths for different IDs', () => {
    expect(getTemplateDir('web-app')).not.toBe(getTemplateDir('api-service'));
  });
});
