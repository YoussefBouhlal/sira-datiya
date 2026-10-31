import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const classicTemplate = {
  id: 'classic',
  name: '001',
  typography: 'serif',
  headings: defaultSectionHeadings,
  colorDefaults: { headings: '#171717', details: '#171717', body: '#171717' },
  load: () => import('./Document').then((module) => module.ClassicDocument),
} satisfies TemplateDefinition
