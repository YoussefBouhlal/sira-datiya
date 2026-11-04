import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const ruledTemplate = {
  id: 'ruled',
  name: '010',
  typography: 'sans',
  layout: 'two-column',
  portraitShape: 'square',
  headings: {
    ...defaultSectionHeadings,
    experience: 'Employment History',
    details: 'Info',
  },
  colorDefaults: {
    headings: '#171717',
    details: '#737373',
    body: '#737373',
  },
  skillProficiencyDisplay: {
    modes: ['bar', 'text', 'both'],
    defaultMode: 'bar',
  },
  load: () => import('./Document').then((module) => module.RuledDocument),
} satisfies TemplateDefinition
