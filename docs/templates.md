# Template guide

Templates are modules, not branches in the editor or PDF export feature. The only central list lives in `src/templates/registry.ts`. Templates 001 through 025 are registered; 002 remains the default.

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
| 007    | `executive`   |
| 008    | `timeline`    |
| 009    | `columnar`    |
| 010    | `ruled`       |
| 011    | `sage`        |
| 012    | `charcoal`    |
| 013    | `framed`      |
| 014    | `botanical`   |
| 015    | `numbered`    |
| 016    | `editorial`   |
| 017    | `flora`       |
| 018    | `confetti`    |
| 019    | `atelier`     |
| 020    | `ribbon`      |
| 021    | `folio`       |
| 022    | `gild`        |
| 023    | `bandeau`     |
| 024    | `crest`       |
| 025    | `silhouette`  |

Assign the next unused number explicitly in the definition, starting with 026. Never derive numbers from array positions, change them when sorting or filtering, or reuse retired numbers. Keep retired numbers in this table and mark them as retired. The registry rejects duplicate numbers and labels containing anything other than at least three Western digits.

## Add a template

1. Create `src/templates/<template-number>/` with `Document.tsx`, `styles.ts`, and `index.ts`, using the next unused number, such as `016`.
2. Implement a pure function accepting `TemplateProps` and returning a React PDF `<Document>` element. Use React PDF components, not HTML or DOM CSS. Honor common accent, font size, page size, and document language preferences.
3. Export a definition satisfying `TemplateDefinition` from `index.ts`.
4. Import that definition in the registry and add it to the registered array.
5. Run `npm run check` and `npm run test:e2e`. The registry test automatically exercises all templates with empty, typical, and long CVs. Visually inspect page breaks and text selection too.

Example definition:

