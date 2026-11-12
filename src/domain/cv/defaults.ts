import type {
  CvData,
  CvDocument,
  Appearance,
  Education,
  Experience,
  Project,
  Reference,
  Skill,
} from './types'

const defaultAccent = '#177568'

export function createEmptyCv(): CvData {
  return {
    personal: {
      fullName: '',
      jobTitle: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      portrait: '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    languages: [],
    certifications: [],
    projects: [],
    references: [],
  }
}

export function createDocument(
  templateId: string,
  language: Appearance['language'] = 'en',
): CvDocument {
  return {
    cv: createEmptyCv(),
    appearance: {
      language,
      templateId,
      accent: defaultAccent,
      fontSize: 11,
      pageSize: 'A4',
    },
  }
}

export function selectTemplateAppearance(
  appearance: Appearance,
  templateId: string,
): Appearance {
  if (appearance.templateId === templateId) return appearance
  const { colors: previousColors, ...original } = appearance
  void previousColors
  return { ...original, templateId, accent: defaultAccent }
}

export function createExperience(id: string): Experience {
  return {
    id,
    role: '',
    employer: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  }
}

export function createEducation(id: string): Education {
  return {
    id,
    degree: '',
    school: '',
    startDate: '',
    endDate: '',
    description: '',
  }
}

export function createProject(id: string): Project {
  return { id, name: '', url: '', description: '' }
}

export function createSkill(id: string): Skill {
  return { id, name: '', level: null }
}

export function createReference(id: string): Reference {
  return { id, name: '', jobTitle: '', organization: '', email: '', phone: '' }
}

export const proficiencyLevels = [
  'Beginner',
  'Elementary',
  'Intermediate',
  'Advanced',
  'Expert',
] as const
