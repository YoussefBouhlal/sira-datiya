import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const timelineTemplate = {
  id: 'timeline',
  name: '008',
  typography: 'sans',
  layout: 'two-column',
  portraitShape: 'square',
  headings: { ...defaultSectionHeadings, details: 'Details' },
  colorDefaults: {
    headings: '#292929',
    details: '#777777',
    body: '#454545',
  },
  skillProficiencyDisplay: {
    modes: ['bar', 'text', 'both'],
    defaultMode: 'both',
  },
  load: () => import('./Document').then((module) => module.TimelineDocument),
} satisfies TemplateDefinition
