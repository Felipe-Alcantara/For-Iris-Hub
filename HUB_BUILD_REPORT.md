# HUB_BUILD_REPORT

_Gerado em 3 de outubro de 2025_

## Projetos detectados

| Projeto | Pasta fonte | Slug (docs/) | Stack | Build | Observações |
| --- | --- | --- | --- | --- | --- |
| IF — Playlist Especial | `Projects/IF/` | `docs/if/` | HTML/CSS estático | — | Conteúdo publicado copiado de `Projects/IF/docs/`. |
| Couple Night — Game Kit | `Projects/SpicyGame/` | `docs/spicy-game/` | React + Vite + Tailwind | `npm run build` | Saída em `dist/` após atualizar `base` do Vite. |

## Ações automatizadas nesta rodada

- `Projects/SpicyGame/vite.config.ts`: adicionado comentário `// modified-by: for-iris-hub-automation`, atualizado `base` para `/for-iris-hub/spicy-game/` e removida saída customizada para garantir `dist/` como padrão.
- Build executado com `npm ci && npm run build` em `Projects/SpicyGame/` (Node 20).
- Conteúdo estático copiado:
  - `Projects/IF/docs/` → `docs/if/`.
  - `Projects/SpicyGame/dist/` → `docs/spicy-game/` (incluindo assets e `index.html`).
- `docs/index.html`: criado catálogo responsivo listando os projetos detectados.
- `.nojekyll` criado na raiz e referenciado pelo workflow.
- Documentação atualizada (`README.md`, `CONTRIBUTING.md`).
- Workflow `.github/workflows/build-and-deploy.yml` adicionado com script auxiliar `.github/scripts/build-projects.mjs` para detecção e cópia de builds.

## Avisos importantes

- **SPA Vite/React Router:** sempre ajuste `base: '/for-iris-hub/<slug>/'` (ou use `HashRouter`/`basename`) para evitar 404 ao acessar rotas internas via GitHub Pages.
- **Tailwind:** o `tailwind.config.js` do SpicyGame já mapeia `./index.html` e `./src/**/*`. Nenhum ajuste adicional necessário, mas mantenha `import.meta.env.BASE_URL` para assets se criar novos caminhos dinâmicos.
- **Lint do CSS gerado:** o arquivo `docs/spicy-game/assets/index-BGfCMTSd.css` é construído pelo Vite/Tailwind. Ferramentas automáticas podem apontar avisos (por exemplo, propriedade `appearance` ausente). Esses avisos são esperados no bundle minimizado.
- **Script automático:** o workflow remove e recria apenas `docs/<slug>/` para cada projeto, preservando `docs/index.html`. Caso renomeie projetos, delete manualmente o diretório antigo em `docs/` antes do commit.

## Testes executados

| Projeto | Comando | Resultado |
| --- | --- | --- |
| Couple Night — Game Kit | `npm ci` | ✅ |
| Couple Night — Game Kit | `npm run build` | ✅ |

_Nenhum teste automatizado foi necessário para `Projects/IF/` (site estático)._ 

## Próximos passos recomendados

1. Validar o workflow `build-and-deploy.yml` após o primeiro push para `main`.
2. Testar o hub publicado: `https://<usuario>.github.io/for-iris-hub/` e garantir que os links `/for-iris-hub/if/` e `/for-iris-hub/spicy-game/` respondem.
3. Ajustar roteamento adicional (ex.: React Router) caso novos projetos tenham rotas internas.

## Comandos úteis

```bash
# Build de um projeto SPA
cd Projects/spicy-game
npm ci
npm run build

# Copiar build manualmente (se quiser testar sem workflow)
cp -r Projects/spicy-game/dist docs/spicy-game

# Servir os artefatos localmente
npx http-server docs/ -p 8080
```
