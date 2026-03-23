// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit

export interface Template {
  id: string;
  name: string;
  description: string;
  stack: string[];
  version: string;
  author: string;
  files: TemplateFile[];
  hooks: Hook[];
  variables: TemplateVariable[];
}

export interface TemplateFile {
  src: string;       // source path in template dir
  dest: string;      // destination path (supports {{name}} tokens)
  condition?: string; // optional: only include if variable is truthy
}

export interface Hook {
  type: 'post-scaffold';
  command: string;
  args: string[];
  condition?: string;
}

export interface TemplateVariable {
  name: string;
  prompt: string;
  type: 'string' | 'boolean' | 'select';
  default?: string | boolean;
  choices?: string[];  // for type: select
}

export interface ScaffoldOptions {
  projectName: string;
  templateId: string;
  outputDir: string;
  variables: Record<string, string | boolean>;
  skipInstall?: boolean;
  dryRun?: boolean;
}

export interface ScaffoldResult {
  success: boolean;
  projectPath: string;
  filesCreated: string[];
  errors: string[];
  nextSteps: string[];
}

export interface TemplateRegistry {
  version: string;
  templates: Template[];
}
