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

The app opens empty CVs in a dedicated template-selection screen before the six editor sections. This screen shares template choices and the selection popup with the styling gallery, but exposes no appearance controls. Applying a template changes only appearance and opens personal details. The existing Template & style section remains last and allows later changes without losing content.

Domain schema/defaults/types do not import React, browser storage, features, or templates. Types are inferred from Zod schemas to avoid two drifting versions of the model. Templates import domain types, the PDF library, and template-shared primitives, never forms or application state. HTML UI and PDF primitives are intentionally separate.

Each template and feature exposes one public entry. Internal files use direct relative imports. A TypeScript-AST architecture test enforces cross-module import boundaries, including dynamic template imports. No alias configuration or dependency-injection framework is necessary for the current size.

## Data flow

`useCvDocument` hydrates a validated document once and owns the canonical `CvDocument`. Controlled editor inputs patch that document immediately, so changing steps cannot discard unsent form state. Transient state such as the selected step, dialogs, and preview page stays local.

First-time visitors choose English, French, or Arabic before template selection. The app remembers this choice separately under `sira-datiya.language.v1` and immediately saves the selected document language. Untouched visits do not autosave before this choice. Existing saved drafts bypass the language screen, including appearance-only drafts. Reset retains the language preference; clearing browser data removes it. Storage failures retain the in-memory choice and show an actionable warning. The header language selector remains available throughout.

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

## Color customization

Color customization is an optional `appearance.colors` object with independent
heading, detail, body, decorative accent, and surface overrides. Existing drafts
retain their legacy accent and original renderer colors when overrides are absent.
Overrides autosave and round trip through version 2 backups without changing CV
content. Template definitions describe color-control defaults and surface support;
the picker never branches on template IDs. Shared PDF text applies explicit roles,
while concrete templates own decorative and background styling. Sidebar foregrounds
adapt to their surface for contrast. Reset removes overrides, not other settings.

## PDF pipeline

The metadata-only registry dynamically loads renderers. PDF generation is debounced and serialized to avoid overlapping renderer operations. Outdated results are discarded, and download remains disabled while selected content is pending. PDF.js paints generated bytes onto a canvas; download uses the same blob. A separate accessible text view exposes document content to assistive technology.

Gallery thumbnails render the first page of a language-specific fictional CV in fixed A4, Forest, medium-text appearance. They load when visible and cache sample PDF promises in memory by template definition and language. The popup only renders these thumbnails, not a separate PDF workspace. Applying a template never copies sample content into the canonical draft. Sample and main-preview jobs share one renderer queue. Thumbnails never read or write browser storage.

Shared PDF sections handle repeated content and page breaks. Template modules own the page frame, typography, and styling. Arabic uses bundled Amiri fonts, contextual text direction, mirrored rows/spacing, and separately directed contact runs without Unicode control markers. Shared PDF text disables Amiri's `rlig` feature because it creates unattributed glyphs that corrupt the PDF text layer with this renderer; contextual letter shaping remains enabled. PDF.js previews use glyph outlines (`disableFontFace`) to avoid incorrect browser font-face glyph placement. Neither setting rasterizes downloaded PDF text. PDF.js extraction can infer additional whitespace within shaped words; tests separately check non-space character preservation, contacts, and page bounds. No duplicated HTML document template is maintained.

## Testing

Storage tests use in-memory adapters and cover incomplete/corrupt/newer data, unavailable storage, quota errors, and backups. Hook/component tests cover autosave guards and entry identity. Parameterized tests load every template and generate empty, example, and long PDFs; `pdf-lib` verifies real page counts. End-to-end tests check restoration, template changes, downloads, mobile rendering, and accessibility.

## Deliberate exclusions

No global state library, backend, generic plugin framework, speculative migrations, or arbitrary template-owned data blobs. Add abstractions only for concrete repeated behavior. If a new template needs additional content fields, change the domain and editor explicitly.
