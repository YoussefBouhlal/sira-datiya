import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const blushTemplate = {
  id: 'blush',
  name: '028',
  typography: 'serif',
  layout: 'two-column',
  portraitShape: 'square',
  headings: {
    ...defaultSectionHeadings,
    summary: 'About me',
    details: 'Contact',
    experience: 'Work experience',
  },
  colorDefaults: {
    headings: '#303030',
    details: '#555555',
    body: '#555555',
    surface: 'sidebar',
    surfaceColor: '#f1dede',
  },
  load: () => import('./Document').then((module) => module.BlushDocument),
} satisfies TemplateDefinition
