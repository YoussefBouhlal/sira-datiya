# Sira Datiya

A local-first CV builder made with React, TypeScript, and Vite. No login, backend, analytics, or remote font requests. Create a CV through six sections, switch between independently registered templates, and export a PDF.

**Live app:** [Open Sira Datiya](https://youssefbouhlal.github.io/sira-datiya/)

## Get started

Use Node.js 22.22 or newer and npm 10 or newer.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. For an example document, choose **Load example**.

## Available workflows

- Personal details, optional local portrait, summary, experience, education, skills with optional proficiency ratings, languages, certifications, projects, and ordered references.
- Classic, Studio, Sidebar, Traditional, Prime ATS, and Pure ATS templates; accent, text size, and A4/US Letter settings.
- One English, French, or Arabic language selector for the interface and generated CV labels, with right-to-left Arabic layouts in every template and localized fictional examples.
- Preview generated PDF pages and download the exact PDF being previewed.
- Browser autosave and JSON backup/restore under the document actions menu.
- Confirmed reset and replacement actions.

Drafts can be incomplete. A name is needed to enable PDF download. Portraits are processed entirely on-device and included in JSON backups. Browser storage is not encrypted or a permanent backup; clearing site data or private browsing may remove the CV. Unreadable saved data blocks autosave rather than being overwritten. Explicit restore/reset actions can replace it. Existing version 1 drafts and backups are upgraded without dropping skill names; new saves use version 2.

Language changes never translate or replace your written content. New drafts detect a supported browser language, with English fallback; existing drafts without a language setting stay English. The selected language is saved with the CV and included in JSON backups. Restoring a backup switches the whole app to its language, and reset keeps the current language. Dates use translated month names and Western digits. There is still one current draft, not separate versions for each language.

## Quality checks

```sh
npm run check
npm run format:check
npx playwright install chromium
npm run test:e2e
```

`check` runs strict type checking, Oxlint, unit/component/architecture tests, and a production build. Browser tests run on desktop and mobile Chromium against the existing production build, not the development server. Run `check` or `build` before `test:e2e`. The tests start their own preview server at port 4173; keep that port free. Production assets are written to `dist/` and can be hosted on a static server.

To verify repository-path hosting locally, use the same nonsecret `VITE_BASE_PATH` for the build and browser tests:

```sh
VITE_BASE_PATH=/__pages-e2e__/ npm run check
VITE_BASE_PATH=/__pages-e2e__/ npm run test:e2e
```

The default base is `/`. To return to root hosting, rebuild with `VITE_BASE_PATH=/` and run the browser tests with that same value. To inspect a subpath build manually, run `VITE_BASE_PATH=/__pages-e2e__/ npm run preview` and open the printed address with `/__pages-e2e__/` appended.

## GitHub Pages deployment

The [Quality workflow](.github/workflows/ci.yml) verifies every push and pull request. Publishing is disabled until the repository variable `PAGES_DEPLOY_ENABLED` is set to the exact value `true`. Leave it unset until the owner completes the publishing and licensing requirements below.

1. Select a project license and resolve the public-release prerequisites. Confirm the repository is eligible for Pages and contains only intended source and fictional test data, not personal CVs or backups.
2. In the GitHub repository, select **Settings > Pages > Build and deployment > Source: GitHub Actions**.
3. Confirm the `github-pages` environment allows deployment from the repository's default branch. Add any required approval protection before enabling publishing.
4. Under **Settings > Secrets and variables > Actions > Variables**, add the repository variable `PAGES_DEPLOY_ENABLED` with value `true`. No custom token or secret is needed.
5. Push or merge an approved change to the default branch. If the workflow is already present there, re-run a default-branch **Quality** run after enabling the variable. Follow the run in **Actions** and open the URL shown by the deployment job.

Only pushes to the actual default branch can publish. On those runs, the workflow reads the base path from GitHub Pages settings, builds, runs all quality and desktop/mobile browser checks, then uploads the exact tested `dist/` directory. A dependent deployment job publishes that artifact with restricted Pages permissions. Pull requests, other branches, and runs with publishing disabled test a synthetic repository subpath and never deploy. No `gh-pages` branch or separate build is needed. Unsetting the variable stops future publishing; it does not take an existing site offline.

The usual repository URL is `https://USERNAME.github.io/REPOSITORY/`. An empty Pages base path is treated as `/`, so root sites also work without changing source. After deployment, use fictional data to check first load and reload, both templates, fonts, PDF preview and download, autosave, and JSON backup/restore on desktop and mobile. Confirm the browser console and network panel show no asset failures or unintended remote requests.

Localhost drafts do not transfer to the deployed site. Download a JSON backup locally and restore it on Pages when needed. Browser storage is origin-scoped, not path-scoped: other project sites under the same `USERNAME.github.io` origin share its storage area. This is not an isolation boundary; use only trusted sibling sites and keep backups.

## Architecture and contributions

Start with [the architecture](docs/architecture.md), [the template guide](docs/templates.md), and [the contribution guide](CONTRIBUTING.md). Adding a template changes only its module and a registry entry; the editor and export workflow are template-independent.

## Current limits

One CV per browser profile. No cloud sync, account recovery, rich text, portrait crop editor, automatic translation, or DOCX export. Portrait uploads accept PNG/JPEG files up to 10 MB and are center-cropped, resized, and compressed locally. English/French use the existing Latin PDF fonts; Arabic uses locally bundled Amiri fonts, including mixed Arabic/Latin content. Other scripts are not guaranteed. PDF text extraction can infer extra spaces within shaped Arabic words. Standard PDF fonts can produce a preview font warning in PDF.js on platforms without equivalent system fonts. The PDF renderer and worker are lazy-loaded but are relatively large dependencies. PDF text is selectable, but tagged-PDF/PDF-UA and universal ATS compatibility are not claimed.

## Publishing and licensing

No project license has been selected yet. Before publishing as open source, the owner must select a license, add its full text, and confirm the attribution requirements of bundled dependencies and fonts. No permission to reuse this project's code should be inferred from the absence of a license.

Bundled Amiri font files are Copyright 2010-2022 The Amiri Project Authors and distributed under the SIL Open Font License 1.1. Their original license is included at [public/fonts/amiri/OFL.txt](public/fonts/amiri/OFL.txt).
