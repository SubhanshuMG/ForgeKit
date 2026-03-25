// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';
import { HealthCheck, HealthReport } from '../types';

export async function calculateHealth(projectPath: string): Promise<HealthReport> {
  const checks: HealthCheck[] = [];

  // ── Security (25 points) ────────────────────────────────────────────────

  checks.push(checkFileExists(projectPath, '.gitignore', 'security', 5, 'Add a .gitignore file to prevent committing sensitive files'));
  checks.push(checkLockfile(projectPath));
  checks.push(checkNoSecrets(projectPath));
  checks.push(checkDepsAudited(projectPath));

  // ── Quality (25 points) ─────────────────────────────────────────────────

  checks.push(checkLinterConfig(projectPath));
  checks.push(checkTypeChecking(projectPath));
  checks.push(checkTodoCount(projectPath));
  checks.push(checkPackageJsonFields(projectPath));
  checks.push(checkSourceStructure(projectPath));

  // ── Testing (20 points) ─────────────────────────────────────────────────

  checks.push(checkTestDirectory(projectPath));
  checks.push(checkTestScript(projectPath));
  checks.push(checkTestConfig(projectPath));
  checks.push(checkTestFiles(projectPath));

  // ── Documentation (15 points) ───────────────────────────────────────────

  checks.push(checkReadme(projectPath));
  checks.push(checkFileExists(projectPath, 'CONTRIBUTING.md', 'documentation', 3, 'Add a CONTRIBUTING.md to guide contributors'));
  checks.push(checkFileExists(projectPath, 'LICENSE', 'documentation', 4, 'Add a LICENSE file'));
  checks.push(checkFileExists(projectPath, 'CHANGELOG.md', 'documentation', 3, 'Add a CHANGELOG.md to track changes'));

  // ── DevOps (15 points) ──────────────────────────────────────────────────

  checks.push(checkCI(projectPath));
  checks.push(checkDocker(projectPath));
  checks.push(checkDeployConfig(projectPath));
  checks.push(checkFileExists(projectPath, '.editorconfig', 'devops', 3, 'Add .editorconfig for consistent formatting'));

  // Calculate scores
  const totalScore = checks.reduce((sum, c) => sum + c.score, 0);
  const maxScore = checks.reduce((sum, c) => sum + c.weight, 0);
  const normalizedScore = Math.round((totalScore / maxScore) * 100);

  const categoryScores: HealthReport['categoryScores'] = {};
  for (const check of checks) {
    if (!categoryScores[check.category]) {
      categoryScores[check.category] = { earned: 0, max: 0, percentage: 0 };
    }
    categoryScores[check.category].earned += check.score;
    categoryScores[check.category].max += check.weight;
  }
  for (const cat of Object.values(categoryScores)) {
    cat.percentage = cat.max > 0 ? Math.round((cat.earned / cat.max) * 100) : 0;
  }

  return {
    score: normalizedScore,
    grade: getGrade(normalizedScore),
    checks,
    categoryScores,
  };
}

function getGrade(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function checkFileExists(
  projectPath: string,
  filename: string,
  category: HealthCheck['category'],
  weight: number,
  suggestion: string
): HealthCheck {
  const exists = fs.existsSync(path.join(projectPath, filename));
  return {
    category,
    name: `Has ${filename}`,
    passed: exists,
    score: exists ? weight : 0,
    weight,
    suggestion: exists ? undefined : suggestion,
  };
}

function checkLockfile(projectPath: string): HealthCheck {
  const lockfiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'Pipfile.lock', 'poetry.lock'];
  const found = lockfiles.some(f => fs.existsSync(path.join(projectPath, f)));
  return {
    category: 'security',
    name: 'Has lockfile',
    passed: found,
    score: found ? 5 : 0,
    weight: 5,
    suggestion: found ? undefined : 'Run npm install to generate a lockfile for reproducible builds',
  };
}

function checkNoSecrets(projectPath: string): HealthCheck {
  const patterns = ['API_KEY=', 'SECRET_KEY=', 'PASSWORD=', 'PRIVATE_KEY=', 'ACCESS_TOKEN='];
  let secretsFound = 0;

  const srcDirs = ['src', 'lib', 'app', '.'];
  for (const dir of srcDirs) {
    const fullDir = path.join(projectPath, dir);
    if (!fs.existsSync(fullDir)) continue;
    try {
      const result = spawnSync('grep', ['-rl', '--include=*.ts', '--include=*.js', '--include=*.py', '--include=*.go', ...patterns.flatMap(p => ['-e', p]), fullDir], {
        encoding: 'utf-8',
        timeout: 5000,
      });
      if (result.stdout) {
        secretsFound += result.stdout.trim().split('\n').filter(Boolean).length;
      }
    } catch {
      // grep not available or failed
    }
    if (secretsFound > 0) break;
  }

  const passed = secretsFound === 0;
  return {
    category: 'security',
    name: 'No hardcoded secrets',
    passed,
    score: passed ? 8 : 0,
    weight: 8,
    suggestion: passed ? undefined : `Found potential secrets in ${secretsFound} file(s). Move them to environment variables`,
  };
}

