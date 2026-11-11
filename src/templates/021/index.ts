import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const folioTemplate = {
  id: 'folio',
  name: '021',
  typography: 'sans',
  layout: 'two-column',
  portraitShape: 'square',
  headings: {
    ...defaultSectionHeadings,
    experience: 'Professional Experience',
  },
  colorDefaults: {
    headings: '#303030',
    details: '#666666',
    body: '#505050',
  },
  load: () => import('./Document').then((module) => module.FolioDocument),
} satisfies TemplateDefinition
