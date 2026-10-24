import type { TemplateDefinition } from '../types'

export const pureAtsTemplate = {
  id: 'pure-ats',
  name: 'Pure ATS',
  typography: 'sans',
  layout: 'single-column',
  load: () => import('./Document').then((module) => module.PureAtsDocument),
} satisfies TemplateDefinition
