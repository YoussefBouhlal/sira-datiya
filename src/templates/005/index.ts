import type { TemplateDefinition } from '../types'

export const primeAtsTemplate = {
  id: 'prime-ats',
  name: '005',
  typography: 'sans',
  layout: 'single-column',
  colorDefaults: { headings: 'accent', details: '#252a30', body: '#252a30' },
  load: () => import('./Document').then((module) => module.PrimeAtsDocument),
} satisfies TemplateDefinition
