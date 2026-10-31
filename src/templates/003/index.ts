import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const sidebarTemplate = {
  id: 'sidebar',
  name: '003',
  typography: 'serif',
  headings: {
    ...defaultSectionHeadings,
    details: 'Details',
    experience: 'Employment History',
  },
  layout: 'two-column',
  skillProficiencyDisplay: {
    modes: ['bar', 'text', 'both'],
    defaultMode: 'both',
  },
  colorDefaults: {
    headings: '#202020',
    details: '#626b69',
    body: '#202020',
    surface: 'sidebar',
  },
  load: () => import('./Document').then((module) => module.SidebarDocument),
} satisfies TemplateDefinition
