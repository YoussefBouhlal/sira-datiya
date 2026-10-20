import type {
  CvData,
  CvDocument,
  Education,
  Experience,
  Project,
  Reference,
  Skill,
} from './types'

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

export function createDocument(templateId: string): CvDocument {
  return {
    cv: createEmptyCv(),
    appearance: { templateId, accent: '#177568', fontSize: 11, pageSize: 'A4' },
  }
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
