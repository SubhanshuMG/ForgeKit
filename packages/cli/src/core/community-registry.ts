// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import * as fs from 'fs';
import * as path from 'path';
import { listTemplates } from './template-resolver';

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

export interface MarketplaceSearchResult {
  templates: CommunityTemplate[];
  total: number;
}

export interface TemplateValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Required fields in a forgekit.json manifest.
 */
const REQUIRED_MANIFEST_FIELDS = ['id', 'name', 'description', 'version'] as const;

/**
 * Files that a well-formed publishable template should include.
 */
const RECOMMENDED_FILES = ['README.md'];
const REQUIRED_FILES = ['forgekit.json'];

/**
 * Converts local (official) templates into the CommunityTemplate format
 * so they can be displayed alongside community templates in search results.
 */
async function getOfficialTemplates(): Promise<CommunityTemplate[]> {
  try {
    const templates = await listTemplates();
    return templates.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      author: t.author || 'ForgeKit',
      repository: 'https://github.com/SubhanshuMG/ForgeKit',
      downloads: 0,
      stars: 0,
      stack: t.stack,
      tags: t.stack.map(s => s.toLowerCase()),
      version: t.version,
      source: 'official' as const,
    }));
  } catch {
    return [];
  }
}

/**
 * In the MVP, community templates are simulated from local data.
 * When a real remote registry is available, this function will fetch
 * from the registry API instead.
 */
async function getCommunityTemplates(): Promise<CommunityTemplate[]> {
  // MVP: return empty array -- community templates will come from
  // a remote registry in a future release
  return [];
}

/**
 * Search the marketplace by combining official and community templates.
 * Supports filtering by query string, tags, and sorting.
 */
export async function searchMarketplace(
  query: string,
  options?: {
    tags?: string[];
    sort?: 'downloads' | 'stars' | 'newest';
    communityOnly?: boolean;
  }
): Promise<MarketplaceSearchResult> {
  const [official, community] = await Promise.all([
    options?.communityOnly ? Promise.resolve([]) : getOfficialTemplates(),
    getCommunityTemplates(),
  ]);

  let all = [...official, ...community];

  // Filter by query string (case-insensitive match on name, description, stack, tags)
  if (query && query.trim()) {
    const lowerQuery = query.toLowerCase().trim();
    all = all.filter(t => {
      const haystack = [
        t.name,
        t.description,
        t.id,
        t.author,
        ...t.stack,
        ...t.tags,
      ].join(' ').toLowerCase();
      return haystack.includes(lowerQuery);
    });
  }

  // Filter by tags
  if (options?.tags && options.tags.length > 0) {
    const filterTags = options.tags.map(tag => tag.toLowerCase().trim());
    all = all.filter(t => {
      const templateTags = t.tags.map(tag => tag.toLowerCase());
      return filterTags.some(ft => templateTags.includes(ft));
    });
  }

  // Sort results
  const sort = options?.sort || 'downloads';
  switch (sort) {
    case 'downloads':
      all.sort((a, b) => b.downloads - a.downloads);
      break;
    case 'stars':
      all.sort((a, b) => b.stars - a.stars);
      break;
    case 'newest':
      // For MVP, sort alphabetically by id as we don't have publish dates
      all.sort((a, b) => a.id.localeCompare(b.id));
      break;
  }

  return {
    templates: all,
    total: all.length,
  };
}

/**
 * Validates that the directory at projectPath is a well-formed, publishable template.
 * Checks for required files, manifest validity, and structural issues.
 */
