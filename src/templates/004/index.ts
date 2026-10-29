import type { TemplateDefinition } from '../types'

export const traditionalTemplate = {
  id: 'traditional',
  name: '004',
  typography: 'serif',
  load: () => import('./Document').then((module) => module.TraditionalDocument),
} satisfies TemplateDefinition
