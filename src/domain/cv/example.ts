import type { CvData } from './types'

export function createExampleCv(): CvData {
  return {
    personal: {
      fullName: 'Alex Morgan',
      jobTitle: 'Product Designer',
      email: 'alex@example.com',
      phone: '+1 415 555 0142',
      location: 'San Francisco, CA',
      website: 'alexmorgan.example',
      linkedin: 'linkedin.com/in/alex-example',
      portrait: '',
    },
    summary:
      'Product designer turning complex problems into thoughtful, useful digital experiences. Six years of experience bringing clarity to ambitious products, from early research to the details that make them feel right.',
    experience: [
      {
        id: 'example-exp-1',
        role: 'Senior Product Designer',
        employer: 'Forma Studio',
        location: 'San Francisco, CA',
        startDate: '2022-03',
        endDate: '',
        current: true,
        description:
          'Led the redesign of a collaboration platform used by 20,000 teams.\nBuilt a design system that reduced delivery time by 30%.\nPartnered with research and engineering to simplify onboarding.',
      },
      {
        id: 'example-exp-2',
        role: 'Product Designer',
        employer: 'Fieldwork',
        location: 'Remote',
        startDate: '2019-06',
        endDate: '2022-02',
        current: false,
        description:
          'Designed end-to-end experiences for early-stage technology companies.\nHelped launch three products, from discovery through release.',
      },
    ],
    education: [
      {
        id: 'example-edu-1',
        degree: 'BFA, Communication Design',
        school: 'California College of the Arts',
        startDate: '2015-09',
        endDate: '2019-05',
        description: 'Graduated with distinction.',
      },
    ],
    skills: [
      'Product strategy',
      'User research',
      'Interaction design',
      'Design systems',
      'Figma',
      'Prototyping',
    ].map((name, index) => ({
      id: `example-skill-${index}`,
      name,
      level: null,
    })),
    languages: ['English (native)', 'French (conversational)'],
    certifications: [],
    projects: [],
    references: [],
  }
}
