import type { TemplateDefinition } from '../types'

export const pureAtsTemplate = {
  id: 'pure-ats',
  name: '006',
  typography: 'sans',
  layout: 'single-column',
  load: () => import('./Document').then((module) => module.PureAtsDocument),
} satisfies TemplateDefinition
