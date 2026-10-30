import type { TemplateDefinition } from '../types'

export const sidebarTemplate = {
  id: 'sidebar',
  name: '003',
  typography: 'serif',
  layout: 'two-column',
  colorDefaults: {
    headings: '#202020',
    details: '#626b69',
    body: '#202020',
    surface: 'sidebar',
  },
  load: () => import('./Document').then((module) => module.SidebarDocument),
} satisfies TemplateDefinition
