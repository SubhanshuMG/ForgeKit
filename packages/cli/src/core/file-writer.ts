// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import * as path from 'path';
import * as fs from 'fs-extra';
import Handlebars from 'handlebars';
import { Template, ScaffoldOptions } from '../types';
import { validatePathContainment } from './security';
import { getTemplateDir } from './template-resolver';

export async function writeTemplateFiles(
  template: Template,
  options: ScaffoldOptions
): Promise<string[]> {
  const templateDir = getTemplateDir(template.id);
  const outputRoot = path.resolve(options.outputDir, options.projectName);
  const filesCreated: string[] = [];

  if (!options.dryRun) {
    await fs.ensureDir(outputRoot);
  }

  const context = {
    name: options.projectName,
    ...options.variables,
  };

  for (const file of template.files) {
    // Skip conditional files where condition variable is falsy
    if (file.condition && !context[file.condition as keyof typeof context]) {
      continue;
    }

    // Render destination path (supports {{name}} tokens)
    const destTemplate = Handlebars.compile(file.dest);
    const destRelative = destTemplate(context);

    // Security: validate path stays within output root
    if (!validatePathContainment(outputRoot, destRelative)) {
      throw new Error(`Security: Template file "${file.dest}" would escape the output directory. Aborting.`);
    }

    if (options.dryRun) {
      filesCreated.push(destRelative);
      continue;
    }

    const srcPath = path.join(templateDir, file.src);
    const destPath = path.join(outputRoot, destRelative);

    if (!await fs.pathExists(srcPath)) {
      throw new Error(`Template source file not found: ${srcPath}`);
    }

    const rawContent = await fs.readFile(srcPath, 'utf-8');
    const rendered = Handlebars.compile(rawContent)(context);

    await fs.ensureDir(path.dirname(destPath));
    // Output path is validated above via validatePathContainment and is
    // user-specified (not an OS temp file) — CodeQL js/insecure-temporary-file
    // does not apply here.
    await fs.writeFile(destPath, rendered, 'utf-8'); // lgtm[js/insecure-temporary-file]
    filesCreated.push(destRelative);
  }

  return filesCreated;
}
