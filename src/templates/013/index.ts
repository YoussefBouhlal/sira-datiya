import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const framedTemplate = {
  id: 'framed',
  name: '013',
  typography: 'sans',
  layout: 'two-column',
  portraitShape: 'square',
  headings: {
    ...defaultSectionHeadings,
    experience: 'Work experience',
    details: 'Info',
  },
  colorDefaults: {
    headings: '#171717',
    details: '#626262',
    body: '#737373',
    surface: 'sidebar',
    surfaceColor: '#f3f3f3',
  },
  skillProficiencyDisplay: {
    modes: ['dots', 'bar', 'text', 'both'],
    defaultMode: 'dots',
  },
  load: () => import('./Document').then((module) => module.FramedDocument),
} satisfies TemplateDefinition
