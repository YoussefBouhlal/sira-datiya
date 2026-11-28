# Architecture

## Ownership

```text
src/
  app/                       Composition, state, persistence orchestration
  domain/cv/                 Schema, types, defaults, fictional example
  features/
    cv-editor/               Section navigation and controlled forms
    template-picker/         Gallery, tentative selection and appearance controls
    pdf-export/              Generation, canvas preview, download
  i18n/                      Local messages, date formatting, UI language context
  templates/
    types.ts                 Renderer and metadata contract
    registry.ts              Registration, default, fallback
    001/                     Template 001 definition, document and styles
    002/                     Template 002 definition, document and styles
    003/                     Template 003 definition, document and styles
    004/                     Template 004 definition, document and styles
    005/                     Template 005 definition, document and styles
    006/                     Template 006 definition, document and styles
    007/                     Template 007 definition, document and styles
    008/                     Template 008 definition, document, styles and font
    009/                     Template 009 definition, document, styles and font
    010/                     Template 010 definition, document and styles
    011/                     Template 011 definition, document and styles
    012/                     Template 012 definition, document and styles
    013/                     Template 013 definition, document and styles
    014/                     Template 014 definition, document and styles
    015/                     Template 015 definition, document and styles
    016/                     Template 016 definition, document and styles
    017/                     Template 017 definition, document, styles and font
    018/                     Template 018 definition, document and styles
    019/                     Template 019 definition, document and styles
    020/                     Template 020 definition, document and styles
    021/                     Template 021 definition, document and styles
    022/                     Template 022 definition, document and styles
    023/                     Template 023 definition, document and styles
    024/                     Template 024 definition, document and styles
    025/                     Template 025 definition, document and styles
    026/                     Template 026 definition, document and styles
    027/                     Template 027 definition, document and styles
    028/                     Template 028 definition, document, styles and font
    029/                     Template 029 definition, document and styles
    030/                     Template 030 definition, document and styles
    shared/                  Shared PDF content primitives
  components/ui/             Reused domain-independent HTML controls
  lib/storage/               Versioned storage and backup parsing
  lib/download.ts            Browser download adapter
  styles/                    Application and responsive CSS
  test/                      Setup and architecture contract
docs/                        Contributor explanations
e2e/                         Full browser workflows
```

## Dependency direction

The application composes features. Features consume domain data, public contracts, and shared UI. They never import one another. PDF export receives a resolved template definition from the app, rather than discovering templates itself.

The template picker receives a thumbnail render slot from the app. The app supplies the PDF feature through that slot; the picker never imports PDF generation or concrete templates. The gallery shows every template in a full-width thumbnail grid without a preview pane, filters, or totals. Tentative selection is local to the picker. Only an explicit Use template action in the persistent footer updates canonical appearance; closing the gallery discards the tentative choice. Opening the gallery highlights the current template and focuses the close button on desktop and mobile.

The app opens empty CVs in a dedicated template-selection screen before the six editor sections. This screen shares template choices with the styling gallery, but exposes no appearance controls. Clicking a thumbnail highlights a local candidate inline without opening a popup or changing canonical appearance. The persistent Use this template action applies that candidate and opens personal details. The existing Template & style section remains last and uses its gallery dialog for later changes without losing content.

Domain schema/defaults/types do not import React, browser storage, features, or templates. Types are inferred from Zod schemas to avoid two drifting versions of the model. Templates import domain types, the PDF library, and template-shared primitives, never forms or application state. HTML UI and PDF primitives are intentionally separate.

Each template and feature exposes one public entry. Internal files use direct relative imports. A TypeScript-AST architecture test enforces cross-module import boundaries, including dynamic template imports. No alias configuration or dependency-injection framework is necessary for the current size.

## Public rendering boundary

