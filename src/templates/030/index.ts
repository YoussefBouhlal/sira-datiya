import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const diagonalTemplate = {
  id: 'diagonal',
  name: '030',
  typography: 'sans',
  layout: 'two-column',
  portraitShape: 'circle',
  headings: {
    ...defaultSectionHeadings,
    summary: 'About Me',
    details: 'Contact',
    experience: 'Experience',
  },
  colorDefaults: {
    headings: '#626262',
    details: '#707070',
    body: '#626262',
    surface: 'sidebar',
    surfaceColor: '#f5f5f5',
  },
  load: () => import('./Document').then((module) => module.DiagonalDocument),
} satisfies TemplateDefinition
