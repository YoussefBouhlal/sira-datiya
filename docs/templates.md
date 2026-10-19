# Template guide

Templates are modules, not branches in the editor or PDF export feature. The only central list lives in `src/templates/registry.ts`.

## Add a template

1. Create `src/templates/<stable-id>/` with `Document.tsx`, `styles.ts`, and `index.ts`.
2. Implement a pure function accepting `TemplateProps` and returning a React PDF `<Document>` element. Use React PDF components, not HTML or DOM CSS. Honor common accent, font size, and page size preferences.
3. Export a definition satisfying `TemplateDefinition` from `index.ts`.
4. Import that definition in the registry and add it to the registered array.
5. Run `npm run check` and `npm run test:e2e`. The registry test automatically exercises all templates with empty, typical, and long CVs. Visually inspect page breaks and text selection too.

Example definition:

```ts
import type { TemplateDefinition } from '../types'

export const editorialTemplate = {
  id: 'editorial',
  name: 'Editorial',
  typography: 'serif',
  load: () => import('./Document').then((module) => module.EditorialDocument),
} satisfies TemplateDefinition
```

Keep IDs stable: they are persisted. `typography` is metadata for the picker illustration, not a renderer branch. The picker, preview, and download flow consume definitions automatically.

## Boundaries

Treat CV data as read-only. A renderer must not mutate it, access local storage, fetch remote assets, inspect editor state, or import another concrete template. Template-specific fonts/styles/assets belong with the template. Introduce shared PDF primitives in `templates/shared/` only for real common behavior. Existing shared content can be reused or a template can supply its own layout using the same CV model.

Missing optional sections should produce no empty headings. Preserve text rather than truncating it to one page. Avoid wrapping a long section in an unbreakable container. Check long names, URLs, multiline descriptions, and multiple pages. Bundle new fonts and document coverage/attribution; do not claim support for untested scripts.

## Remove a template

1. Remove its definition from the registry.
2. If it was the default, choose another registered default.
3. Delete its folder, exclusively owned assets, and dedicated tests.
4. Run the checks. Registry tests reject an empty list, duplicate IDs, and a missing default.

A saved removed ID resolves to the default without changing CV content. The next successful save stores the resolved ID. Do not add template-ID switch statements to compensate for removal.

## Extend the contract

New metadata should have an actual consumer. New content requires a deliberate domain/editor change and storage compatibility decision, not an opaque template-specific settings object. The current contract supports styling existing content, not arbitrary plugins.
