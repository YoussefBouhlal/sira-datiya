import type { TemplateDefinition } from '../types'

export const classicTemplate = {
  id: 'classic',
  name: '001',
  typography: 'serif',
  load: () => import('./Document').then((module) => module.ClassicDocument),
} satisfies TemplateDefinition
