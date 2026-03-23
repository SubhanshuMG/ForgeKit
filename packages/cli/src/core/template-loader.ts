// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import * as https from 'https';
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

const MAX_DOWNLOAD_BYTES = 100 * 1024 * 1024; // 100 MB hard cap

// Allowed hostnames for redirect targets. Prevents SSRF by ensuring
// redirects from api.github.com stay within GitHub's infrastructure
// and redirects from registry.npmjs.org stay within npm's CDN.
const ALLOWED_REDIRECT_HOSTS = new Set([
  'api.github.com',
  'codeload.github.com',
  'github.com',
  'objects.githubusercontent.com',
  'registry.npmjs.org',
  'registry.yarnpkg.com',
]);

function httpsGet(url: string, headers: Record<string, string>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const makeRequest = (requestUrl: string, redirectCount: number): void => {
      if (redirectCount > 5) {
        reject(new Error('Too many redirects'));
        return;
      }

      const parsedUrl = new URL(requestUrl);
      // Never follow redirects to plain HTTP — prevents MITM downgrade attacks
      if (parsedUrl.protocol !== 'https:') {
        reject(new Error(`Insecure redirect to non-HTTPS URL rejected: ${requestUrl}`));
        return;
      }

      // SSRF protection: only allow redirects to known-safe hostnames.
      // Prevents a compromised or malicious redirect from reaching internal
      // network services (e.g., cloud metadata endpoints).
      if (redirectCount > 0 && !ALLOWED_REDIRECT_HOSTS.has(parsedUrl.hostname)) {
        reject(new Error(
          `Security: redirect to untrusted host "${parsedUrl.hostname}" rejected. ` +
          `Only redirects to GitHub and npm infrastructure are allowed.`
        ));
        return;
      }

      const req = https.get(
        requestUrl,
        {
          headers: {
            'User-Agent': 'forgekit-cli/0.4.0',
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
          let totalBytes = 0;
          res.on('data', (chunk: Buffer) => {
            totalBytes += chunk.length;
            if (totalBytes > MAX_DOWNLOAD_BYTES) {
              req.destroy();
              reject(new Error(`Download exceeded ${MAX_DOWNLOAD_BYTES / 1024 / 1024} MB limit`));
              return;
            }
            chunks.push(chunk);
          });
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

/**
 * Recursively walks a directory and throws if any symlinks are found.
 * Prevents symlink traversal attacks from malicious tarballs where a
 * symlink targets a path outside the extraction directory.
 */
function rejectSymlinks(dir: string): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(
        `Security: extracted template contains a symlink "${fullPath}". ` +
        `Symlinks in templates are not allowed as they can escape the extraction directory.`
      );
    }
    if (entry.isDirectory()) {
      rejectSymlinks(fullPath);
    }
  }
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

  // Validate that all file src paths stay within the extraction directory.
  // Prevents a malicious forgekit.json from reading files outside the tarball
  // (e.g. file.src = "../../etc/passwd").
  const resolvedDir = path.resolve(dir);
  for (const file of manifest.files) {
    const resolvedSrc = path.resolve(dir, file.src);
    if (!resolvedSrc.startsWith(resolvedDir + path.sep) && resolvedSrc !== resolvedDir) {
      throw new Error(
        `Security: template manifest file src "${file.src}" would escape the extraction directory. Aborting.`
      );
    }
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
  try {
    const tarPath = path.join(tmpDir, 'template.tar.gz');
    fs.writeFileSync(tarPath, tarball);

    const extractDir = path.join(tmpDir, 'extracted');
    fs.mkdirSync(extractDir, { recursive: true });

    // Security: block symlinks in tarballs to prevent symlink traversal attacks
    // where a malicious tarball places a symlink pointing outside the extraction
    // directory and then writes through it. --no-same-permissions ensures files
    // are created with safe default permissions.
    const result = spawnSync('tar', [
      'xzf', tarPath,
      '-C', extractDir,
      '--strip-components=1',
      '--no-same-permissions',
    ], {
      encoding: 'utf-8',
      timeout: 30000,
    });

    if (result.status !== 0) {
      throw new Error(`Failed to extract GitHub template tarball: ${result.stderr || 'unknown error'}`);
    }

    // After extraction, verify no symlinks exist in the extracted directory.
    // Symlinks in user-supplied tarballs are a classic traversal vector.
    // This MUST run before loadManifest to prevent symlink-based file reads.
    rejectSymlinks(extractDir);

    const manifest = loadManifest(extractDir);
    return manifestToTemplate(manifest);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
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
  try {
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

    const tarResult = spawnSync('tar', [
      'xzf', tgzPath,
      '-C', extractDir,
      '--no-same-permissions',
    ], {
      encoding: 'utf-8',
      timeout: 30000,
    });

    if (tarResult.status !== 0) {
      throw new Error(`Failed to extract npm package: ${tarResult.stderr || 'unknown error'}`);
    }

    // After extraction, verify no symlinks exist in the extracted directory.
    // This MUST run before loadManifest to prevent symlink-based file reads.
    rejectSymlinks(extractDir);

    // npm pack extracts into a "package/" subdirectory
    const packageDir = path.join(extractDir, 'package');
    const manifest = loadManifest(packageDir);
    return manifestToTemplate(manifest);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
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
