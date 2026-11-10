import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const editorialTemplate = {
  id: 'editorial',
  name: '016',
  typography: 'sans',
  layout: 'single-column',
  portraitShape: 'square',
  headings: {
    experience: 'Employment History',
    education: defaultSectionHeadings.education,
    skills: defaultSectionHeadings.skills,
    projects: defaultSectionHeadings.projects,
    languages: defaultSectionHeadings.languages,
    certifications: defaultSectionHeadings.certifications,
    references: defaultSectionHeadings.references,
  },
  colorDefaults: {
    headings: '#171717',
    details: '#242424',
    body: '#242424',
    surface: 'band',
    surfaceColor: '#f6eee2',
  },
  load: () => import('./Document').then((module) => module.EditorialDocument),
} satisfies TemplateDefinition
