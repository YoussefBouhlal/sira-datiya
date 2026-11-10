import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const floraTemplate = {
  id: 'flora',
  name: '017',
  typography: 'sans',
  layout: 'two-column',
  portraitShape: 'square',
  headings: {
    ...defaultSectionHeadings,
    experience: 'Employment History',
  },
  colorDefaults: {
    headings: '#985448',
    details: '#686253',
    body: '#403c35',
    surface: 'page',
    surfaceColor: '#f2f0e3',
  },
  skillProficiencyDisplay: {
    modes: ['bar', 'text', 'both'],
    defaultMode: 'bar',
  },
  load: () => import('./Document').then((module) => module.FloraDocument),
} satisfies TemplateDefinition
