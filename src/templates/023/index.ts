import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const bandeauTemplate = {
  id: 'bandeau',
  name: '023',
  typography: 'sans',
  portraitShape: 'square',
  headings: {
    ...defaultSectionHeadings,
    summary: 'About me',
    experience: 'Professional Experience',
  },
  colorDefaults: {
    headings: '#292d38',
    details: '#505050',
    body: '#171717',
    surface: 'band',
    surfaceColor: '#eef1fc',
  },
  load: () => import('./Document').then((module) => module.BandeauDocument),
} satisfies TemplateDefinition
