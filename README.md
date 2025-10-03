# For Iris Hub 💜

For Iris Hub é um portal pessoal que reúne projetos, mini-sites e experiências criadas para a Íris. Cada projeto vive em `Projects/<NomeDoProjeto>` e o conteúdo publicado é exposto em `docs/<kebab-case-do-projeto>/`, assim como um `docs/index.html` que funciona como homepage do hub (For Iris Hub 💜 — projetos).

> 💡 **GitHub Pages**: o repositório é publicado em `https://<usuario>.github.io/for-iris-hub/`. Toda rota pública precisa respeitar o prefixo `/for-iris-hub/<slug>/`.

## Como o hub está estruturado

- `Projects/` guarda os projetos fonte. Exemplos atuais:
  - `Projects/IF/` — site estático com carta e playlist.
  - `Projects/SpicyGame/` — SPA React+Vite+Tailwind.
- `docs/` contém os artefatos publicados (um subdiretório por projeto + homepage do hub). Esse diretório é sobrescrito pelo workflow automatizado.
- `.github/workflows/build-and-deploy.yml` monta os artefatos de cada projeto e publica em `docs/` a cada push na `main`.

## Adicionando um novo projeto

1. Crie uma pasta em `Projects/` usando **kebab-case descritivo** (ex.: `Projects/cartas-especiais`).
2. Monte o projeto normalmente dentro dessa pasta.
3. Se for um SPA com bundler (Vite, CRA, etc.), configure a saída para `dist/` ou `build/` e adicione/ajuste o script `npm run build`.
4. **Vite / React Router**:
	- defina `base: '/for-iris-hub/<slug>/'` no `vite.config.*` (ou use `HashRouter` / `basename` no React Router).
	- garanta que as referências a assets usem caminhos relativos ou o `import.meta.env.BASE_URL`.
5. Para projetos estáticos simples, basta garantir um `index.html` pronto para ser copiado.

## Testando e publicando manualmente

### Build por projeto

```bash
cd Projects/<nome-do-projeto>
npm ci
npm run build
```

Após o build, copie o diretório gerado (`dist/`, `build/` etc.) para `docs/<slug>/`.

### Servindo o hub localmente

```bash
npx http-server docs/ -p 8080
# ou use seu servidor estático favorito
```

Abra `http://localhost:8080` para navegar pelo hub. Cada card aponta para `/for-iris-hub/<slug>/`.

### Checklist antes do push

1. Execute os builds individualmente (`npm run build`).
2. Verifique se `docs/index.html` lista o projeto novo e se o slug bate com o nome do diretório.
3. Faça três commits separados:
	- `fix(project): ...` para alterações dentro do projeto.
	- `chore(hub): ...` para mudanças em `docs/`, `.nojekyll`, `README.md`, `CONTRIBUTING.md`.
	- `ci(hub): ...` para updates no workflow.
4. Faça push para `main`. O workflow `build-and-deploy.yml` irá gerar os artefatos finais em `docs/`.

## Automação

- **Workflow:** `.github/workflows/build-and-deploy.yml` é executado a cada push na `main`, roda `npm ci && npm run build` em cada projeto com `package.json` e publica os builds em `docs/<slug>/`.
- **GitHub Pages:** certifique-se de que o pages site está apontando para a branch `main`, pasta `/docs`.

## Referências úteis

- `CONTRIBUTING.md` resume convenções de nome, estrutura e passos necessários para que o workflow funcione.
- Cada projeto pode ter instruções específicas em `Projects/<nome>/README.md`.
