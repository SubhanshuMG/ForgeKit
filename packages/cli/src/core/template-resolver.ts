// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import * as path from 'path';
import * as fs from 'fs-extra';
import { Template, TemplateRegistry } from '../types';
import { validateTemplateId } from './security';

const TEMPLATES_DIR = path.resolve(__dirname, '../../../../templates');
const REGISTRY_PATH = path.join(TEMPLATES_DIR, 'registry.json');

export async function loadRegistry(): Promise<TemplateRegistry> {
  if (!await fs.pathExists(REGISTRY_PATH)) {
    throw new Error(`Template registry not found at ${REGISTRY_PATH}`);
  }
  return fs.readJson(REGISTRY_PATH);
}

export async function getTemplate(id: string): Promise<Template> {
  if (!validateTemplateId(id)) {
    throw new Error(`Invalid template ID: "${id}". IDs must be lowercase alphanumeric with hyphens.`);
  }
  const registry = await loadRegistry();
  const template = registry.templates.find(t => t.id === id);
  if (!template) {
    const available = registry.templates.map(t => t.id).join(', ');
    throw new Error(`Template "${id}" not found. Available templates: ${available}`);
  }
  return template;
}

export async function listTemplates(): Promise<Template[]> {
  const registry = await loadRegistry();
  return registry.templates;
}

export function getTemplateDir(templateId: string): string {
  return path.join(TEMPLATES_DIR, templateId);
}
