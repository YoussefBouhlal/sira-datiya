# Template guide

Templates are modules, not branches in the editor or PDF export feature. The only central list lives in `src/templates/registry.ts`. Templates 001 through 006 are registered; 002 remains the default.

## Template numbers

Each definition's `name` is its permanent, zero-padded template number. Its folder uses the same number, for example `src/templates/001/`. Visible template labels and accessible actions use this number in every language, including Western digits in Arabic. Gallery thumbnails have no captions or check icons, and the popup has no filters or totals. Ready previews do not display a template-number or paper-size caption. Internal IDs remain unchanged because saved drafts and backups use them; they do not need to match folder names.

| Number | Stable ID     |
| ------ | ------------- |
| 001    | `classic`     |
| 002    | `modern`      |
| 003    | `sidebar`     |
| 004    | `traditional` |
| 005    | `prime-ats`   |
| 006    | `pure-ats`    |

Assign the next unused number explicitly in the definition, starting with 007. Never derive numbers from array positions, change them when sorting or filtering, or reuse retired numbers. Keep retired numbers in this table and mark them as retired. The registry rejects duplicate numbers and labels containing anything other than at least three Western digits.

## Add a template

1. Create `src/templates/<template-number>/` with `Document.tsx`, `styles.ts`, and `index.ts`, using the next unused number, such as `007`.
2. Implement a pure function accepting `TemplateProps` and returning a React PDF `<Document>` element. Use React PDF components, not HTML or DOM CSS. Honor common accent, font size, page size, and document language preferences.
3. Export a definition satisfying `TemplateDefinition` from `index.ts`.
4. Import that definition in the registry and add it to the registered array.
5. Run `npm run check` and `npm run test:e2e`. The registry test automatically exercises all templates with empty, typical, and long CVs. Visually inspect page breaks and text selection too.

Example definition:

```ts
import type { TemplateDefinition } from '../types'

export const editorialTemplate = {
  id: 'editorial',
  name: '007',
  typography: 'serif',
  load: () => import('./Document').then((module) => module.EditorialDocument),
} satisfies TemplateDefinition
```

Keep IDs stable: they are persisted. `typography` describes the design, not a renderer branch. The gallery, preview, and download flow consume definitions automatically. Gallery thumbnails are generated locally from each actual renderer using consistent fictional content and a neutral gray sample portrait in the template's existing portrait layout; no separate illustration or thumbnail asset needs to be maintained. The sample portrait belongs only to gallery thumbnails, never to Load example, the person's CV preview, or their downloaded PDF.

Optional `layout` metadata (`single-column` or `two-column`) describes the design; it is not displayed in the selected-template summary. That summary shows only the thumbnail and Browse templates button, without a template number or layout label. Omitted layout means single-column. Keep this metadata consistent with the actual design; the renderer still owns the column layout. Sidebar uses `two-column`. Its sidebar background repeats on every PDF page, while identity and contact content flow once. Both columns may continue onto later pages. It renders skill proficiency as bars with named levels; Classic and Studio use named text levels. All templates render portraits and references when supplied.

Classic uses a compact centered serif identity header, separate contact and website lines, accent-colored horizontal rules, and a narrow date rail beside experience and education. Profile text sits beside its section label; languages use two columns without interpreting supplied language strings. Description lines become bullets, preserving existing bullet markers. Skills retain their flat list and named proficiency; projects, certifications, and references follow the main sections. Optional portraits, text and paper sizes, page numbers, and flowing multi-page content remain supported. No personal-detail fields or skill categories are inferred from existing content.

Traditional uses a centered serif name, job title, and location, with phone left and email right on a separate contact row. Double rules and underlined uppercase headings use the selected accent; section bands remain light gray. The profile is centered and italic. Experience and education titles have diamond markers and dotted leaders to right-aligned dates. Ordinary description lines are italic paragraphs; explicit bullet and numbered-list markers are preserved without adding bullets to prose. Skills, languages, projects, certifications, and professional references follow education when populated. Websites, LinkedIn, named skill proficiency, optional square portraits, page numbers, text sizes, both paper sizes, and flowing multi-page content remain supported. The Ink accent gives the closest monochrome presentation.

