import type {
  CvData,
  CvDocument,
  Education,
  Experience,
  Project,
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
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    languages: [],
    certifications: [],
    projects: [],
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
