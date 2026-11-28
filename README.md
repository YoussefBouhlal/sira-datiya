# Siravuno

A local-first CV builder made with React, TypeScript, and Vite. No login or CV backend is required, and fonts are bundled with the app. Create a CV through six sections, switch between independently registered templates, and export a PDF.

**Live app:** [Open Siravuno](http://siravuno.com/)

## Get started

Use Node.js 22.22 or newer and npm 10 or newer.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. For an example document, choose **Load example**.

The builder stays at `/`. Product overviews are available at `/en/`, `/fr/`,
and `/ar/`, with ordinary language links between them. **About Siravuno** above
the builder workspace opens the English overview. That link saves pending
edits before leaving and stays in the editor if saving fails. The overview is
static HTML with local fonts and a matching fictional template image; it contains no
client JavaScript and never reads the saved CV. It links directly back to the
builder without changing the document language. Arabic uses right-to-left layout
and bundled Amiri fonts. Each overview links to a public template gallery at
`/<language>/templates/`, with detail pages for `001`, `003`, and `005`, such as
`/en/templates/003/`. All three languages have distinct layout descriptions,
use cases, limitations, and matching fictional previews. Builder links do not
preselect a template or load an example; choose a template inside the builder.
Help pages at `/<language>/help/` explain autosave limits, editable JSON backups,
confirmed restore, PDF review, language behavior, and recovery from saving problems.
They are linked from overviews and template pages and remain script-free and
independent of private storage. Privacy pages at `/<language>/privacy/` describe
local data, backups, deletion, immediate builder analytics without opt-in, and
third-party collection limits. The workspace and CV storage dialog link to the
document-language privacy page with the same pending-save guard. Public pages
remain analytics-free. Operator/contact details, provider retention settings,
and deployed behavior still need owner verification; the technical disclosure
is not a legal-compliance claim. Candidate-template entry remains unimplemented.

The build generates twenty-one public pages, self-canonicals, reciprocal language
alternatives, and their sitemap entries. Vite's multi-page mode
preserves 404 responses for unknown paths locally; verify production hosting
separately. Regenerate the nine committed fictional template images after relevant
renderer changes with `npm run generate:public-preview`. The generator resolves
the permanent template numbers through the registry and renders the first A4 page;
it never reads a private draft or ships the PDF engine to public pages.

### Missing pages

The build emits a script-free `404.html` for GitHub Pages with English, French,
and Arabic recovery messages. It links to the unchanged builder and translated
overviews without reading storage or redirecting automatically. The error document
uses `noindex`, has no canonical or language-alternative metadata, and is excluded
from the sitemap. Development and production preview serve it for unmatched HTML
GET/HEAD requests with HTTP 404 after normal routes and assets are resolved.
Missing non-HTML assets retain ordinary 404 handling. Base-prefixed stylesheet,
font, and recovery URLs work from deeply nested missing paths. Verify the deployed
host's custom error response separately; generating the file is not deployment.

### Crawler policy

The owner approved allowing search and AI-training crawlers on November 28, 2026.
The build emits `robots.txt` with `User-agent: *`, `Allow: /`, and an absolute
sitemap reference using the configured base path. Development serves the same
policy. This introduces no crawler-specific restrictions and changes no editor
storage or analytics behavior. It is not a privacy or access-control boundary.

For the root-hosted Siravuno site, publish it at `/robots.txt`. On repository-path
hosting, the emitted file inside that path is not a host-wide robots policy:
crawlers look for `/robots.txt` at the host root. The host owner must manage that
root file and reference the repository-path sitemap if needed. Do not overwrite
a shared host policy with this project's file without reviewing other sites.

After deployment, verify the root policy, sitemap, representative translated
pages, local assets, redirects, and genuine unknown-route 404s. Check intended
crawler access at the hosting/firewall layer separately, then submit the sitemap
using verified Google Search Console and Bing Webmaster Tools properties. Local
tests do not establish deployment, indexing, or AI citation results.

## Available workflows

- Personal details, optional local portrait, summary, experience, education, skills with optional proficiency ratings, languages, certifications, projects, and ordered references.
- Templates 001 through 017 with permanent numbers across all languages; accent, text size, and A4/US Letter settings.
- A first-visit English, French, or Arabic choice before templates, plus the existing header language selector for later changes, with right-to-left Arabic layouts and localized fictional examples.
- Preview generated PDF pages and download the exact PDF being previewed.
- Browser autosave and JSON backup/restore under the document actions menu.
- Confirmed reset and replacement actions.

Drafts can be incomplete. A name is needed to enable PDF download. Portraits are processed entirely on-device and included in JSON backups. Browser storage is not encrypted or a permanent backup; clearing site data or private browsing may remove the CV. Unreadable saved data blocks autosave rather than being overwritten. Explicit restore/reset actions can replace it. Existing version 1 drafts and backups are upgraded without dropping skill names; new saves use version 2.

Language changes never translate or replace your written content. First-time visitors choose a language before templates; the opening screen uses a supported browser language, with English fallback. Existing drafts skip this choice, and older drafts without a language setting stay English. The initial choice is remembered in this browser even after resetting the CV; clearing site data removes it. The selected language is also saved with the CV and included in JSON backups. Restoring a backup switches the whole app to its language, and reset keeps the current language. Dates use translated month names and Western digits. There is still one current draft, not separate versions for each language.

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

The public app URL is `http://siravuno.com/`, hosted at the domain root. An empty Pages base path is treated as `/`, so this root site works without changing source. The custom domain and DNS remain owner-managed hosting settings. After deployment, use fictional data to check first load and reload, both templates, fonts, PDF preview and download, autosave, and JSON backup/restore on desktop and mobile. Confirm the browser console and network panel show no asset failures or unintended remote requests.

Drafts from localhost or the previous GitHub Pages address do not transfer automatically to `http://siravuno.com/`. Download a JSON backup from the old site and restore it on the new site when needed. Browser storage is origin-scoped, not path-scoped: changing the scheme, hostname, or port uses a separate storage area, while paths on the same origin share storage. Keep backups before moving between origins, including any later move from HTTP to HTTPS.

The Siravuno rename also starts a new browser storage namespace for drafts and language preferences, with no automatic migration from the previous keys even on the same origin. Export a JSON backup from the previous app before updating, then restore it in Siravuno. Existing JSON backups remain compatible.

## Architecture and contributions

Start with [the architecture](docs/architecture.md), [the template guide](docs/templates.md), and [the contribution guide](CONTRIBUTING.md). Adding a template changes only its module and a registry entry; the editor and export workflow are template-independent.

## Current limits

One CV per browser profile. No cloud sync, account recovery, rich text, portrait crop editor, automatic translation, or DOCX export. Portrait uploads accept PNG/JPEG files up to 10 MB and are center-cropped, resized, and compressed locally. English/French use the existing Latin PDF fonts; Arabic uses locally bundled Amiri fonts, including mixed Arabic/Latin content. Other scripts are not guaranteed. PDF text extraction can infer extra spaces within shaped Arabic words. Standard PDF fonts can produce a preview font warning in PDF.js on platforms without equivalent system fonts. The PDF renderer and worker are lazy-loaded but are relatively large dependencies. PDF text is selectable, but tagged-PDF/PDF-UA and universal ATS compatibility are not claimed.

## Publishing and licensing

No project license has been selected yet. Before publishing as open source, the owner must select a license, add its full text, and confirm the attribution requirements of bundled dependencies and fonts. No permission to reuse this project's code should be inferred from the absence of a license.

Bundled Amiri font files are Copyright 2010-2022 The Amiri Project Authors and distributed under the SIL Open Font License 1.1. Their original license is included at [public/fonts/amiri/OFL.txt](public/fonts/amiri/OFL.txt).

Template 028 bundles Allura Regular, Copyright 2010 The Allura Project Authors, under the SIL Open Font License 1.1. Its original license is included at [src/templates/028/assets/OFL.txt](src/templates/028/assets/OFL.txt).

Templates 008, 009, and 017 each bundle their own Oswald Regular font, Copyright 2016 The Oswald Project Authors and distributed under the SIL Open Font License 1.1. Their original licenses are included at [src/templates/008/assets/OFL.txt](src/templates/008/assets/OFL.txt), [src/templates/009/assets/OFL.txt](src/templates/009/assets/OFL.txt), and [src/templates/017/assets/OFL.txt](src/templates/017/assets/OFL.txt).