Agreed November 27, 2026, for step 1 of the
[SEO and GEO implementation order](seo-geo-todo.md#recommended-implementation-order).
The `/en/`, `/fr/`, and `/ar/` overviews, translated template galleries, and
detail pages for templates 001, 003, and 005, and translated help pages are
implemented, along with translated technical privacy pages; live public-page
checks passed November 28, 2026. Public template entry is implemented locally;
its deployment verification remains pending.
The builder remains client-side at `/`.

### Rendering and ownership

Keep React and the single package. Generate public product, template, help, and
privacy HTML at build time through a separate rendering entry. Their essential
content and links must work without JavaScript. Request-time server rendering and
a framework migration are outside this scope.

Keep the builder client-side at `/` on the existing origin. Preserve
`siravuno.cv.v1`, `siravuno.language.v1`, the document and backup formats, and the
existing editor workflow. Do not redirect returning visitors through public pages.
The translated overviews share a separate build-time React entry in `src/public`.
Its generated HTML and local CSS/fonts contain no client JavaScript or analytics.
`src/public/content.ts` owns the public language list and translated copy without
importing editor messages or document state. Each route selects its content,
metadata, direction, and fictional preview explicitly. Ordinary language links
connect equivalents without redirects or storage preferences. Self-canonicals,
reciprocal `hreflang` links, and sitemap URLs use that same language list.
There is no `x-default`: no separate public language selector or fallback route
has been designated. The builder is not a public language equivalent.
`src/public/template-content.ts` owns the selected permanent template numbers,
public page paths, and translated layout descriptions. Public code does not
import the template registry or PDF renderers. Gallery routes use
`/<language>/templates/` and detail routes use `/<language>/templates/<number>/`.
`src/public/Help.tsx` renders `/<language>/help/` using independent translated
content in `src/public/help-content.ts`. Help covers storage limits, JSON
backup/restore, PDF review, document language, and recovery without mounting the
editor. Overviews and template pages link to their matching help language.
The same renderer accepts `page: 'privacy'` for `/<language>/privacy/`, with
independent translated disclosures in `src/public/privacy-content.ts`. Privacy
describes the actual analytics boundary, local deletion, and outstanding owner
details without promising legal compliance or third-party isolation.
`src/public/build.ts` emits all twenty-one pages and a sitemap containing only those public URLs.
The same assets are served in development. Vite uses multi-page mode, not an SPA
fallback, so unknown paths return 404 in development and production preview.
Production hosting must be checked separately. Arabic HTML is RTL and uses the
bundled Amiri fonts; English and French retain local DM Sans and Newsreader.

`src/public/NotFound.tsx` renders one script-free, trilingual error document,
emitted as `404.html` for GitHub Pages. Post-static middleware in development and
preview returns it with HTTP 404 for unmatched HTML GET/HEAD requests, without
redirecting or mounting the editor. Its base-prefixed assets and recovery links
work at arbitrary missing paths. The document is `noindex`, has no canonical or
`hreflang` metadata, and is not included in the public sitemap. Missing asset
requests retain ordinary 404 handling. No language or draft storage is consulted.

On November 28, 2026, the owner approved allowing search and AI-training crawlers.
The build plugin emits `robots.txt` alongside the sitemap and serves it during
development, with a wildcard allow rule and an absolute, base-aware sitemap URL.
There are no crawler-specific blocks. A subpath build emits the file inside that
subpath, but crawlers require a policy at the host root; the host owner must
configure that separately without replacing unrelated shared-site policies.
Robots rules are not access controls and expose no private browser drafts.
HTTP checks cover the exact plain-text policy and the complete canonical sitemap
URL set. Production redirects, host-root availability, firewall behavior, and
webmaster-tool ownership/submission remain separate deployment checks.

The builder's About Siravuno and Privacy and analytics links call
`saveBeforeNavigation` synchronously. Privacy links in the workspace and CV storage
dialog use the current document language without changing it.
Failed or blocked saves cancel navigation and preserve the in-memory draft;
untouched first visits leave without creating a draft or language preference.
Generic public links return to the unchanged builder without language or template
parameters. They never change a saved document's appearance or language. The
explicit template-detail action described below is the only public action that
requests an appearance change.

`npm run generate:public-preview` regenerates the committed English, French, and
Arabic bitmaps for templates 001, 003, and 005 using their registered real renderers
and fictional example data. The offline generator verifies that each public number
is registered. Images show only the first A4 page, not a promise of a one-page CV.
It does not inspect storage.
No PDF engine is shipped with the public page.

Public rendering and any browser enhancement must not mount `App` or
`useCvDocument`, initialize document storage, read or write private drafts or saved
language preferences, or trigger autosave. Hiding a mounted editor is not
isolation. Public metadata, HTML language, and direction belong to the public
entry, not editor effects. Build inputs, previews, metadata, and URLs may contain
only public facts and fictional samples, never CV fields or backups.

### Language precedence

Public page language and document language are separate concepts:

| Situation                                                             | Required behavior                                                                                                                     |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| A public page is opened                                               | Its own language determines content, metadata, HTML language, and direction; no saved document or preference is consulted or changed. |
| A visitor with a saved draft enters the builder                       | Preserve the saved document language, regardless of the referring public page.                                                        |
| A visitor enters the builder without a draft or saved language choice | Keep the explicit initial language choice; the existing browser-language suggestion and English fallback remain unchanged.            |
| A visitor has a saved language choice but no draft                    | Preserve the existing saved-preference behavior; public page language does not override it.                                           |
| Storage is unreadable or unavailable                                  | Preserve the existing recovery and blocked-save behavior; do not treat a public link as permission to replace data.                   |

### Non-destructive template entry

Agreed November 28, 2026: the explicit Use this template action on each translated
template-detail page directly applies the chosen template in the builder. This
supersedes the earlier proposal-only rule: clicking the action is confirmation;
there is no second Apply dialog. Public gallery cards still open detail pages,
and generic Open CV builder links remain parameter-free. Public rendering stays
script-free and never reads or writes a draft.

The action links to the base-prefixed builder with `?template=<number>`. The
builder validates one exact permanent catalog number against the registry, not
the fallback resolver, before applying anything. Registry IDs, private CV data,
and document language are not carried in the link. Duplicate, unknown, malformed,
or retired numbers show a translated Template unavailable notice and retain the
normal builder entry without applying a fallback as the requested template.

Application follows the existing template-selection rule: a different template
changes its ID, clears color overrides, and restores its default legacy accent;
applying the active template preserves colors. CV content, document language,
text size, paper size, and other appearance preferences remain unchanged. Public
template entry never invokes Load example or reset. Unknown or retired candidate
numbers must not mutate the draft; retain the normal builder entry and allow a
valid selection.

Saved drafts and saved language preferences retain their existing precedence.
Fresh visitors first complete the explicit initial language choice; until then,
the entry remains in the URL and no template change is saved. Language and
template are applied together when that choice is made. Valid entry opens
Personal details rather than the template-selection screen, including for empty
or appearance-only drafts. Plain builder entry retains its existing behavior.

The hook applies the entry during initialization or explicit initial language
choice, not a replayable update effect. Once accepted in memory, only the
`template` query parameter is removed with `history.replaceState`, preserving
other parameters, the fragment, and history state. Reload or Back/Forward does
not reapply a consumed command; deliberately following the public action again
does. Reloading an empty saved draft through a consumed, ordinary builder URL
retains the existing template-selection rule. Normal debounced and lifecycle
saving persists the applied document; initial language choice saves immediately.

Unreadable or unavailable storage takes the existing recovery path without
applying the entry, including after a later reset or restore. Rejected entries
are consumed too. Write failures retain the applied in-memory document and the
existing Not saved warning and backup actions, without restoring a replayable
command in the URL. No storage key or document/backup format changes are needed.

### Pilot verification gates

The pilot has focused unit, architecture, and desktop/mobile browser checks that:

- Fetch generated public HTML without JavaScript and find meaningful content and
  working builder links.
- Render a public page with storage access monitored, including after
  350 ms and lifecycle events, and observe no private storage reads or writes.
- Enforce the public/editor import boundary and keep public metadata, language,
  and direction independent of saved editor state.
- Preserve a populated draft through public navigation, reload, and Back/Forward,
  including navigation before the 350 ms autosave delay expires. Navigation must
  flush pending edits; if saving fails, keep the in-memory draft and show an
  actionable warning rather than silently discarding it.
- Verify first visits, returning visits, corrupt storage, quota failures, local
  fonts and preview assets, metadata, accessibility, and genuine unknown-path 404s.
- Verify all three public languages without JavaScript, crawlable language links,
  reciprocal alternatives and sitemap consistency, RTL typography, narrow layouts,
  and return to an unchanged saved Arabic document from any public language.
- Verify all translated gallery/detail routes, matching local preview images,
  page-specific metadata, language links, nested unknown-route 404s, and accessible
  layouts at 1440, 390, and 320 pixels. Pending edits and existing appearance survive
  gallery/detail navigation and return to the builder; a fresh detail-page visitor
  still makes an explicit document-language choice.
- Verify all three help routes without JavaScript, their contents links, reciprocal
  language alternatives, sitemap entries, storage isolation, accessible narrow
  layouts, unknown nested-route 404s, and preservation of pending edits and the
  saved document through help navigation and reload.

Public template-entry checks cover direct application, same-template color
preservation, different-template color reset, fresh and saved language precedence,
content and other appearance preservation, one-time URL consumption, history and
reload, invalid/duplicate numbers, unreadable data, and failed persistence. The
builder gallery retains its separate tentative selection and cancellation rules.

Run the existing release checks for that workflow change. Do not expand public
routes until the pilot passes; deployed HTTP behavior requires separate checks.
No deployment or live indexing result is implied by local verification.

## Data flow

`useCvDocument` hydrates a validated document once and owns the canonical `CvDocument`. Controlled editor inputs patch that document immediately, so changing steps cannot discard unsent form state. Transient state such as the selected step, dialogs, and preview page stays local.

First-time visitors choose English, French, or Arabic before template selection. The app remembers this choice separately under `siravuno.language.v1` and immediately saves the selected document language. Untouched visits do not autosave before this choice. Existing saved drafts bypass the language screen, including appearance-only drafts. Reset retains the language preference; clearing browser data removes it. Storage failures retain the in-memory choice and show an actionable warning. The header language selector remains available throughout.

After the initial language choice, navigation depends on CV content: empty drafts, including appearance-only drafts, open template selection with their existing template highlighted. Any personal detail, summary, or section entry opens the editor directly. Applying a template keeps the editor open for that session even before typing; reloading an empty draft opens selection again. Successful reset returns to selection. Restoring a backup follows the same content rule. Unreadable storage stays in the editor recovery flow rather than being mistaken for a new CV.

The hook debounces saves by 350 ms and flushes the latest rendered document on `pagehide` or when hidden. Storage operations return explicit results. Failed saves retain the in-memory draft. Corrupt or unsupported saved data blocks automatic writing; only a confirmed reset or restore replaces it. State is private to one browser profile, not synchronized across tabs or devices. Simultaneous tabs are last-write-wins.

Saved JSON has version `2`, `cv`, and `appearance`. Version `1` documents and backups remain readable: skill-name strings become unrated skill entries with deterministic, position-based IDs, and absent portrait/reference fields receive empty defaults. Reading never writes the migration back; the next successful save or backup emits version `2`. The storage key remains unchanged so existing drafts are discovered. Unsupported versions still block automatic writing. Content and appearance are separate; the domain accepts unknown template IDs. The app resolves a missing ID to the registry default before the next save.

`appearance.language` is the single document language (`en`, `fr`, or `ar`). It controls the interface, generated CV labels, dates, and fictional samples, never the person's entered content. Older documents without this field default to English without writing during load. Only new drafts detect the first supported browser language, with English fallback. Reloads and backup restores use the saved language; reset preserves it. There are no separate per-language drafts or automatic translation services.

The app sets HTML language and direction from that canonical setting and supplies a UI language context. Pure message/date helpers live in `i18n`; features stay independent. Dates use full localized Gregorian month names and Western digits. Templates receive language through appearance, never UI context or storage. Gallery thumbnail caches are keyed by both template definition and language.

Skills have stable IDs and optional five-level proficiency ratings. References have stable IDs and an explicit user-controlled order. Portraits are optional local PNG/JPEG uploads. The editor retains the entire image composition, resized to at most 1536 pixels on the longest side and compressed to a JPEG data URL of at most 600,000 characters. Optional `personal.portraitFraming` contains this source, normalized horizontal/vertical positions, and zoom from 1 to 4. Existing version 1/2 documents without framing remain readable and keep their saved image unchanged.

Portrait framing is temporary dialog state until Apply. The dialog uses the active template's portrait shape, supports mouse/touch dragging and native range controls, and prevents empty edges. Apply produces a 512-square-pixel JPEG of at most 270,000 characters in `personal.portrait` and updates the framing together. All templates render that same prepared image without interpreting editor state. Cancel preserves the previous portrait and framing, including during replacement. Reset centers the pending image at minimum fill zoom. Existing portraits can be reframed using their saved image, but discarded source regions require re-uploading the original. No remote image sources are accepted. Portraits, retained sources, framing, and references are CV content, so drafts and backups preserve them. Failed processing leaves the canonical portrait unchanged; failed persistence retains the in-memory draft, reports the existing actionable warning, and leaves the previous saved document intact.

Skill proficiency display is an optional appearance preference, independent of
the ratings. Template metadata declares supported modes and the default; the
Skills editor exposes only meaningful choices. Unsupported preferences resolve
to the active template's default without overwriting the saved choice. Templates
without display metadata remain text only. Unrated skills keep their names only;
the accessible preview summary retains every supplied rating in all visual modes.

Templates 013, 015, and 022 additionally support five-dot proficiency display. The optional
`dots` preference persists in version 2 drafts and backups, independently of
skill levels. Other templates fall back without replacing it, so returning to
either template restores dots. Existing `both` remains bars with named proficiency labels.

## Custom section headings

Optional `cv.headings` stores plain-text overrides keyed by logical section,
including `details` and the `additionalInformation` group. These are CV content,
not appearance or editor navigation labels. Overrides are trimmed, single-line,
and limited to 80 Unicode code points. Blank values resolve to defaults, never
hide headings or make empty sections visible. Invalid editor text stays local
until corrected; the canonical draft retains the last valid heading.

Template metadata declares supported heading keys and their default message
keys. The editor exposes controls only for those keys, even when the section is
empty. Overrides follow sections across templates and remain saved when not
displayed. Custom wording stays literal, including casing and document-language
changes; only defaults are translated. Group and member headings are independent.
PDF preview, download, and accessible preview resolve the same heading text.
Gallery samples continue using fictional content without custom headings.

Existing version 1/2 drafts and backups without headings keep their defaults.
Overrides autosave and round trip through version 2 backups. Start over and Load
example replace them along with CV content; color reset leaves them unchanged.

## Custom contact labels

Optional `cv.contactLabels` stores overrides for location, phone, email, website,
and LinkedIn labels. They are CV content, separate from section headings, contact
values, editor field names, and appearance. Overrides use the same trimmed,
single-line, 80-Unicode-code-point validation as section headings; invalid editor
text remains local and never replaces the last valid saved label. Clearing or
resetting one override restores its translated template default, not a hidden label.

Template `contactLabels` metadata declares only the contact fields that print
labels and supplies their default message keys. Personal-detail fields expose a
pencil control only for declared labels, including when their values are empty.
Templates without labels preserve saved overrides without adding captions. Custom
wording retains its casing and language across template/language changes. PDF
preview, download, and accessible preview use the same resolver; blank contact
values still omit their labels. Gallery samples remain independent of overrides.

Older drafts remain readable without this optional field. Overrides autosave and
round trip in version 2 backups. Start over and Load example replace them along
with CV content; appearance changes and color resets preserve them.

## Color customization

Color customization is an optional `appearance.colors` object with independent
heading, detail, body, decorative accent, and surface overrides. Existing drafts
retain their legacy accent and original renderer colors when overrides are absent.
Overrides autosave and round trip through version 2 backups without changing CV
content. Template definitions describe color-control defaults and surface support;
the picker never branches on template IDs. Shared PDF text applies explicit roles,
while concrete templates own decorative and background styling. Sidebar foregrounds
adapt to their surface for contrast. Reset colors removes overrides, not other settings.
Confirming a different template clears all color overrides and restores the default
legacy accent, matching its gallery sample. Confirming the active template,
reloading, or restoring a backup preserves colors. Both initial selection and the
gallery use this rule; CV content and other appearance settings stay unchanged.
Individual color controls remain available without preset palettes.

## PDF pipeline

The metadata-only registry dynamically loads renderers. PDF generation is debounced and serialized to avoid overlapping renderer operations. Outdated results are discarded, and download remains disabled while selected content is pending. PDF.js paints generated bytes onto a canvas; download uses the same blob. A separate accessible text view exposes document content to assistive technology.

Gallery thumbnails render the first page of a language-specific fictional CV in fixed A4, Forest, medium-text appearance. They load when visible and cache sample PDF promises in memory by template definition and language. The popup only renders these thumbnails, not a separate PDF workspace. Applying a template never copies sample content into the canonical draft. Sample and main-preview jobs share one renderer queue. Thumbnails never read or write browser storage.

Shared PDF sections handle repeated content and page breaks. Template modules own the page frame, typography, and styling. Arabic uses bundled Amiri fonts, contextual text direction, mirrored rows/spacing, and separately directed contact runs without Unicode control markers. Shared PDF text disables Amiri's `rlig` feature because it creates unattributed glyphs that corrupt the PDF text layer with this renderer; contextual letter shaping remains enabled. PDF.js previews use glyph outlines (`disableFontFace`) to avoid incorrect browser font-face glyph placement. Neither setting rasterizes downloaded PDF text. PDF.js extraction can infer additional whitespace within shaped words; tests separately check non-space character preservation, contacts, and page bounds. No duplicated HTML document template is maintained.

## Testing

Storage tests use in-memory adapters and cover incomplete/corrupt/newer data, unavailable storage, quota errors, and backups. Hook/component tests cover autosave guards and entry identity. Parameterized tests load every template and generate empty, example, and long PDFs; `pdf-lib` verifies real page counts. End-to-end tests check restoration, template changes, downloads, mobile rendering, and accessibility.

## Deliberate exclusions

No global state library, backend, generic plugin framework, speculative migrations, or arbitrary template-owned data blobs. Add abstractions only for concrete repeated behavior. If a new template needs additional content fields, change the domain and editor explicitly.
