import { defaultSectionHeadings, type TemplateDefinition } from '../types'

const { summary: _summary, ...headings } = defaultSectionHeadings

export const atelierTemplate = {
  id: 'atelier',
  name: '019',
  typography: 'serif',
  layout: 'two-column',
  portraitShape: 'square',
  headings: { ...headings, experience: 'Work experience' },
  colorDefaults: {
    headings: '#714b3e',
    details: '#715f55',
    body: '#57483f',
    surface: 'page',
    surfaceColor: '#eee6da',
  },
  load: () => import('./Document').then((module) => module.AtelierDocument),
} satisfies TemplateDefinition
