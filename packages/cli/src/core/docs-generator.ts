// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';
import { ProjectAnalysis } from '../types';

export function analyzeProject(projectPath: string): ProjectAnalysis {
  const analysis: ProjectAnalysis = {
    name: path.basename(projectPath),
    description: '',
    packageManager: 'unknown',
    scripts: {},
    dependencies: [],
    devDependencies: [],
    hasTypeScript: false,
    hasDocker: false,
    hasCI: false,
    entryPoints: [],
    directories: [],
  };

  // Read package.json
  const pkgPath = path.join(projectPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      analysis.name = pkg.name || analysis.name;
      analysis.description = pkg.description || '';
      analysis.scripts = pkg.scripts || {};
      analysis.dependencies = Object.keys(pkg.dependencies || {});
      analysis.devDependencies = Object.keys(pkg.devDependencies || {});
      analysis.packageManager = 'npm';
    } catch { /* ignore parse errors */ }
  }

  // Detect package manager
  if (fs.existsSync(path.join(projectPath, 'pnpm-lock.yaml'))) analysis.packageManager = 'pnpm';
  else if (fs.existsSync(path.join(projectPath, 'yarn.lock'))) analysis.packageManager = 'yarn';
  else if (fs.existsSync(path.join(projectPath, 'Pipfile'))) analysis.packageManager = 'pip';

  // Detect TypeScript
  analysis.hasTypeScript = fs.existsSync(path.join(projectPath, 'tsconfig.json'));

  // Detect Docker
  analysis.hasDocker = fs.existsSync(path.join(projectPath, 'Dockerfile')) ||
    fs.existsSync(path.join(projectPath, 'docker-compose.yml'));

  // Detect CI
  analysis.hasCI = fs.existsSync(path.join(projectPath, '.github', 'workflows'));

  // Find entry points
  const entryFiles = ['src/index.ts', 'src/index.js', 'src/main.ts', 'src/main.js', 'src/app.ts', 'src/app.js', 'index.ts', 'index.js', 'app.ts', 'app.js', 'main.py', 'app.py', 'main.go'];
  analysis.entryPoints = entryFiles.filter(f => fs.existsSync(path.join(projectPath, f)));

  // List top-level directories
  try {
    analysis.directories = fs.readdirSync(projectPath)
      .filter(f => {
        const fullPath = path.join(projectPath, f);
        return fs.statSync(fullPath).isDirectory() && !f.startsWith('.') && f !== 'node_modules';
      });
  } catch { /* ignore */ }

  return analysis;
}

function detectFramework(analysis: ProjectAnalysis): string {
  const allDeps = [...analysis.dependencies, ...analysis.devDependencies];
  if (allDeps.includes('next')) return 'Next.js';
  if (allDeps.includes('react')) return 'React';
  if (allDeps.includes('vue')) return 'Vue.js';
  if (allDeps.includes('express')) return 'Express';
  if (allDeps.includes('fastify')) return 'Fastify';
  if (allDeps.includes('nestjs')) return 'NestJS';
  if (analysis.packageManager === 'pip') return 'Python';
  return '';
}

function generateBadges(analysis: ProjectAnalysis): string {
  const badges: string[] = [];
  const framework = detectFramework(analysis);

  if (analysis.hasTypeScript) {
    badges.push('![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white)');
  }
  if (framework) {
    badges.push(`![${framework}](https://img.shields.io/badge/${encodeURIComponent(framework)}-black?logo=${framework.toLowerCase().replace('.', '')})`);
  }
  if (analysis.hasDocker) {
    badges.push('![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)');
  }

  return badges.join(' ');
}

function generateTree(dirs: string[]): string {
  if (dirs.length === 0) return '';
  const lines = dirs.map((d, i) => {
    const prefix = i === dirs.length - 1 ? '\u2514\u2500\u2500' : '\u251c\u2500\u2500';
    return `${prefix} ${d}/`;
  });
  return '```\n' + lines.join('\n') + '\n```';
}

export function generateReadme(analysis: ProjectAnalysis): string {
  const sections: string[] = [];

  // Title
  sections.push(`# ${analysis.name}\n`);

  // Description
  if (analysis.description) {
    sections.push(`${analysis.description}\n`);
  }

  // Badges
  const badges = generateBadges(analysis);
  if (badges) sections.push(`${badges}\n`);

  // Prerequisites
  sections.push('## Prerequisites\n');
  if (analysis.packageManager === 'npm' || analysis.packageManager === 'yarn' || analysis.packageManager === 'pnpm') {
    sections.push('- Node.js >= 18');
    sections.push(`- ${analysis.packageManager}\n`);
  } else if (analysis.packageManager === 'pip') {
    sections.push('- Python >= 3.8');
    sections.push('- pip\n');
  }

  // Installation
  sections.push('## Installation\n');
  sections.push('```bash');
  if (analysis.packageManager === 'npm') sections.push('npm install');
  else if (analysis.packageManager === 'yarn') sections.push('yarn install');
  else if (analysis.packageManager === 'pnpm') sections.push('pnpm install');
  else if (analysis.packageManager === 'pip') sections.push('pip install -r requirements.txt');
  sections.push('```\n');

  // Scripts
  if (Object.keys(analysis.scripts).length > 0) {
    sections.push('## Available Scripts\n');
    sections.push('| Script | Command |');
    sections.push('|--------|---------|');
    for (const [name, cmd] of Object.entries(analysis.scripts)) {
      sections.push(`| \`${analysis.packageManager} run ${name}\` | ${cmd} |`);
    }
    sections.push('');
  }

  // Project structure
  if (analysis.directories.length > 0) {
    sections.push('## Project Structure\n');
    sections.push(generateTree(analysis.directories));
    sections.push('');
  }

  // Environment variables
  const envExamplePath = path.join(process.cwd(), '.env.example');
  if (fs.existsSync(envExamplePath)) {
    sections.push('## Environment Variables\n');
    sections.push('Copy `.env.example` to `.env` and fill in the values:\n');
    sections.push('```bash');
    sections.push('cp .env.example .env');
    sections.push('```\n');
  }

  // License
  sections.push('## License\n');
  sections.push('See [LICENSE](LICENSE) for details.\n');

  // Generated footer
  sections.push('---\n');
  sections.push('*Generated with [ForgeKit](https://github.com/SubhanshuMG/ForgeKit)*\n');

  return sections.join('\n');
}
