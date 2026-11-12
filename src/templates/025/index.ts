import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const silhouetteTemplate = {
  id: 'silhouette',
  name: '025',
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
    surfaceColor: '#333333',
    surfaceForeground: 'contrast',
  },
  load: () => import('./Document').then((module) => module.SilhouetteDocument),
} satisfies TemplateDefinition