Prime ATS uses a compact single-column sans-serif layout, uppercase accent-colored identity, an optional square portrait at the top right, a horizontal contact line, and uppercase headings framed by thin accent rules. Experience and education have right-aligned dates and bulleted description lines, preserving existing bullet and numbered-list markers. Technical skills use four columns in row-major reading order with named proficiency labels. Projects follow skills; Additional Information groups existing languages and certifications, followed by References. Empty sections are omitted. The selected accent, font size, A4/Letter paper size, page numbers, and flowing multi-page content remain supported; Cobalt gives the closest match to the visual reference. ATS-oriented means a text-first design with selectable PDF text and tested extraction order, not guaranteed compatibility with every applicant-tracking system. No awards field or sample identity is inferred from the reference.

Pure ATS uses a compact single-column Helvetica layout with a left-aligned mixed-case name, optional job title and square portrait, and a horizontal contact line ordered location, email, phone, website, and LinkedIn. Mixed-case Profile, Professional Experience, Education, and Areas of Expertise headings have thin bottom rules in the selected accent. Experience combines role, employer, and location in a bold header with dates below; education leads with the school, then degree and dates. Description lines become bullets without duplicating existing bullet or numbered markers. Skills use four columns in row-major reading order with named proficiency when supplied. Projects, Languages, Certifications, and References follow as separate sections, with empty sections omitted. The bottom-right footer reads Page 1, Page 2, and so on. Existing text-size and A4/Letter settings are honored, and long content flows across pages rather than being truncated. Ink gives the closest match to the reference. Like Prime ATS, this is a selectable, text-first PDF design, not a guarantee of compatibility with every applicant-tracking system.

## Boundaries

Optional `portraitShape` metadata declares `circle` or `square` for the portrait
adjustment dialog; omission means `circle`. Keep it consistent with the rendered
frame. All current frames have a square aspect ratio, regardless of their mask.
Templates render the already-framed `cv.personal.portrait` image as before; they
do not reinterpret `portraitFraming` or read adjustment state. One framing choice
follows the portrait across templates, and preview/download use the same image.

Treat CV data as read-only. A renderer must not mutate it, access local storage, fetch remote assets, inspect editor state, or import another concrete template. Template-specific fonts/styles/assets belong with the template. Introduce shared PDF primitives in `templates/shared/` only for real common behavior. Existing shared content can be reused or a template can supply its own layout using the same CV model.

Missing optional sections should produce no empty headings. Preserve text rather than truncating it to one page. Avoid wrapping a long section in an unbreakable container. Check long names, URLs, multiline descriptions, and multiple pages. Bundle new fonts and document coverage/attribution; do not claim support for untested scripts.

## Color roles

`appearance.colors` contains optional six-digit hex overrides for `headings`,
`details`, `body`, `accent`, and `surface`. Missing roles retain the renderer's
original styling and legacy `appearance.accent`; changing one role must not
recolor untouched roles. Reset colors removes all overrides, preserving the legacy
accent and every other appearance setting. Custom schemes carry across templates.

Pass `appearance.colors` to `PdfLanguage`. Shared `Text` defaults to the body
role; mark names, section headings and entry titles with `colorRole="headings"`,
and subtitles, employers, secondary school information, dates, contacts,
proficiency labels and footers with `colorRole="details"`. Mixed lines use nested
text spans, retaining original colors when the corresponding override is absent.
`ContactText` applies the details role, including Arabic contact runs. Resolve
decorative rules, markers and borders from `colors.accent ?? appearance.accent`.

Definitions expose `colorDefaults` for the appearance controls, not renderer
branching. `headings` and `details` may use the literal `accent` for a legacy
accent-derived default. The baseline swatches represent a role even when the
original template uses several shades for its elements. Specify `surface` as
`sidebar` or `band` only when that template uses a colored surface. The picker
uses this metadata rather than template-ID conditions.

