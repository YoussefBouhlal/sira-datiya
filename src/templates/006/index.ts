import type { TemplateDefinition } from '../types'

export const pureAtsTemplate = {
  id: 'pure-ats',
  name: '006',
  typography: 'sans',
  layout: 'single-column',
  colorDefaults: { headings: '#222222', details: '#222222', body: '#222222' },
  load: () => import('./Document').then((module) => module.PureAtsDocument),
} satisfies TemplateDefinition
