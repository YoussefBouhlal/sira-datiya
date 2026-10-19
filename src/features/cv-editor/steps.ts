export const editorSteps = [
  { id: 'personal', label: 'Personal details', shortLabel: 'About you' },
  { id: 'summary', label: 'Professional summary', shortLabel: 'Summary' },
  { id: 'experience', label: 'Work experience', shortLabel: 'Experience' },
  { id: 'education', label: 'Education', shortLabel: 'Education' },
  { id: 'skills', label: 'Skills & extras', shortLabel: 'Skills & extras' },
  { id: 'design', label: 'Template & style', shortLabel: 'Template & style' },
] as const

export type EditorStep = (typeof editorSteps)[number]['id']
