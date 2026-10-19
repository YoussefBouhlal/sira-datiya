# Sira Datiya development

- React, TypeScript, Vite, and npm. Keep the project a single package.
- Read docs/architecture.md and docs/templates.md before changing ownership or template contracts.
- Keep domain pure, features independent, and concrete templates isolated. The architecture test enforces imports.
- The app owns the canonical draft. Templates never read storage or editor state.
- Register templates explicitly; adding/removing a template must not change editor/export branches.
- Browser storage may fail. Preserve unreadable data and show actionable errors; never silently overwrite it.
- Keep personal information local. No analytics, remote fonts, or external services without an explicit decision.
- Use stable IDs, strict types, accessible native controls, local assets, and fictional test data.
- Run npm run check, npm run format:check, and npm run test:e2e for workflow changes.
- Setup is complete. No editor extensions are required. Development server task: Sira Datiya: development server.
- A project license must be selected by the owner before publishing.
