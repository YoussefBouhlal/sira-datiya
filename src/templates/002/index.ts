import type { TemplateDefinition } from '../types'

export const modernTemplate = {
  id: 'modern',
  name: '002',
  typography: 'sans',
  load: () => import('./Document').then((module) => module.ModernDocument),
} satisfies TemplateDefinition
