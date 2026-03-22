// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import * as path from 'path';

/**
 * Validates that a resolved path stays within the allowed root directory.
 * Prevents directory traversal attacks in template file writing.
 */
export function validatePathContainment(
  targetRoot: string,
  filePath: string
): boolean {
  const resolvedRoot = path.resolve(targetRoot);
  const resolvedFile = path.resolve(targetRoot, filePath);
  return resolvedFile.startsWith(resolvedRoot + path.sep) || resolvedFile === resolvedRoot;
}

/**
 * Sanitizes a project name to be safe for use as a directory name.
 */
export function sanitizeProjectName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
    .slice(0, 214); // npm package name max length
}

/**
 * Validates that a hook command is in the allowed list.
 * Prevents arbitrary code execution from malicious templates.
 */
const ALLOWED_HOOK_COMMANDS = ['npm', 'npx', 'yarn', 'pnpm', 'pip', 'pip3', 'python', 'python3'];

export function validateHookCommand(command: string): boolean {
  return ALLOWED_HOOK_COMMANDS.includes(command);
}

/**
 * Validates a template ID is safe (no path traversal).
 */
export function validateTemplateId(id: string): boolean {
  return /^[a-z0-9-_]+$/.test(id) && !id.includes('..');
}
