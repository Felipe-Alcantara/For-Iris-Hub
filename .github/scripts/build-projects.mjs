import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const projectsDir = path.join(root, 'Projects');
const docsDir = path.join(root, 'docs');

const summary = [];

const metaConfigPath = path.join(projectsDir, 'projects.meta.json');
let metaConfig = [];

if (existsSync(metaConfigPath)) {
  try {
    metaConfig = JSON.parse(readFileSync(metaConfigPath, 'utf8'));
  } catch (error) {
    console.warn('⚠️  Não foi possível ler Projects/projects.meta.json. Usando metadados padrão.');
  }
}

function resolveProjectMeta(slug, fallbackName) {
  const match = metaConfig.find((entry) => entry.slug === slug || entry.directory === fallbackName);
  if (!match) {
    return {
      title: fallbackName,
      subtitle: 'Projeto',
      description: 'Projeto sem metadados configurados. Atualize Projects/projects.meta.json para personalizar.',
      tags: [],
    };
  }

  return {
    title: match.title ?? fallbackName,
    subtitle: match.subtitle ?? 'Projeto',
    description: match.description ?? '',
    tags: Array.isArray(match.tags) ? match.tags : [],
    linkText: match.linkText ?? 'Abrir projeto →',
    externalUrl: match.externalUrl ?? null,
  };
}

function renderHubPage(entries) {
  const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>For Iris Hub 💜 — projetos</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #f6f7fb;
        --bg-card: rgba(255, 255, 255, 0.85);
        --border: rgba(20, 24, 39, 0.08);
        --accent: #a855f7;
        --accent-strong: #7c3aed;
        --fg: #1f1b2e;
        --muted: #5e5875;
        font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      *, *::before, *::after { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        background: linear-gradient(180deg, rgba(240, 241, 250, 1) 0%, rgba(245, 236, 255, 1) 45%, rgba(240, 250, 252, 1) 100%);
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 48px 24px 96px;
        color: var(--fg);
      }

      .shell {
        width: min(1060px, 100%);
        display: grid;
        gap: 32px;
      }

      header {
        display: grid;
        gap: 12px;
        text-align: center;
      }

      h1 {
        font-size: clamp(2rem, 4vw, 2.5rem);
        margin: 0;
      }

      p.subtitle {
        margin: 0 auto;
        max-width: 620px;
        color: var(--muted);
        font-size: 1rem;
      }

      .grid {
        display: grid;
        gap: 20px;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      }

      .card {
        position: relative;
        display: grid;
        gap: 16px;
        padding: 24px;
        border-radius: 20px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        box-shadow: 0 24px 60px -30px rgba(107, 33, 168, 0.3);
        backdrop-filter: blur(12px);
        transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
      }

      .card::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        border: 1px solid transparent;
        pointer-events: none;
        transition: border-color 0.25s ease;
      }

      .card:hover {
        transform: translateY(-4px);
        box-shadow: 0 32px 70px -28px rgba(107, 33, 168, 0.5);
      }

      .card:hover::after {
        border-color: rgba(168, 85, 247, 0.35);
      }

      .card h2 {
        margin: 0;
        font-size: 1.3rem;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .card h2 span {
        font-size: 0.95rem;
        font-weight: 500;
        color: var(--muted);
      }

      .card p {
        margin: 0;
        color: var(--muted);
        line-height: 1.6;
        font-size: 0.95rem;
      }

      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .tag {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 6px 10px;
        border-radius: 999px;
        background: rgba(168, 85, 247, 0.12);
        color: var(--accent-strong);
      }

      .actions {
        margin-top: 8px;
        display: flex;
        justify-content: flex-end;
      }

      .actions a {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        padding: 10px 16px;
        border-radius: 999px;
        font-weight: 600;
        color: white;
        background: linear-gradient(120deg, var(--accent) 0%, var(--accent-strong) 100%);
        box-shadow: 0 12px 24px -15px rgba(124, 58, 237, 0.8);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .actions a:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 32px -18px rgba(124, 58, 237, 0.9);
      }

      footer.note {
        margin-top: 12px;
        font-size: 0.85rem;
        color: var(--muted);
        text-align: center;
      }

      @media (max-width: 640px) {
        body { padding: 32px 16px 64px; }
        .card { padding: 20px; }
        .actions { justify-content: flex-start; }
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <header>
        <h1>For Iris Hub 💜</h1>
        <p class="subtitle">
          Coleção de projetos publicada automaticamente a partir da pasta <code>Projects/</code>. Cada card leva para a versão hospedada no GitHub Pages.
        </p>
      </header>

      <section class="grid" id="projects"></section>

      <footer class="note">
        Projetos publicados com base <code>/for-iris-hub/&lt;slug&gt;/</code>. Atualize <code>Projects/projects.meta.json</code> para personalizar título, descrição e tags.
      </footer>
    </div>

    <script>
      const projects = ${JSON.stringify(entries, null, 2)};
      const container = document.getElementById('projects');

      projects.forEach((project) => {
        const card = document.createElement('article');
        card.className = 'card';

        const title = document.createElement('h2');
        title.append(project.title);
        const subtitle = document.createElement('span');
        subtitle.textContent = project.subtitle;
        title.appendChild(subtitle);

        const description = document.createElement('p');
        description.textContent = project.description;

        const tags = document.createElement('div');
        tags.className = 'tags';
        project.tags.forEach((tag) => {
          const badge = document.createElement('span');
          badge.className = 'tag';
          badge.textContent = tag;
          tags.appendChild(badge);
        });

        const actions = document.createElement('div');
        actions.className = 'actions';
        const href = project.externalUrl || project.href;
        const link = document.createElement('a');
        link.href = href;
        link.target = '_blank';
        link.rel = 'noreferrer';
        link.textContent = project.linkText;
        actions.appendChild(link);

        card.append(title, description, tags, actions);
        container.appendChild(card);
      });
    </script>
  </body>
</html>`;

  writeFileSync(path.join(docsDir, 'index.html'), html, 'utf8');
}

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
  const meta = resolveProjectMeta(slug, name);

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
    summary.push({ name, slug, type: 'package-json', action: 'built', output: path.relative(projectPath, outputDir), meta });
  } else {
    const docsCandidate = path.join(projectPath, 'docs');
    if (existsSync(docsCandidate) && statSync(docsCandidate).isDirectory()) {
      copyProject(docsCandidate, target);
      summary.push({ name, slug, type: 'static', action: 'copied', source: 'docs/', meta });
    } else {
  copyProject(projectPath, target);
      summary.push({ name, slug, type: 'static', action: 'copied', source: '/', meta });
    }
  }
}

const hubEntries = summary
  .filter((item) => item.action === 'built' || item.action === 'copied')
  .map((item) => ({
    slug: item.slug,
    href: `/for-iris-hub/${item.slug}/`,
    title: item.meta.title,
    subtitle: item.meta.subtitle,
    description: item.meta.description,
    tags: item.meta.tags ?? [],
    linkText: item.meta.linkText ?? 'Abrir projeto →',
    externalUrl: item.meta.externalUrl ?? null,
  }));

renderHubPage(hubEntries);

console.log('Resumo de build:', JSON.stringify(summary, null, 2));