function checkDepsAudited(projectPath: string): HealthCheck {
  if (!fs.existsSync(path.join(projectPath, 'package.json'))) {
    return { category: 'security', name: 'Dependencies audited', passed: true, score: 7, weight: 7 };
  }
  try {
    const result = spawnSync('npm', ['audit', '--json', '--audit-level=critical'], {
      cwd: projectPath, encoding: 'utf-8', timeout: 15000,
    });
    const data = JSON.parse(result.stdout || '{}');
    const criticals = data.metadata?.vulnerabilities?.critical || 0;
    const passed = criticals === 0;
    return {
      category: 'security',
      name: 'No critical vulnerabilities',
      passed,
      score: passed ? 7 : 0,
      weight: 7,
      suggestion: passed ? undefined : `${criticals} critical vulnerability(ies) found. Run npm audit fix`,
    };
  } catch {
    return { category: 'security', name: 'No critical vulnerabilities', passed: true, score: 7, weight: 7 };
  }
}

function checkLinterConfig(projectPath: string): HealthCheck {
  const configs = ['.eslintrc', '.eslintrc.js', '.eslintrc.json', '.eslintrc.yml', 'eslint.config.js', 'eslint.config.mjs', '.prettierrc', '.prettierrc.json', 'biome.json'];
  const found = configs.some(f => fs.existsSync(path.join(projectPath, f)));
  return {
    category: 'quality',
    name: 'Has linter config',
    passed: found,
    score: found ? 5 : 0,
    weight: 5,
    suggestion: found ? undefined : 'Add ESLint or Prettier for consistent code style',
  };
}

function checkTypeChecking(projectPath: string): HealthCheck {
  const configs = ['tsconfig.json', 'tsconfig.base.json', 'jsconfig.json', 'pyproject.toml'];
  const found = configs.some(f => fs.existsSync(path.join(projectPath, f)));
  return {
    category: 'quality',
    name: 'Has type checking',
    passed: found,
    score: found ? 5 : 0,
    weight: 5,
    suggestion: found ? undefined : 'Add TypeScript or type checking for safer code',
  };
}

function checkTodoCount(projectPath: string): HealthCheck {
  try {
    const result = spawnSync('grep', ['-rl', '--include=*.ts', '--include=*.js', '--include=*.py', '-e', 'TODO', '-e', 'FIXME', '-e', 'HACK', path.join(projectPath, 'src')], {
      encoding: 'utf-8', timeout: 5000,
    });
    const count = result.stdout ? result.stdout.trim().split('\n').filter(Boolean).length : 0;
    const passed = count <= 10;
    return {
      category: 'quality',
      name: 'Low TODO/FIXME count',
      passed,
      score: passed ? 5 : Math.max(0, 5 - Math.floor(count / 5)),
      weight: 5,
      suggestion: passed ? undefined : `${count} files contain TODO/FIXME/HACK comments. Consider resolving them`,
    };
  } catch {
    return { category: 'quality', name: 'Low TODO/FIXME count', passed: true, score: 5, weight: 5 };
  }
}

function checkPackageJsonFields(projectPath: string): HealthCheck {
  const pkgPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    return { category: 'quality', name: 'Package.json fields', passed: false, score: 0, weight: 5, suggestion: 'Add a package.json with name, version, description, and license' };
  }
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const fields = ['name', 'version', 'description', 'license'];
    const present = fields.filter(f => pkg[f]);
    const passed = present.length === fields.length;
    return {
      category: 'quality',
      name: 'Package.json complete',
      passed,
      score: Math.round((present.length / fields.length) * 5),
      weight: 5,
      suggestion: passed ? undefined : `package.json missing: ${fields.filter(f => !pkg[f]).join(', ')}`,
    };
  } catch {
    return { category: 'quality', name: 'Package.json complete', passed: false, score: 0, weight: 5 };
  }
}

function checkSourceStructure(projectPath: string): HealthCheck {
  const dirs = ['src', 'lib', 'app', 'packages'];
  const found = dirs.some(d => fs.existsSync(path.join(projectPath, d)));
  return {
    category: 'quality',
    name: 'Organized source structure',
    passed: found,
    score: found ? 5 : 0,
    weight: 5,
    suggestion: found ? undefined : 'Organize code in a src/ or lib/ directory',
  };
}

