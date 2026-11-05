import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const charcoalTemplate = {
  id: 'charcoal',
  name: '012',
  typography: 'serif',
  portraitShape: 'circle',
  layout: 'single-column',
  headings: {
    ...defaultSectionHeadings,
    experience: 'Employment History',
  },
  colorDefaults: {
    headings: '#292929',
    details: '#505050',
    body: '#292929',
    surface: 'band',
    surfaceColor: '#303030',
    surfaceForeground: 'contrast',
  },
  skillProficiencyDisplay: {
    modes: ['bar', 'text', 'both'],
    defaultMode: 'bar',
  },
  load: () => import('./Document').then((module) => module.CharcoalDocument),
} satisfies TemplateDefinition
