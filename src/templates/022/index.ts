import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const gildTemplate = {
  id: 'gild',
  name: '022',
  typography: 'sans',
  layout: 'two-column',
  portraitShape: 'circle',
  headings: {
    ...defaultSectionHeadings,
    experience: 'Work experience',
    details: 'Links',
  },
  colorDefaults: {
    headings: '#292929',
    details: '#626262',
    body: '#444444',
    surface: 'sidebar',
    surfaceColor: '#303b4d',
  },
  skillProficiencyDisplay: {
    modes: ['dots', 'bar', 'text', 'both'],
    defaultMode: 'dots',
  },
  load: () => import('./Document').then((module) => module.GildDocument),
} satisfies TemplateDefinition
