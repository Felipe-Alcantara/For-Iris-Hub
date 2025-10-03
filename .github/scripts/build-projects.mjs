import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const projectsDir = path.join(root, 'Projects');
const docsDir = path.join(root, 'docs');

const summary = [];

function toKebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/-{2,}/g, '-').replace(/(^-|-$)/g, '')
    .toLowerCase();
}

const useShell = process.platform === 'win32';

function run(command, args, options) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: useShell, ...options });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
}

function pickOutputDir(baseDir) {
  const candidates = ['dist', 'build', 'docs'];
  for (const candidate of candidates) {
    const candidatePath = path.join(baseDir, candidate);
    if (existsSync(candidatePath) && statSync(candidatePath).isDirectory()) {
      return candidatePath;
    }
  }
  return null;
}

function shouldCopy(sourcePath) {
  const normalized = sourcePath.split(path.sep);
  return !normalized.includes('.git') && !normalized.includes('node_modules');
}

function copyProject(source, destination, options = {}) {
  cpSync(source, destination, {
    recursive: true,
    force: true,
    errorOnExist: false,
    filter: shouldCopy,
    ...options,
  });
}

mkdirSync(docsDir, { recursive: true });

const entries = readdirSync(projectsDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name)
  .sort((a, b) => a.localeCompare(b));

const npmCmd = 'npm';

for (const name of entries) {
  const projectPath = path.join(projectsDir, name);
  const slug = toKebab(name) || name.toLowerCase();
  const target = path.join(docsDir, slug);

  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });

  const packageJsonPath = path.join(projectPath, 'package.json');

  if (existsSync(packageJsonPath)) {
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    if (!pkg.scripts || !pkg.scripts.build) {
      summary.push({ name, slug, type: 'package-json', action: 'skipped', reason: 'Sem script build' });
      continue;
    }

  run(npmCmd, ['ci'], { cwd: projectPath });
  run(npmCmd, ['run', 'build'], { cwd: projectPath });

    const outputDir = pickOutputDir(projectPath);
    if (!outputDir) {
      throw new Error(`Não foi possível detectar diretório de build para ${name}. Esperado dist/, build/ ou docs/.`);
    }

    copyProject(outputDir, target);
    summary.push({ name, slug, type: 'package-json', action: 'built', output: path.relative(projectPath, outputDir) });
  } else {
    const docsCandidate = path.join(projectPath, 'docs');
    if (existsSync(docsCandidate) && statSync(docsCandidate).isDirectory()) {
      copyProject(docsCandidate, target);
      summary.push({ name, slug, type: 'static', action: 'copied', source: 'docs/' });
    } else {
  copyProject(projectPath, target);
      summary.push({ name, slug, type: 'static', action: 'copied', source: '/' });
    }
  }
}

console.log('Resumo de build:', JSON.stringify(summary, null, 2));
