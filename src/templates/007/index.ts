import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const executiveTemplate = {
  id: 'executive',
  name: '007',
  typography: 'sans',
  portraitShape: 'square',
  headings: {
    experience: 'Professional Experience',
    education: defaultSectionHeadings.education,
    skills: 'Areas of Expertise',
    projects: defaultSectionHeadings.projects,
    languages: defaultSectionHeadings.languages,
    certifications: defaultSectionHeadings.certifications,
    references: defaultSectionHeadings.references,
  },
  layout: 'single-column',
  colorDefaults: { headings: 'accent', details: 'accent', body: '#222222' },
  load: () => import('./Document').then((module) => module.ExecutiveDocument),
} satisfies TemplateDefinition
