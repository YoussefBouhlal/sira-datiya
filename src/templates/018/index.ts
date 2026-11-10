import { defaultSectionHeadings, type TemplateDefinition } from '../types'

export const confettiTemplate = {
  id: 'confetti',
  name: '018',
  typography: 'sans',
  portraitShape: 'square',
  headings: {
    ...defaultSectionHeadings,
    experience: 'Employment History',
  },
  colorDefaults: {
    headings: '#202020',
    details: '#707570',
    body: '#686e6a',
  },
  load: () => import('./Document').then((module) => module.ConfettiDocument),
} satisfies TemplateDefinition
