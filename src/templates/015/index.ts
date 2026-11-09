import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const numberedTemplate = {
  id: 'numbered',
  name: '015',
  typography: 'serif',
  layout: 'two-column',
  portraitShape: 'square',
  headings: {
    ...defaultSectionHeadings,
    experience: 'Employment History',
  },
  colorDefaults: {
    headings: '#202020',
    details: '#404040',
    body: '#404040',
  },
  skillProficiencyDisplay: {
    modes: ['dots', 'bar', 'text', 'both'],
    defaultMode: 'dots',
  },
  load: () => import('./Document').then((module) => module.NumberedDocument),
} satisfies TemplateDefinition
