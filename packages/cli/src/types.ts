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

// ── AI Provider types ───────────────────────────────────────────────────────

export interface AIProvider {
  name: string;
  generateProjectSpec(description: string, templates: Template[]): Promise<ProjectSpec>;
}

export interface ProjectSpec {
  templateId: string;
  projectName: string;
  variables: Record<string, string | boolean>;
  explanation: string;
}

// ── Deploy types ────────────────────────────────────────────────────────────

export interface DetectedStack {
  provider: string;
  confidence: number;
  reason: string;
}

export interface DeployOptions {
  dryRun: boolean;
  environment: string;
  production: boolean;
}

export interface DeployResult {
  success: boolean;
  url?: string;
  logs: string[];
  errors: string[];
}

// ── Health types ────────────────────────────────────────────────────────────

export interface HealthCheck {
  category: 'security' | 'quality' | 'testing' | 'documentation' | 'devops';
  name: string;
  passed: boolean;
  score: number;
  weight: number;
  suggestion?: string;
}

export interface HealthReport {
  score: number;
  grade: string;
  checks: HealthCheck[];
  categoryScores: Record<string, { earned: number; max: number; percentage: number }>;
}

// ── Audit types ─────────────────────────────────────────────────────────────

export interface AuditResult {
  vulnerabilities: { critical: number; high: number; moderate: number; low: number; total: number };
  outdated: OutdatedPackage[];
  score: number;
  packageManager: string;
}

export interface OutdatedPackage {
  name: string;
  current: string;
  wanted: string;
  latest: string;
  type: 'major' | 'minor' | 'patch';
}

// ── Plugin types ────────────────────────────────────────────────────────────

export interface ForgeKitPlugin {
  name: string;
  version: string;
  description?: string;
  register(program: import('commander').Command): void;
}

export interface InstalledPlugin {
  name: string;
  packageName: string;
  version: string;
  description: string;
}

// ── Env sync types ──────────────────────────────────────────────────────────

export interface EncryptedPayload {
  encrypted: string;
  salt: string;
  iv: string;
  tag: string;
}

// ── Docs generator types ────────────────────────────────────────────────────

export interface ProjectAnalysis {
  name: string;
  description: string;
  packageManager: string;
  scripts: Record<string, string>;
  dependencies: string[];
  devDependencies: string[];
  hasTypeScript: boolean;
  hasDocker: boolean;
  hasCI: boolean;
  entryPoints: string[];
  directories: string[];
}

// ── Community registry types ────────────────────────────────────────────────

export interface CommunityTemplate {
  id: string;
  name: string;
  description: string;
  author: string;
  repository: string;
  downloads: number;
  stars: number;
  stack: string[];
  tags: string[];
  version: string;
  source: 'official' | 'community';
}