```ts
import type { TemplateDefinition } from '../types'

export const editorialTemplate = {
  id: 'editorial',
  name: '016',
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

Executive (007) uses a spacious single-column Helvetica layout on white paper, with a mixed-case name and job title on the left and right-aligned contacts opposite. An optional square portrait sits beside the name. The profile has no heading, so this template does not expose a profile-heading control; saved profile headings remain intact for other templates. Accent-colored Professional Experience, Education, and Areas of Expertise headings have no rules. Experience leads with employer and location, then role, with dates aligned opposite; education leads with degree, then school. Description lines become bullets without duplicating supplied bullet or numbered markers. Expertise uses three columns in row-major order, retaining named proficiency levels. Projects, Languages, Certifications, and References follow when populated. A localized bottom-right footer reads Page 1 | 1, including the total page count. Arabic mirrors the directional layout and footer. Existing color roles, text sizes, and A4/Letter settings remain supported, and long content flows across pages. Cobalt is the closest existing accent to the reference; selecting the template never changes the person's colors or content.

Timeline (008) uses a centered identity header with an optional square portrait, condensed Oswald name and headings, and a compact job-title/location/phone line. Without a portrait, its space collapses. A narrow white sidebar holds Details, Skills, and Languages with small circular heading ornaments. The main column holds Profile, Experience, and Education with section icons and thin vertical timeline rails; Projects, Certifications, and References follow when populated. Description lines remain paragraphs and preserve supplied list markers. Rated skills support bars, named text, or both, defaulting to both; unrated skills show names only. Languages remain literal text without inferred ratings. Hobbies are omitted because the CV model has no hobbies field. Ink gives the closest monochrome match; choosing the template does not change existing colors or content. Color roles, custom headings, text sizes, A4/Letter paper, page numbers, optional portraits, and flowing multi-page content remain supported. Arabic uses Amiri and mirrors the sidebar, icons, and timeline rails.

008 bundles its own Oswald Regular in `src/templates/008/assets/`, alongside its original `OFL.txt`. It is Copyright 2016 The Oswald Project Authors and distributed under the SIL Open Font License 1.1, sourced from the `googlefonts/OswaldFont` repository. English/French headings use Oswald; body text uses Helvetica. Arabic and mixed-script headings use the shared Amiri fallback. The font is served locally and embedded in PDFs, never requested from a font service.

Columnar (009) uses a white 68% main column and a full-height navy 32% right sidebar. Its left-aligned identity pairs an optional circular portrait with a condensed Oswald name and small uppercase job title; portrait space collapses when absent. Profile, Employment History, Education, Projects, Certifications, and References occupy the main column. Employment and education combine titles with employer/school and location where supplied, with small uppercase dates below. Ordinary employment description lines become bullets without duplicating supplied bullet or numbered markers; other descriptions preserve their lines. Details, Skills, and Languages occupy the sidebar. Rated skills default to bars, support all three proficiency display modes, and honor a saved supported preference; unrated skills show names only. Empty sections are omitted. The navy surface repeats on every page while both columns flow once, without truncating content. Arabic mirrors the sidebar and identity and uses Amiri. Existing color overrides, custom headings, text sizes, A4/Letter paper, and page numbers remain supported. The pale backdrop and rounded corners of the visual reference are not part of the PDF paper.

009 owns a separate copy of Oswald Regular and its original `OFL.txt` under `src/templates/009/assets/`, with the same source and attribution as 008. It registers its own font family and never imports another concrete template's assets or implementation.

Ruled (010) uses a full-width uppercase Helvetica identity with the job title beneath and an optional square portrait opposite. Below a thin gray rule, a white 28% left sidebar holds labeled Info contacts, Skills, and Languages; a white 72% main column holds Profile, Employment History, Education, Projects, Certifications, and References. Uppercase section headings have short underlines, and a thin gray vertical rule separates the columns. Employment headers pair role and employer with location opposite and dates below. Ordinary employment description lines become bullets without duplicating existing list markers. Rated skills default to bars and support text or both; unrated skills and all languages remain literal text without inferred ratings. Empty sections are omitted, and both columns flow across pages without truncation. Arabic mirrors the columns and portrait and uses Amiri. Custom headings, color roles, text sizes, A4/Letter paper, and page numbers remain supported. Ink gives the closest monochrome match; selecting 010 does not change saved colors or content. No outer rounded frame or pale backdrop is included in the PDF.

Sage (011) uses a single-column Helvetica layout with a wide rounded pale-sage identity band, a mixed-case name on the left, and right-aligned contacts. An optional square portrait sits beside the name, with no reserved space when absent. The job title and unheaded profile follow below the band; the profile-heading control is omitted without discarding saved overrides. Large unruled Career Experience and Education headings use muted green. Experience leads with role, employer and location opposite dates; education combines degree and dates above the school. Description lines become bullets without duplicating existing bullet or numbered markers. Skills retain named proficiency labels; Projects, Languages, Certifications, and References follow when populated. The localized bottom-left footer reads Page 1, Page 2, and so on. Arabic uses Amiri and mirrors the header, dates and footer. Existing color roles, custom headings, text sizes, A4/Letter paper, and flowing multi-page content remain supported. Sage and green are template defaults; selecting 011 never replaces saved colors or content. The outer rounded page frame and pale backdrop of the reference are not part of the PDF.

Charcoal (012) uses a full-width charcoal header with a centered optional circular portrait, serif name, small uppercase job title, and separate wrapping contact strip. Missing portraits leave no reserved space. The white single-column body has Times-Bold section headings and Helvetica text, with role, employer and location above dates for experience, and degree and school above dates for education. Employment description lines become bullets without duplicating existing list markers. Skills use two columns in row-major order, defaulting to bars and supporting text or both; unrated skills show names only. Profile, Employment History, Education, Skills, Projects, Languages, Certifications, and References appear only when populated. The header flows once on the first page, while long body content continues onto subsequent pages without truncation. Arabic uses bundled Amiri and mirrors directional layout and skill columns. A localized bottom-right page number mirrors in Arabic. Existing color roles, custom headings, text sizes, A4/Letter paper, and portrait framing remain supported. Surface changes recolor the identity band and contact strip together; their text defaults to a contrasting foreground unless explicit heading/detail overrides are saved. Decorative lines and skill fills use the selected accent; Ink is closest to the reference. Choosing 012 never changes saved colors or content. The pale outer backdrop and rounded paper corners are not part of the PDF.

Framed (013) uses a centered Helvetica name and job title inside a wide white outlined identity box, overlapping a full-height pale-gray left sidebar. An optional square portrait appears beside the centered identity, with no reserved image space when absent. Info, Skills, and literal Languages occupy the sidebar; Profile, Work Experience, Education, Projects, Certifications, and References occupy the white main column when populated. Uppercase headings have full-width thin rules. Experience pairs role and employer with location opposite and dates beneath; education combines degree and school above dates. Description lines remain italic paragraphs and preserve supplied list markers. Rated skills default to five filled/outlined dots and also support bars, named text, or bars with named text; unrated skills show names only. The gray sidebar repeats while identity and content flow once across pages. Arabic mirrors the columns, contacts, portrait, dots, and footer using bundled Amiri. Custom headings, independent color roles, portrait framing, text sizes, A4/Letter paper, and page numbers remain supported. Ink gives the closest monochrome reference match; choosing 013 never replaces saved content or colors. No hobbies field or language ratings are inferred, and the outer rounded frame and pale backdrop are not part of the PDF.

Editorial (016) uses a warm cream intro band with an optional square portrait, Helvetica name and job title, opposite contacts, and an accent rule above location. Without a portrait, its space collapses. The unheaded summary uses the first blank-line-separated paragraph as a large lead and subsequent paragraphs at body size; a single paragraph stays entirely large. The profile-heading control is omitted without discarding saved overrides. Skills follow in three row-major columns with short dash markers and named proficiency when supplied. The white lower body uses split employment and education rows, with identity and dates on the left and bulleted descriptions on the right. Existing list markers are preserved. Projects, Certifications, literal Languages, and References follow when populated. The intro flows once, while long content continues without truncation or automatic shrinking. Arabic uses bundled Amiri and mirrors directional layouts and the localized page-number footer. Existing custom headings, independent color roles, portrait framing, text sizes, and A4/Letter paper remain supported. Surface recolors the intro band only. Choosing 016 never changes saved content or colors. The reference's outer backdrop and rounded paper corners are not PDF content.

Flora (017) uses warm ivory paper with original peach, olive, and accent botanical edge artwork. A centered organic portrait sits above a locally bundled condensed Oswald name, job title, and wrapping contact line. Missing portraits collapse their space. A narrow left sidebar holds Skills and literal Languages; the wider right column holds Profile, Employment History, Education, Projects, Certifications, and References when populated. Employment descriptions become bullets without duplicating supplied list markers. Rated skills default to continuous bars and support named text or bars with text; unrated skills and languages have no inferred ratings. Background and artwork repeat on subsequent pages while identity and content flow once, without truncation or automatic shrinking. Arabic uses bundled Amiri and mirrors the columns, spacing, and localized page-number footer. Custom headings, independent color roles, portrait framing, text sizes, and A4/Letter paper remain supported. Surface recolors the whole page; Accent controls rules, skill fills, and principal artwork, while secondary peach/olive artwork stays fixed. Choosing 017 never replaces saved content or colors. Grain texture, outer rounded corners, and the surrounding backdrop are not PDF content.

017 bundles its own Oswald Regular and original `OFL.txt` under `src/templates/017/assets/`, Copyright 2016 The Oswald Project Authors, distributed under the SIL Open Font License 1.1 and sourced from `googlefonts/OswaldFont`. It registers its own font family and never imports another concrete template's assets or implementation. All fonts are served locally and embedded in the PDF.

Confetti (018) uses white paper with original faint geometric outlines, a centered hexagonal portrait, bold Helvetica name, job title, and two-column labeled contacts. Without a portrait, its space collapses; the mask uses the prepared image and retains a square adjustment dialog. Profile, Employment History, Education, Skills, Projects, Languages, Certifications, and References have consecutive two-digit section numbers, omitting empty sections without gaps. Profile text sits beside its heading; dated entries pair a narrow date/location rail with a wider title and description column. Description lines become bullets without duplicating existing list markers. Skills show named proficiency when supplied; languages remain literal text. Artwork repeats on every page while identity and contacts flow once. Long content flows without truncation or automatic shrinking. Arabic uses bundled Amiri and mirrors rails, contacts, and the localized page-number footer. Existing custom headings, independent color roles, portrait framing, text sizes, and A4/Letter paper remain supported. Accent recolors the principal geometric outlines; secondary muted colors stay fixed. Paper stays white, and choosing 018 never changes saved content or colors. The reference's surrounding lavender backdrop and rounded paper corners are not PDF content.

Atelier (019) uses cream paper, a repeating muted-brown left sidebar, an optional tall arched portrait, and a brown identity band with a serif name, job title, and unheaded profile. The sidebar holds outlined contact capsules, Skills with named proficiency when supplied, and literal Languages. Work experience, Education, Projects, Certifications, and References occupy the main column, with serif headings in rounded bands. Original grid lines and star ornaments repeat on every page. Employment descriptions become bullets without duplicating supplied list markers. Empty sections are omitted; missing portraits leave no reserved portrait space. The arch crops the existing prepared square portrait without changing its framing or accessing its source; the adjustment dialog remains square. No achievements field, skill descriptions, reference photograph, or watermark is introduced. Identity content flows once, and long content continues without truncation or automatic shrinking. Arabic uses bundled Amiri and mirrors columns, contacts, and the footer. Custom headings, independent color roles, text sizes, A4/Letter paper, and localized page numbers remain supported. Surface recolors the cream paper; Accent controls principal grid/star decoration. Brown bands/sidebar retain their original colors, with light default text unless explicit text-role overrides are saved. Choosing 019 never changes saved content or colors. All fonts are existing bundled or standard PDF fonts; no remote assets are used.

Ribbon (020) uses white paper, a large uppercase Helvetica name and job title, optional square portrait beside the identity, and opposite phone/email/LinkedIn contacts with a vertical rule. A website ribbon follows the selected accent and includes a decorative quotation-mark tile; both disappear when no website is supplied. Location, Education, Skills, and literal Languages occupy the narrow left column; Profile, Work Experience, Projects, Certifications, and professional References occupy the wider right column. Profile text has a vertical accent rule, work entries have square markers and narrow date rails, and education uses stacked degree/school/date blocks. Section headings are uppercase; entry titles retain supplied casing, and letter spacing remains zero to preserve searchable PDF text. Employment description lines become bullets without duplicating supplied list markers. Skills remain a flat list with named proficiency when supplied; no categories or quotation fields are introduced. Empty sections and absent portraits leave no reserved space. Identity and contacts flow once while both columns continue across pages without truncation or automatic shrinking. Arabic uses bundled Amiri and mirrors columns, contacts, portrait, rules, and the localized page-number footer. Existing custom headings, independent color roles, portrait framing, text sizes, and A4/Letter paper remain supported. Choosing 020 never changes saved content or colors; selecting a yellow accent gives the closest ribbon match to the reference. The surrounding blue backdrop and rounded paper corners are not PDF content.

Folio (021) uses white paper with an uppercase Helvetica identity and compact two-column contacts at the top left, and a headed Profile at the top right behind a thin vertical rule. An optional square portrait sits beside the identity and leaves no reserved space when absent. A full-width horizontal divider precedes a narrow Education, Skills, and literal Languages column and a wider Professional Experience, Projects, Certifications, and References column, separated by a thin vertical rule. Sidebar sections have fine horizontal dividers. Employment headers combine role, employer, location, and dates; description lines become bullets without duplicating supplied list markers. Skills remain flat with named proficiency when supplied; no skill categories, awards, interests, or extracurricular fields are introduced. Empty sections are omitted. Identity and contacts flow once; long profiles and both body columns continue across pages without truncation or automatic shrinking. Arabic uses bundled Amiri and mirrors the header, contacts, columns, portrait, rules, and localized page-number footer. Custom headings, independent color roles, portrait framing, text sizes, A4/Letter paper, and selectable PDF text remain supported. Letter spacing stays zero to preserve searchable text. Rules use the selected accent; Ink gives the closest monochrome reference match. Choosing 021 never changes saved content or colors. The surrounding pale-blue backdrop and rounded paper corners are not PDF content.

Bandeau (023) uses white single-column paper with a centered uppercase Helvetica name, compact phone/email/location contacts, and pale blue-lavender chips for the existing website and LinkedIn fields. An optional square portrait sits beside the identity; absent portraits leave the name fully centered. About Me, Professional Experience, Education, Skills, Languages, Projects, Certifications, and References use centered uppercase heading bands. Entry headers combine role/degree, employer/school, location where supplied, and dates inline. Ordinary description lines have small accent-colored square markers; supplied bullet and numbered markers are preserved. Skills and literal languages form wrapping inline lists, with named proficiency when supplied. Empty sections are omitted. Long content flows across pages without truncation or automatic shrinking. Arabic uses bundled Amiri and mirrors directional layouts and the localized footer. Custom headings, independent color roles, text sizes, A4/Letter paper, portrait framing, and page numbers remain supported. Surface recolors heading bands and link chips together. Choosing 023 never changes saved content or colors. No extra social-link fields are introduced, and the reference's surrounding blue backdrop and rounded paper corners are not PDF content.

Crest (024) uses white paper with angled charcoal top and bottom bands, a pale-gray 43% left sidebar, and an optional large circular portrait with a white border. The sidebar holds About Me, Contact, Skills, and literal Languages; the main column holds a bold Helvetica identity, Education before Experience, then Projects, Certifications, and References. Icon headings and thin timeline rails frame dated entries. Employment and project description lines become bullets without duplicating supplied list markers; education descriptions remain literal text, including any supplied GPA. Skills use bullets with named proficiency when supplied. Empty sections are omitted, and missing portraits collapse their reserved space. Backgrounds and bands repeat while portrait, identity, and both columns flow once across pages without truncation or automatic shrinking. Arabic uses bundled Amiri and mirrors columns, portrait, rails, artwork, and the localized footer. Existing custom headings, independent color roles, portrait framing, text sizes, A4/Letter paper, and selectable text remain supported. Surface controls the sidebar; Accent controls band trim and timeline decoration, while charcoal bands remain fixed. A bronze custom accent gives the closest reference match; selecting 024 never changes saved colors or content. No additional fields or language ratings are introduced, and the reference's thin outer purple border is not PDF content.

Silhouette (025) uses white paper with a full-height charcoal 38% left sidebar and an optional large circular portrait overlapping its white upper opening. The sidebar holds About Me, Contact, Skills with named proficiency when supplied, and literal Languages. The white main column holds a bold mixed-case Helvetica identity, Education before Experience, then Projects, Certifications, and References. Icon headings and thin accent-colored timeline rails follow the reference. Employment and project descriptions become bullets without duplicating supplied list markers; education descriptions remain literal text. Empty sections are omitted, and missing portraits collapse their reserved space and the white opening. The charcoal sidebar repeats on every page while portrait, identity, and both columns flow once without truncation or automatic shrinking. Arabic uses bundled Amiri and mirrors columns, portrait, timeline rails, and the localized footer. Surface recolors the sidebar, whose text and icons default to a contrasting black or white unless their individual color roles are overridden. The main paper stays white. Custom headings, independent color roles, portrait framing, text sizes, A4/Letter paper, page numbers, and selectable text remain supported. Ink gives the closest monochrome reference match; selecting 025 never changes saved colors or content. No new fields or language ratings are introduced, and the reference's rounded outer frame and surrounding margin are not PDF content.

## Boundaries

Gild (022) uses white paper with a 65% main column and a full-height navy 35% right sidebar. A circular optional portrait sits beside an uppercase Helvetica name, gold job title, and compact location/phone/email contacts. Without a portrait, its space collapses. Profile, Work Experience, Education, Projects, Certifications, and References occupy the main column; Skills, literal Languages, and existing LinkedIn/website links occupy the sidebar. Its customizable Links heading uses the existing `details` heading key. Sidebar headings and employer/school text have gold defaults, while rules and proficiency markers follow the selected accent; choosing a gold custom accent gives the closest reference match. Rated skills default to five dots and support bars, named text, or bars with named text; unrated skills show names only. Descriptions become bullets without duplicating supplied list markers. Empty sections are omitted. The navy background repeats on every page while identity and both columns flow once without truncation or automatic shrinking. Arabic uses bundled Amiri and mirrors columns, portrait, contacts, dates, and the localized footer. Custom headings, independent color roles, portrait framing, text sizes, A4/Letter paper, selectable text, and page numbers remain supported. Choosing 022 never changes saved colors or content. No additional personal-detail fields, hobbies, publications, or language ratings are inferred from the reference, and its outer backdrop and rounded paper corners are not PDF content.

Numbered (015) uses a large uppercase Times-Roman identity, an optional square portrait opposite, Helvetica body text, and circled consecutive section numbers beside uppercase serif headings. Profile comes first; Skills and literal Languages share a row. Employment History and Education use paired entries in supplied, row-major order; Projects, Certifications, and References follow at full width. Empty sections are omitted and their numbers close up. Missing portraits collapse their space. Rated skills default to five filled/outlined dots and support bars, named levels, or bars with named levels; unrated skills show names only. Languages have no inferred ratings. Long content flows across pages without automatic font shrinking or truncation. Arabic uses bundled Amiri and mirrors directional layout, portrait, and footer. Existing custom headings, independent color roles, portrait framing, text sizes, A4/Letter paper, and localized page numbers remain supported. Ink gives the closest monochrome reference match; choosing 015 never changes saved colors or content. The surrounding pale backdrop and rounded paper corners are not PDF content.

Botanical (014) uses a pale-lavender page, original lavender/blush/accent botanical edge artwork, bold Helvetica identity and headings, and an unheaded profile beside an optional organic portrait. Employment History, Education, Projects, and Certifications occupy the wider left column; Details, Skills, literal Languages, and References occupy the right. Missing portraits collapse their space. Its renderer masks the prepared square portrait without reinterpreting framing; the crop dialog intentionally remains square. Rated skills default to five thin rectangular bar segments, one filled per proficiency level, and also support named text or bars with text. No new saved proficiency mode is introduced. Empty sections are omitted. Background and bottom artwork repeat across pages while identity, profile, and portrait flow once. Content remains selectable and continues without truncation on A4 and Letter. Arabic mirrors directional layout using bundled Amiri. Surface controls the whole page; Accent controls principal artwork and skill segments, while secondary lavender/blush artwork remains fixed. Choosing 014 never changes saved appearance or content. Outer rounded corners and the surrounding reference backdrop are not PDF content.

Optional `portraitShape` metadata declares `circle` or `square` for the portrait
adjustment dialog; omission means `circle`. Keep it consistent with the rendered
frame. Most frames have a square aspect ratio; 019 crops that prepared square
image into a tall arch without changing the adjustment contract.
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
`sidebar`, `band`, or `page` only when that template uses a colored surface. The picker
uses this metadata rather than template-ID conditions.

Optional `colorDefaults.surfaceColor` declares a fixed baseline surface color,
as used by 009's navy sidebar. Without it, sidebar defaults retain their
darkened legacy accent. The renderer and color controls use the same resolution;
saved surface overrides take precedence and resetting colors restores the baseline.

Optional `colorDefaults.surfaceForeground: 'contrast'` declares an adaptive black/white band foreground, as used by 012. The band contrast warning checks that foreground unless a heading override is saved; body heading defaults remain independent.

Paper remains white except for 014, 017, and 019's explicitly supported full-page surfaces (`surface: 'page'`). Their contrast warnings compare all text roles against the chosen page background. Template 003 automatically chooses black or white sidebar
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

`appearance.skillProficiencyDisplay` optionally stores `bar`, `text`, `both`, or `dots`.
It applies to all rated skills without changing their ratings. Unrated skills
show only their names. Missing preferences preserve each template's original
presentation; existing drafts and version 1/2 backups remain readable.

Definitions may declare `skillProficiencyDisplay` metadata with supported `modes`
and a `defaultMode` contained in that list. Omitted metadata means text only.
Templates 003, 008, 009, 010, 012, 014, and 017 support bar, text, and both. 003 and 008 default to both;
009, 010, 012, 014, and 017 default to bars. Templates 013, 015, and 022 support those modes plus dots and default to dots. Dots render five circles with one filled circle per proficiency level; both continues to mean bars with named levels. The other templates remain text only.
`resolveSkillProficiencyDisplay` resolves a supported preference
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