function checkTestDirectory(projectPath: string): HealthCheck {
  const dirs = ['test', 'tests', '__tests__', 'spec', 'src/__tests__'];
  const found = dirs.some(d => fs.existsSync(path.join(projectPath, d)));
  return {
    category: 'testing',
    name: 'Has test directory',
    passed: found,
    score: found ? 5 : 0,
    weight: 5,
    suggestion: found ? undefined : 'Create a test directory (test/, __tests__/, etc.)',
  };
}

function checkTestScript(projectPath: string): HealthCheck {
  const pkgPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    return { category: 'testing', name: 'Has test script', passed: false, score: 0, weight: 5, suggestion: 'Add a "test" script to package.json' };
  }
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const found = Boolean(pkg.scripts?.test && pkg.scripts.test !== 'echo "Error: no test specified" && exit 1');
    return {
      category: 'testing',
      name: 'Has test script',
      passed: found,
      score: found ? 5 : 0,
      weight: 5,
      suggestion: found ? undefined : 'Add a real "test" script to package.json',
    };
  } catch {
    return { category: 'testing', name: 'Has test script', passed: false, score: 0, weight: 5 };
  }
}

function checkTestConfig(projectPath: string): HealthCheck {
  const configs = ['jest.config.js', 'jest.config.ts', 'jest.config.json', 'vitest.config.ts', 'vitest.config.js', '.mocharc.yml', 'karma.conf.js', 'pytest.ini', 'setup.cfg'];
  const found = configs.some(f => fs.existsSync(path.join(projectPath, f)));
  return {
    category: 'testing',
    name: 'Has test config',
    passed: found,
    score: found ? 5 : 0,
    weight: 5,
    suggestion: found ? undefined : 'Add a test framework configuration (jest.config.js, vitest.config.ts, etc.)',
  };
}

function checkTestFiles(projectPath: string): HealthCheck {
  try {
    const result = spawnSync('find', [projectPath, '-name', '*.test.*', '-o', '-name', '*.spec.*', '-type', 'f'], {
      encoding: 'utf-8', timeout: 5000,
    });
    const count = result.stdout ? result.stdout.trim().split('\n').filter(Boolean).length : 0;
    const found = count > 0;
    return {
      category: 'testing',
      name: 'Test files exist',
      passed: found,
      score: found ? 5 : 0,
      weight: 5,
      suggestion: found ? undefined : 'Write test files (*.test.ts, *.spec.ts, etc.)',
    };
  } catch {
    return { category: 'testing', name: 'Test files exist', passed: false, score: 0, weight: 5 };
  }
}

function checkReadme(projectPath: string): HealthCheck {
  const readmePath = path.join(projectPath, 'README.md');
  if (!fs.existsSync(readmePath)) {
    return { category: 'documentation', name: 'Has comprehensive README', passed: false, score: 0, weight: 5, suggestion: 'Add a README.md with at least 50 lines' };
  }
  const content = fs.readFileSync(readmePath, 'utf-8');
  const lines = content.split('\n').length;
  const passed = lines >= 50;
  return {
    category: 'documentation',
    name: 'Has comprehensive README',
    passed,
    score: passed ? 5 : Math.round(Math.min(lines / 50, 1) * 5),
    weight: 5,
    suggestion: passed ? undefined : `README.md has ${lines} lines. Aim for 50+ with install, usage, and API docs`,
  };
}

function checkCI(projectPath: string): HealthCheck {
  const ciPaths = ['.github/workflows', '.gitlab-ci.yml', 'Jenkinsfile', '.circleci', '.travis.yml'];
  const found = ciPaths.some(p => fs.existsSync(path.join(projectPath, p)));
  return {
    category: 'devops',
    name: 'Has CI/CD config',
    passed: found,
    score: found ? 5 : 0,
    weight: 5,
    suggestion: found ? undefined : 'Add CI/CD configuration (.github/workflows/, etc.)',
  };
}

function checkDocker(projectPath: string): HealthCheck {
  const files = ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml', 'compose.yml', 'compose.yaml'];
  const found = files.some(f => fs.existsSync(path.join(projectPath, f)));
  return {
    category: 'devops',
    name: 'Has Docker config',
    passed: found,
    score: found ? 4 : 0,
    weight: 4,
    suggestion: found ? undefined : 'Add a Dockerfile for containerized deployment',
  };
}

function checkDeployConfig(projectPath: string): HealthCheck {
  const files = ['vercel.json', 'fly.toml', 'serverless.yml', 'serverless.ts', 'netlify.toml', 'render.yaml', 'railway.json', 'Procfile'];
  const found = files.some(f => fs.existsSync(path.join(projectPath, f)));
  return {
    category: 'devops',
    name: 'Has deploy config',
    passed: found,
    score: found ? 3 : 0,
    weight: 3,
    suggestion: found ? undefined : 'Add deployment configuration (vercel.json, fly.toml, etc.)',
  };
}
