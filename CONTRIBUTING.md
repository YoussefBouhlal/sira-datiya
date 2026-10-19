# Contributing

Before public release, the project owner must select a license. Contribution and redistribution terms are not yet established.

## Local setup

Use Node.js 22.22+ and npm 10+. Run `npm ci`, then `npm run dev`. Use `npm run check` and `npm run format:check` before proposing changes. For browser checks, run `npx playwright install chromium` once, then run `npm run check` before `npm run test:e2e`. Browser tests serve the existing production build on port 4173, which must be free; they do not use or reuse the development server.

For deployment changes, verify both repository-path and root hosting. Use the same `VITE_BASE_PATH` when building and testing; rebuild whenever that path changes:

```sh
VITE_BASE_PATH=/__pages-e2e__/ npm run check
VITE_BASE_PATH=/__pages-e2e__/ npm run test:e2e
VITE_BASE_PATH=/ npm run build
VITE_BASE_PATH=/ npm run test:e2e
npm run format:check
```

CI tests a synthetic subpath unless publishing is enabled for a default-branch push. Publishing runs derive their path from Pages settings and deploy only the production artifact that passed all checks. Keep pull requests free of deployment operations and keep deployment write permissions restricted to the dependent deployment job. See [GitHub Pages setup](README.md#github-pages-deployment) for the owner-controlled `PAGES_DEPLOY_ENABLED` switch and license prerequisites; do not enable publishing as part of ordinary contribution setup.

## Where changes belong

Read [architecture](docs/architecture.md) for ownership and [templates](docs/templates.md) for adding or removing designs. Keep components and tests close to the behavior they own. Use shared UI only for genuinely reused, CV-independent controls. Avoid feature-to-feature imports and imports between concrete templates.

## Expectations

- Keep pull requests focused, describe behavior changes, and include verification results.
- Add a regression test for a bug or a meaningful new behavior. Prefer existing test files and fictional fixtures.
- Keep TypeScript strict; do not bypass contracts with `any` or broad casts.
- Use Prettier, descriptive names, native accessible controls, visible labels, keyboard support, and reduced-motion-aware styling.
- Do not introduce server calls, analytics, or external font/media requests without a separate privacy discussion.
- Never include real CVs, contact details, browser backups, or credentials in tests, issues, or screenshots.
- Check empty, typical, and multi-page CVs for template changes; inspect desktop and mobile layouts for interface changes.

## Useful commands

`npm run test:watch` runs local tests interactively. `npm run format` formats maintained source and documentation. `npm run build` creates the static build. `npm run preview` serves that build locally.

Dependency and template boundaries are executable tests, not just documentation. CI must pass before merging. Test artifacts and generated output must not be committed.
