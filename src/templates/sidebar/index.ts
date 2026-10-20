import type { TemplateDefinition } from '../types'

export const sidebarTemplate = {
  id: 'sidebar',
  name: 'Sidebar',
  typography: 'serif',
  layout: 'two-column',
  load: () => import('./Document').then((module) => module.SidebarDocument),
} satisfies TemplateDefinition