Paper remains white. Template 003 automatically chooses black or white sidebar
foregrounds and graphics for the selected surface; main-column roles remain
independent. Template 004 uses the surface override for heading bands. Other
templates retain surface choices without exposing an unused control. Low text
contrast against white paper or heading bands produces a non-blocking warning.
Palettes replace all five roles; subsequent edits remain independent. Gallery
thumbnails retain their fixed sample appearance.

## Section headings

Definitions declare `headings`, a map from supported logical section keys to
default English message keys. Reuse `defaultSectionHeadings` for the common
sections and override wording or add supported keys explicitly. Omitted keys
have no editor control; do not introduce new layout headings for saved overrides.
Template 003 supports `details`; 005 additionally supports the independent
`additionalInformation` group and its `languages`/`certifications` member labels.

Pass `cv.headings` and the definition's `headings` as `headings` and
`headingDefaults` to the outer `PdfLanguage`. Shared PDF components resolve
logical keys with `usePdfTranslation().heading`. Nested `PdfLanguage` providers
inherit heading settings. Use the shared `Text` component's `section` prop for
headings with case transforms so custom casing stays literal. Renderers outside
that provider's context can call `resolveSectionHeading` with document language.
Never translate the resolved custom text again. Preserve existing conditional
section rendering and allow long headings to wrap without clipping.

## Skill proficiency display

`appearance.skillProficiencyDisplay` optionally stores `bar`, `text`, or `both`.
It applies to all rated skills without changing their ratings. Unrated skills
show only their names. Missing preferences preserve each template's original
presentation; existing drafts and version 1/2 backups remain readable.

Definitions may declare `skillProficiencyDisplay` metadata with supported `modes`
and a `defaultMode` contained in that list. Omitted metadata means text only.
Template 003 supports all three modes and defaults to both; the other templates
remain text only. `resolveSkillProficiencyDisplay` resolves a supported preference
or the template default without modifying the saved preference. Switching back
to a supporting template restores the user's choice.

The Skills section exposes a native selector only when multiple modes are
supported, using metadata rather than template IDs. Renderers use the same
resolution rule. The preference autosaves and survives backup export/import;
preview and download share the generated PDF. The app's accessible text summary
continues exposing rated levels even when their visible labels are hidden.

## Document language

Every template supports English, French, and Modern Standard Arabic through `appearance.language`. Keep `<Document>` as the root, set its language metadata, and wrap its page content in `PdfLanguage`. Apply `pageLanguageStyle` after page styles. Use the shared PDF `Text`, `View`, and `Image` components so font selection, RTL rows, and directional spacing remain consistent. Translate generated headings and proficiency labels explicitly; never pass personal content through the message catalogue. Use the common date formatter for full localized month names with Western digits, and `ContactText` when combining Latin contact fields with Arabic text. Do not insert Unicode bidi-control markers: this font/renderer combination can draw them as visible glyphs.

Amiri Regular, Bold, Italic, and Bold Italic are bundled under `public/fonts/amiri/`, with the original SIL Open Font License in `OFL.txt`. Copyright belongs to the Amiri Project Authors. These assets are served locally, not fetched from a font service. Arabic fonts need not match the template's Latin font. Preserve the shared shaping settings and test both PDF extraction and visible glyph rendering when changing fonts; generation or selected-word extraction alone is insufficient.

## Remove a template

1. Remove its definition from the registry.
2. If it was the default, choose another registered default.
3. Delete its folder, exclusively owned assets, and dedicated tests.
4. Run the checks. Registry tests reject an empty list, duplicate IDs or numbers, invalid numbers, and a missing default. Mark the number as retired in the table above; do not reassign it.

A saved removed ID resolves to the default without changing CV content. The next successful save stores the resolved ID. Do not add template-ID switch statements to compensate for removal.

## Extend the contract

New metadata should have an actual consumer. New content requires a deliberate domain/editor change and storage compatibility decision, not an opaque template-specific settings object. The current contract supports styling existing content, not arbitrary plugins.
