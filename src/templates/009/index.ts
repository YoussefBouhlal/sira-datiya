import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const columnarTemplate = {
  id: 'columnar',
  name: '009',
  typography: 'sans',
  layout: 'two-column',
  portraitShape: 'circle',
  headings: {
    ...defaultSectionHeadings,
    experience: 'Employment History',
    details: 'Details',
  },
  colorDefaults: {
    headings: '#252525',
    details: '#929292',
    body: '#252525',
    surface: 'sidebar',
    surfaceColor: '#0c2d4d',
  },
  skillProficiencyDisplay: {
    modes: ['bar', 'text', 'both'],
    defaultMode: 'bar',
  },
  load: () => import('./Document').then((module) => module.ColumnarDocument),
} satisfies TemplateDefinition
