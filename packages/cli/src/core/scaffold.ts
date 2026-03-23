// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import { spawnSync } from 'child_process';
import * as path from 'path';
import { ScaffoldOptions, ScaffoldResult, Template } from '../types';
import { getTemplate } from './template-resolver';
import { writeTemplateFiles } from './file-writer';
import { validateHookCommand } from './security';
import { trackEvent } from './telemetry';

export async function scaffold(options: ScaffoldOptions): Promise<ScaffoldResult> {
  const errors: string[] = [];
  let template: Template;

  try {
    template = await getTemplate(options.templateId);
  } catch (err) {
    return {
      success: false,
      projectPath: '',
      filesCreated: [],
      errors: [(err as Error).message],
      nextSteps: [],
    };
  }

  const projectPath = path.resolve(options.outputDir, options.projectName);

  let filesCreated: string[] = [];
  try {
    filesCreated = await writeTemplateFiles(template, options);
  } catch (err) {
    return {
      success: false,
      projectPath,
      filesCreated,
      errors: [(err as Error).message],
      nextSteps: [],
    };
  }

  // Run post-scaffold hooks (e.g. npm install)
  if (!options.skipInstall && !options.dryRun) {
    for (const hook of template.hooks) {
      if (hook.type !== 'post-scaffold') continue;
      if (!validateHookCommand(hook.command)) {
        errors.push(`Skipped unsafe hook command: ${hook.command}`);
        continue;
      }
      try {
        const result = spawnSync(hook.command, hook.args, { cwd: projectPath, stdio: 'inherit', shell: false });
        if (result.status !== 0) throw new Error(`exited with code ${result.status}`);
      } catch (err) {
        errors.push(`Hook "${hook.command} ${hook.args.join(' ')}" failed: ${(err as Error).message}`);
      }
    }
  }

  const nextSteps = buildNextSteps(template, options.projectName);

  const success = errors.length === 0;
  trackEvent('scaffold', { template: options.templateId, success });

  return {
    success,
    projectPath,
    filesCreated,
    errors,
    nextSteps,
  };
}

function buildNextSteps(template: Template, projectName: string): string[] {
  const steps: string[] = [`cd ${projectName}`];
  switch (template.id) {
    case 'web-app':
      steps.push('npm run dev', 'Open http://localhost:3000');
      break;
    case 'api-service':
      steps.push('pip install -r requirements.txt', 'uvicorn main:app --reload', 'Open http://localhost:8000/docs');
      break;
    case 'ml-pipeline':
      steps.push('pip install -r requirements.txt', 'jupyter lab', 'Open notebooks/01_explore.ipynb');
      break;
    default:
      steps.push('Follow the README in your new project');
  }
  return steps;
}
