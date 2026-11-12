import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const crestTemplate = {
  id: 'crest',
  name: '024',
  typography: 'sans',
  layout: 'two-column',
  portraitShape: 'circle',
  headings: {
    ...defaultSectionHeadings,
    summary: 'About me',
    details: 'Contact',
  },
  colorDefaults: {
    headings: '#292929',
    details: '#454545',
    body: '#454545',
    surface: 'sidebar',
    surfaceColor: '#f4f2f2',
  },
  load: () => import('./Document').then((module) => module.CrestDocument),
} satisfies TemplateDefinition
