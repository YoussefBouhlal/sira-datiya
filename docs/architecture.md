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
    classic/                 Definition, document and styles
    modern/                  Studio definition, document and styles
    sidebar/                 Two-column Sidebar definition, document and styles
    traditional/             Traditional definition, document and styles
    prime-ats/               Prime ATS definition, document and styles
    pure-ats/                Pure ATS definition, document and styles
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

The template picker receives thumbnail and inspection render slots from the app. The app supplies the PDF feature through those slots; the picker never imports PDF generation or concrete templates. Gallery search, layout filtering, and tentative selection are local to the picker. Only an explicit Use template action updates canonical appearance; closing the gallery discards the tentative choice. Opening the gallery resets search and filters and highlights the current template.

The app opens empty CVs in a dedicated template-selection screen before the six editor sections. This screen shares template choices and inspection with the styling gallery, but exposes no appearance controls. Applying a template changes only appearance and opens personal details. The existing Template & style section remains last and allows later changes without losing content.

Domain schema/defaults/types do not import React, browser storage, features, or templates. Types are inferred from Zod schemas to avoid two drifting versions of the model. Templates import domain types, the PDF library, and template-shared primitives, never forms or application state. HTML UI and PDF primitives are intentionally separate.

Each template and feature exposes one public entry. Internal files use direct relative imports. A TypeScript-AST architecture test enforces cross-module import boundaries, including dynamic template imports. No alias configuration or dependency-injection framework is necessary for the current size.

## Data flow

`useCvDocument` hydrates a validated document once and owns the canonical `CvDocument`. Controlled editor inputs patch that document immediately, so changing steps cannot discard unsent form state. Transient state such as the selected step, dialogs, and preview page stays local.

Initial navigation depends on CV content, not the presence of a storage key: empty drafts, including appearance-only drafts, open template selection with their existing template highlighted. Any personal detail, summary, or section entry opens the editor directly. Applying a template keeps the editor open for that session even before typing; reloading an empty draft opens selection again. Successful reset returns to selection. Restoring a backup follows the same content rule. Unreadable storage stays in the editor recovery flow rather than being mistaken for a new CV.

The hook debounces saves by 350 ms and flushes the latest rendered document on `pagehide` or when hidden. Storage operations return explicit results. Failed saves retain the in-memory draft. Corrupt or unsupported saved data blocks automatic writing; only a confirmed reset or restore replaces it. State is private to one browser profile, not synchronized across tabs or devices. Simultaneous tabs are last-write-wins.

Saved JSON has version `2`, `cv`, and `appearance`. Version `1` documents and backups remain readable: skill-name strings become unrated skill entries with deterministic, position-based IDs, and absent portrait/reference fields receive empty defaults. Reading never writes the migration back; the next successful save or backup emits version `2`. The storage key remains unchanged so existing drafts are discovered. Unsupported versions still block automatic writing. Content and appearance are separate; the domain accepts unknown template IDs. The app resolves a missing ID to the registry default before the next save.

`appearance.language` is the single document language (`en`, `fr`, or `ar`). It controls the interface, generated CV labels, dates, and fictional samples, never the person's entered content. Older documents without this field default to English without writing during load. Only new drafts detect the first supported browser language, with English fallback. Reloads and backup restores use the saved language; reset preserves it. There are no separate per-language drafts or automatic translation services.

The app sets HTML language and direction from that canonical setting and supplies a UI language context. Pure message/date helpers live in `i18n`; features stay independent. Dates use full localized Gregorian month names and Western digits. Templates receive language through appearance, never UI context or storage. Gallery thumbnail caches are keyed by both template definition and language.

Skills have stable IDs and optional five-level proficiency ratings. References have stable IDs and an explicit user-controlled order. Portraits are optional local PNG/JPEG uploads, center-cropped and resized to 512 square pixels and re-encoded as JPEG data URLs of at most 270,000 characters before entering the canonical draft. No remote image sources are accepted. Portraits and references are CV content, so backups and all templates preserve them.

## PDF pipeline

The metadata-only registry dynamically loads renderers. PDF generation is debounced and serialized to avoid overlapping renderer operations. Outdated results are discarded, and download remains disabled while selected content is pending. PDF.js paints generated bytes onto a canvas; download uses the same blob. A separate accessible text view exposes document content to assistive technology.

Gallery thumbnails render the first page of a language-specific fictional CV in fixed A4, Forest, medium-text appearance. They load when visible and cache sample PDF promises in memory by template definition and language. Opening-screen inspection also uses fictional content; the later styling gallery inspection uses the user's CV. Both honor current appearance preferences and the tentative template, including page navigation but no download action. Applying a template never copies sample content into the canonical draft. Sample, inspection, and main-preview jobs share one renderer queue. Neither thumbnails nor inspection read or write browser storage.

Shared PDF sections handle repeated content and page breaks. Template modules own the page frame, typography, and styling. Arabic uses bundled Amiri fonts, contextual text direction, mirrored rows/spacing, and separately directed contact runs without Unicode control markers. Shared PDF text disables Amiri's `rlig` feature because it creates unattributed glyphs that corrupt the PDF text layer with this renderer; contextual letter shaping remains enabled. PDF.js previews use glyph outlines (`disableFontFace`) to avoid incorrect browser font-face glyph placement. Neither setting rasterizes downloaded PDF text. PDF.js extraction can infer additional whitespace within shaped words; tests separately check non-space character preservation, contacts, and page bounds. No duplicated HTML document template is maintained.

## Testing

Storage tests use in-memory adapters and cover incomplete/corrupt/newer data, unavailable storage, quota errors, and backups. Hook/component tests cover autosave guards and entry identity. Parameterized tests load every template and generate empty, example, and long PDFs; `pdf-lib` verifies real page counts. End-to-end tests check restoration, template changes, downloads, mobile rendering, and accessibility.

## Deliberate exclusions

No global state library, backend, generic plugin framework, speculative migrations, or arbitrary template-owned data blobs. Add abstractions only for concrete repeated behavior. If a new template needs additional content fields, change the domain and editor explicitly.