export function validateTemplate(projectPath: string): TemplateValidationResult {
  const errors: string[] = [];
  const resolvedPath = path.resolve(projectPath);

  // Check directory exists
  try {
    const stat = fs.statSync(resolvedPath);
    if (!stat.isDirectory()) {
      return { valid: false, errors: [`"${resolvedPath}" is not a directory.`] };
    }
  } catch {
    return { valid: false, errors: [`Directory "${resolvedPath}" does not exist.`] };
  }

  // Check required files
  for (const file of REQUIRED_FILES) {
    const filePath = path.join(resolvedPath, file);
    if (!fs.existsSync(filePath)) {
      errors.push(`Missing required file: ${file}`);
    }
  }

  // Warn about missing recommended files (non-blocking)
  for (const file of RECOMMENDED_FILES) {
    const filePath = path.join(resolvedPath, file);
    if (!fs.existsSync(filePath)) {
      errors.push(`Missing recommended file: ${file} (not required, but strongly recommended)`);
    }
  }

  // Validate forgekit.json contents
  const manifestPath = path.join(resolvedPath, 'forgekit.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const raw = fs.readFileSync(manifestPath, 'utf-8');
      let manifest: Record<string, unknown>;

      try {
        manifest = JSON.parse(raw);
      } catch {
        errors.push('forgekit.json contains invalid JSON.');
        return { valid: errors.length === 0, errors };
      }

      // Check required fields
      for (const field of REQUIRED_MANIFEST_FIELDS) {
        if (!manifest[field] || typeof manifest[field] !== 'string') {
          errors.push(`forgekit.json is missing required field: "${field}" (must be a non-empty string).`);
        }
      }

      // Validate id format
      if (typeof manifest['id'] === 'string') {
        if (!/^[a-z0-9][a-z0-9-]*$/.test(manifest['id'])) {
          errors.push(
            `forgekit.json "id" must be lowercase alphanumeric with hyphens, starting with a letter or digit.`
          );
        }
      }

      // Validate version format (loose semver check)
      if (typeof manifest['version'] === 'string') {
        if (!/^\d+\.\d+\.\d+/.test(manifest['version'])) {
          errors.push(`forgekit.json "version" must follow semver format (e.g., "1.0.0").`);
        }
      }

      // Validate files array if present
      if (manifest['files'] !== undefined) {
        if (!Array.isArray(manifest['files'])) {
          errors.push('forgekit.json "files" must be an array.');
        } else {
          for (let i = 0; i < manifest['files'].length; i++) {
            const file = manifest['files'][i] as Record<string, unknown>;
            if (!file || typeof file !== 'object') {
              errors.push(`forgekit.json files[${i}] must be an object.`);
              continue;
            }
            if (typeof file['src'] !== 'string' || typeof file['dest'] !== 'string') {
              errors.push(`forgekit.json files[${i}] must have "src" and "dest" string fields.`);
            }
            // Path traversal check
            if (typeof file['src'] === 'string') {
              const resolvedSrc = path.resolve(resolvedPath, file['src']);
              if (!resolvedSrc.startsWith(resolvedPath + path.sep) && resolvedSrc !== resolvedPath) {
                errors.push(
                  `forgekit.json files[${i}].src "${file['src']}" would escape the template directory. ` +
                  `This is a security risk and is not allowed.`
                );
              }
            }
          }
        }
      }

      // Validate stack if present
      if (manifest['stack'] !== undefined) {
        if (!Array.isArray(manifest['stack'])) {
          errors.push('forgekit.json "stack" must be an array of strings.');
        }
      }

      // Validate tags if present
      if (manifest['tags'] !== undefined) {
        if (!Array.isArray(manifest['tags'])) {
          errors.push('forgekit.json "tags" must be an array of strings.');
        }
      }
    } catch {
      errors.push('Failed to read forgekit.json.');
    }
  }

  // Only count hard errors (not "recommended" warnings) for validity
  const hardErrors = errors.filter(e => !e.includes('not required, but strongly recommended'));
  return {
    valid: hardErrors.length === 0,
    errors,
  };
}

/**
 * Generates a forgekit.json manifest from the current project directory.
 * Inspects package.json and directory structure to infer template metadata.
 */
export function generateManifest(projectPath: string): Record<string, unknown> {
  const resolvedPath = path.resolve(projectPath);

  let name = path.basename(resolvedPath);
  let description = '';
  let version = '1.0.0';
  let author = '';
  let repository = '';
  const stack: string[] = [];
  const tags: string[] = [];

  // Try to read package.json for metadata
  const pkgJsonPath = path.join(resolvedPath, 'package.json');
  if (fs.existsSync(pkgJsonPath)) {
    try {
      const raw = fs.readFileSync(pkgJsonPath, 'utf-8');
      const pkg = JSON.parse(raw);
      if (typeof pkg.name === 'string') name = pkg.name;
      if (typeof pkg.description === 'string') description = pkg.description;
      if (typeof pkg.version === 'string') version = pkg.version;
      if (typeof pkg.author === 'string') author = pkg.author;
      if (typeof pkg.author === 'object' && pkg.author?.name) author = pkg.author.name;
      if (typeof pkg.repository === 'string') repository = pkg.repository;
      if (typeof pkg.repository === 'object' && pkg.repository?.url) {
        repository = pkg.repository.url.replace(/^git\+/, '').replace(/\.git$/, '');
      }

      // Infer stack from dependencies
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['react']) stack.push('React');
      if (deps['next']) stack.push('Next.js');
      if (deps['vue']) stack.push('Vue');
      if (deps['express']) stack.push('Express');
      if (deps['fastify']) stack.push('Fastify');
      if (deps['typescript']) stack.push('TypeScript');
      if (deps['tailwindcss']) stack.push('Tailwind CSS');
      if (deps['prisma'] || deps['@prisma/client']) stack.push('Prisma');
    } catch {
      // Ignore parse errors, proceed with defaults
    }
  }

  // Detect Python projects
  const requirementsPath = path.join(resolvedPath, 'requirements.txt');
  const pyprojectPath = path.join(resolvedPath, 'pyproject.toml');
  if (fs.existsSync(requirementsPath) || fs.existsSync(pyprojectPath)) {
    stack.push('Python');
    tags.push('python');
  }

  // Detect Go projects
  const goModPath = path.join(resolvedPath, 'go.mod');
  if (fs.existsSync(goModPath)) {
    stack.push('Go');
    tags.push('go');
  }

  // Detect Docker
  const dockerfilePath = path.join(resolvedPath, 'Dockerfile');
  if (fs.existsSync(dockerfilePath)) {
    tags.push('docker');
  }

  // Generate a safe id from the name
  const id = name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || 'my-template';

  // Scan for template files (top-level, non-hidden, non-node_modules)
  const files: Array<{ src: string; dest: string }> = [];
  try {
    const entries = fs.readdirSync(resolvedPath);
    for (const entry of entries) {
      if (entry.startsWith('.') || entry === 'node_modules' || entry === 'forgekit.json') {
        continue;
      }
      files.push({ src: entry, dest: entry });
    }
  } catch {
    // Ignore read errors
  }

  return {
    id,
    name,
    description: description || `A ForgeKit template for ${name}`,
    version,
    author,
    repository,
    stack,
    tags,
    files,
  };
}
