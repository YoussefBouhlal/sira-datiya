import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const plumTemplate = {
  id: 'plum',
  name: '026',
  typography: 'sans',
  layout: 'two-column',
  portraitShape: 'circle',
  headings: { ...defaultSectionHeadings, details: 'Contact' },
  colorDefaults: {
    headings: '#58253f',
    details: '#555158',
    body: '#454248',
    surface: 'sidebar',
    surfaceColor: '#f0eef1',
  },
  load: () => import('./Document').then((module) => module.PlumDocument),
} satisfies TemplateDefinition
