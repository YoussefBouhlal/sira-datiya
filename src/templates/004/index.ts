import type { TemplateDefinition } from '../types'

export const traditionalTemplate = {
  id: 'traditional',
  name: '004',
  typography: 'serif',
  colorDefaults: {
    headings: 'accent',
    details: '#171717',
    body: '#171717',
    surface: 'band',
  },
  load: () => import('./Document').then((module) => module.TraditionalDocument),
} satisfies TemplateDefinition
