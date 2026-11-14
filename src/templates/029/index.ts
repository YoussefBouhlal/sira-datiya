import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const azureTemplate = {
  id: 'azure',
  name: '029',
  typography: 'sans',
  layout: 'two-column',
  portraitShape: 'square',
  headings: {
    ...defaultSectionHeadings,
    summary: 'About Me',
    experience: 'Work experience',
  },
  colorDefaults: {
    headings: '#222222',
    details: '#41494e',
    body: '#222222',
    surface: 'sidebar',
    surfaceColor: '#d7e0eb',
  },
  load: () => import('./Document').then((module) => module.AzureDocument),
} satisfies TemplateDefinition
