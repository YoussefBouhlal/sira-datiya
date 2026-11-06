import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const botanicalTemplate = {
  id: 'botanical',
  name: '014',
  typography: 'sans',
  layout: 'two-column',
  portraitShape: 'square',
  headings: {
    experience: 'Employment History',
    education: defaultSectionHeadings.education,
    skills: defaultSectionHeadings.skills,
    projects: defaultSectionHeadings.projects,
    languages: defaultSectionHeadings.languages,
    certifications: defaultSectionHeadings.certifications,
    references: defaultSectionHeadings.references,
    details: 'Details',
  },
  colorDefaults: {
    headings: '#103d6a',
    details: '#505b70',
    body: '#26262c',
    surface: 'page',
    surfaceColor: '#f7f6ff',
  },
  skillProficiencyDisplay: {
    modes: ['bar', 'text', 'both'],
    defaultMode: 'bar',
  },
  load: () => import('./Document').then((module) => module.BotanicalDocument),
} satisfies TemplateDefinition
