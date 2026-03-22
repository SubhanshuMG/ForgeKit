// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { spawnSync } from 'child_process';
import { Template, TemplateFile } from '../types';
import { validateExternalTemplateId } from './security';

interface ExternalTemplateManifest {
  id: string;
  name: string;
  description: string;
  language: string;
  files: TemplateFile[];
}

interface ParsedGitHub {
  owner: string;
  repo: string;
  branch: string;
}

interface ParsedNpm {
  packageName: string;
}

function parseGitHubId(id: string): ParsedGitHub {
  // id format: "owner/repo" or "owner/repo#branch"
  const rest = id.replace(/^github:/, '');
  const [ownerRepo, branch] = rest.split('#');
  const [owner, repo] = ownerRepo.split('/');
  return { owner, repo, branch: branch || 'main' };
}

function parseNpmId(id: string): ParsedNpm {
  const packageName = id.replace(/^npm:/, '');
  return { packageName };
}

function httpsGet(url: string, headers: Record<string, string>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const makeRequest = (requestUrl: string, redirectCount: number): void => {
      if (redirectCount > 5) {
        reject(new Error('Too many redirects'));
        return;
      }

      const parsedUrl = new URL(requestUrl);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;

      const req = protocol.get(
        requestUrl,
        {
          headers: {
            'User-Agent': 'forgekit-cli/0.1.0',
            ...headers,
          },
        },
        (res) => {
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            makeRequest(res.headers.location, redirectCount + 1);
            return;
          }

          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode} fetching ${requestUrl}`));
            return;
          }

          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        }
      );

      req.on('error', reject);
    };

    makeRequest(url, 0);
  });
}

function createTempDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), `forgekit-${prefix}-`));
}

function loadManifest(dir: string): ExternalTemplateManifest {
  const manifestPath = path.join(dir, 'forgekit.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(
      `Template is missing forgekit.json manifest. ` +
      `External templates must include a forgekit.json file at the repository root.`
    );
  }
  const raw = fs.readFileSync(manifestPath, 'utf-8');
  const manifest = JSON.parse(raw) as ExternalTemplateManifest;

  if (!manifest.id || !manifest.name || !manifest.description || !manifest.files) {
    throw new Error(
      'Invalid forgekit.json: must include id, name, description, and files fields.'
    );
  }
  return manifest;
}

function manifestToTemplate(manifest: ExternalTemplateManifest): Template {
  return {
    id: manifest.id,
    name: manifest.name,
    description: manifest.description,
    stack: [manifest.language],
    version: '0.0.0',
    author: 'external',
    files: manifest.files,
    hooks: [],
    variables: [],
  };
}

async function loadGitHubTemplate(id: string): Promise<Template> {
  const { owner, repo, branch } = parseGitHubId(id);
  const url = `https://api.github.com/repos/${owner}/${repo}/tarball/${branch}`;

  let tarball: Buffer;
  try {
    tarball = await httpsGet(url, { Accept: 'application/vnd.github+json' });
  } catch (err) {
    throw new Error(
      `Failed to download template from GitHub (${owner}/${repo}#${branch}): ${(err as Error).message}`
    );
  }

  const tmpDir = createTempDir('gh');
  const tarPath = path.join(tmpDir, 'template.tar.gz');
  fs.writeFileSync(tarPath, tarball);

  const extractDir = path.join(tmpDir, 'extracted');
  fs.mkdirSync(extractDir, { recursive: true });

  const result = spawnSync('tar', ['xzf', tarPath, '-C', extractDir, '--strip-components=1'], {
    encoding: 'utf-8',
    timeout: 30000,
  });

  if (result.status !== 0) {
    throw new Error(`Failed to extract GitHub template tarball: ${result.stderr || 'unknown error'}`);
  }

  const manifest = loadManifest(extractDir);
  return manifestToTemplate(manifest);
}

async function loadNpmTemplate(id: string): Promise<Template> {
  const { packageName } = parseNpmId(id);

  // Verify package exists
  const dryRun = spawnSync('npm', ['pack', packageName, '--dry-run', '--json'], {
    encoding: 'utf-8',
    timeout: 30000,
  });

  if (dryRun.status !== 0) {
    throw new Error(`npm package "${packageName}" not found or not accessible.`);
  }

  const tmpDir = createTempDir('npm');

  const packResult = spawnSync('npm', ['pack', packageName], {
    encoding: 'utf-8',
    cwd: tmpDir,
    timeout: 30000,
  });

  if (packResult.status !== 0) {
    throw new Error(`Failed to download npm package "${packageName}": ${packResult.stderr || 'unknown error'}`);
  }

  const tgzFile = packResult.stdout.trim().split('\n').pop();
  if (!tgzFile) {
    throw new Error(`Failed to determine downloaded package filename for "${packageName}".`);
  }

  const tgzPath = path.join(tmpDir, tgzFile);
  const extractDir = path.join(tmpDir, 'extracted');
  fs.mkdirSync(extractDir, { recursive: true });

  const tarResult = spawnSync('tar', ['xzf', tgzPath, '-C', extractDir], {
    encoding: 'utf-8',
    timeout: 30000,
  });

  if (tarResult.status !== 0) {
    throw new Error(`Failed to extract npm package: ${tarResult.stderr || 'unknown error'}`);
  }

  // npm pack extracts into a "package/" subdirectory
  const packageDir = path.join(extractDir, 'package');
  const manifest = loadManifest(packageDir);
  return manifestToTemplate(manifest);
}

export async function loadExternalTemplate(templateId: string): Promise<Template> {
  if (!validateExternalTemplateId(templateId)) {
    throw new Error(`Invalid external template ID: "${templateId}".`);
  }

  if (templateId.startsWith('github:')) {
    return loadGitHubTemplate(templateId);
  }

  if (templateId.startsWith('npm:')) {
    return loadNpmTemplate(templateId);
  }

  throw new Error(`Unsupported template prefix in "${templateId}". Use github: or npm: prefixes.`);
}

export function isExternalTemplate(templateId: string): boolean {
  return templateId.startsWith('github:') || templateId.startsWith('npm:');
}
