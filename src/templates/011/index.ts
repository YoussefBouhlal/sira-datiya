import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const sageTemplate = {
  id: 'sage',
  name: '011',
  typography: 'sans',
  portraitShape: 'square',
  layout: 'single-column',
  headings: {
    experience: 'Career Experience',
    education: defaultSectionHeadings.education,
    skills: defaultSectionHeadings.skills,
    projects: defaultSectionHeadings.projects,
    languages: defaultSectionHeadings.languages,
    certifications: defaultSectionHeadings.certifications,
    references: defaultSectionHeadings.references,
  },
  colorDefaults: {
    headings: '#6b8059',
    details: '#718263',
    body: '#292929',
    surface: 'band',
    surfaceColor: '#c2d2b3',
  },
  load: () => import('./Document').then((module) => module.SageDocument),
} satisfies TemplateDefinition
