import type { TemplateDefinition } from '../types'

export const classicTemplate = {
  id: 'classic',
  name: 'Classic',
  typography: 'serif',
  load: () => import('./Document').then((module) => module.ClassicDocument),
} satisfies TemplateDefinition
