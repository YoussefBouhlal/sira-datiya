import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const modernTemplate = {
  id: 'modern',
  name: '002',
  typography: 'sans',
  headings: defaultSectionHeadings,
  colorDefaults: { headings: 'accent', details: '#626b69', body: '#252b29' },
  load: () => import('./Document').then((module) => module.ModernDocument),
} satisfies TemplateDefinition
