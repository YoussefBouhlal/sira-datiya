import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const ribbonTemplate = {
  id: 'ribbon',
  name: '020',
  typography: 'sans',
  layout: 'two-column',
  portraitShape: 'square',
  headings: {
    ...defaultSectionHeadings,
    experience: 'Work experience',
  },
  colorDefaults: {
    headings: '#202020',
    details: '#424242',
    body: '#424242',
  },
  load: () => import('./Document').then((module) => module.RibbonDocument),
} satisfies TemplateDefinition
