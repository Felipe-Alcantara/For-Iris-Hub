# Contribuindo com o For Iris Hub 💜

Obrigado por manter o hub organizado! Este documento resume as convenções necessárias para que os builds e deploys automáticos funcionem sem surpresas.

## Estrutura de pastas

- Todo projeto deve morar em `Projects/<NomeDoProjeto>`.
- Use **kebab-case** no nome da pasta (ex.: `Projects/couple-night-game`). Esse nome será usado como slug final (`docs/<kebab-case>/`).
- O conteúdo publicado sempre vai para `docs/<kebab-case>/`. A homepage do hub fica em `docs/index.html`.

## Requisitos por tipo de projeto

### Projetos estáticos

- Inclua ao menos um `index.html` pronto para ser copiado para `docs/<kebab-case>/`.
- Se houver assets extras (CSS, imagens etc.), mantenha caminhos relativos.

### Projetos com bundler (Vite, CRA, etc.)

1. Crie um `package.json` com `scripts.build` (`npm run build`).
2. Certifique-se de que o build gera um diretório final (`dist/` ou `build/`).
3. Ajuste o roteamento:
   - **Vite**: configure `base: '/for-iris-hub/<kebab-case>/'` em `vite.config.*`.
   - **React Router**: use `HashRouter` ou `basename="/for-iris-hub/<kebab-case>"`.
4. O workflow usará `npm ci && npm run build` dentro da pasta do projeto. Se precisar de outro gerenciador (pnpm, yarn), registre um aviso claro no README do projeto.

### Comentários de automação

- Se automatizar ajustes (via scripts) em arquivos de projeto, adicione o comentário `// modified-by: for-iris-hub-automation` (ou equivalente para a linguagem) no topo do arquivo tocado.

## Como testar localmente

```bash
# Construir um projeto
cd Projects/<kebab-case>
npm ci
npm run build

# Copiar artefatos manualmente (caso precise validar)
cp -r dist ../../docs/<kebab-case>

# Servir o hub completo
npx http-server docs/ -p 8080
```

## Git e automação

- Faça commits em blocos separados:
  1. `fix(project): ...` para mudanças dentro de um projeto.
  2. `chore(hub): ...` para alterações no hub (`docs/`, `.nojekyll`, docs gerais).
  3. `ci(hub): ...` para atualizações em `.github/workflows`.
- O workflow `build-and-deploy.yml` roda em todo push na `main`.
- Mantenha `.nojekyll` na raiz para evitar que o GitHub Pages trate o conteúdo como site Jekyll.

## Comunicação de riscos

- Se um projeto exigir passos extras (ex.: variáveis de ambiente), documente em `Projects/<kebab-case>/README.md` e mencione no `HUB_BUILD_REPORT.md`.
- Quando editar arquivos sensíveis (ex.: `vite.config.ts`) por automação, descreva a mudança no relatório.

Qualquer dúvida, abra uma issue descrevendo o que precisa ser ajustado. 💜
