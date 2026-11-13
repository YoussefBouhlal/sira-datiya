import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const mistTemplate = {
  id: 'mist',
  name: '027',
  typography: 'sans',
  layout: 'two-column',
  portraitShape: 'circle',
  headings: {
    ...defaultSectionHeadings,
    summary: 'About Me',
    experience: 'Work experience',
  },
  colorDefaults: {
    headings: '#364047',
    details: '#505b62',
    body: '#41494e',
    surface: 'sidebar',
    surfaceColor: '#d5dfe5',
  },
  load: () => import('./Document').then((module) => module.MistDocument),
} satisfies TemplateDefinition
