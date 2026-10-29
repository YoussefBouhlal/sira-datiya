import type { TemplateDefinition } from '../types'

export const primeAtsTemplate = {
  id: 'prime-ats',
  name: '005',
  typography: 'sans',
  layout: 'single-column',
  load: () => import('./Document').then((module) => module.PrimeAtsDocument),
} satisfies TemplateDefinition
