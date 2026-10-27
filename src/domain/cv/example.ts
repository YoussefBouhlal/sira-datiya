import type { CvData } from './types'
import type { Language } from '../../i18n/messages'

export function createExampleCv(language: Language = 'en'): CvData {
  const cv: CvData = {
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
  if (language === 'en') return cv
  const french = language === 'fr'
  cv.personal.fullName = french ? 'Camille Martin' : 'ليلى منصور'
  cv.personal.jobTitle = french ? 'Designer produit' : 'مصممة منتجات'
  cv.personal.location = french ? 'Lyon, France' : 'الرباط، المغرب'
  cv.personal.email = french ? 'camille@example.com' : 'layla@example.com'
  cv.personal.website = french ? 'camille.example' : 'layla.example'
  cv.personal.linkedin = french
    ? 'linkedin.com/in/camille-example'
    : 'linkedin.com/in/layla-example'
  cv.personal.phone = french ? '+33 1 00 00 00 00' : '+212 500 000 000'
  cv.summary = french
    ? 'Designer produit avec six ans d’expérience, je transforme des problèmes complexes en expériences numériques utiles et accessibles. J’accompagne les équipes de la recherche initiale à la livraison.'
    : 'مصممة منتجات بخبرة ست سنوات في تحويل المشكلات المعقدة إلى تجارب رقمية مفيدة وسهلة الاستخدام. أرافق الفرق من البحث الأولي إلى إطلاق المنتجات.'
  cv.experience[0] = {
    ...cv.experience[0]!,
    role: french ? 'Designer produit senior' : 'مصممة منتجات أولى',
    location: cv.personal.location,
    description: french
      ? 'Pilotage de la refonte d’une plateforme utilisée par 20 000 équipes.\nCréation d’un système de design réduisant les délais de livraison de 30 %.\nCollaboration avec les équipes de recherche et de développement.'
      : 'قدت إعادة تصميم منصة يستخدمها 20,000 فريق.\nأنشأت نظام تصميم قلّل وقت التسليم بنسبة 30%.\nتعاونت مع فرق البحث والهندسة لتبسيط تجربة المستخدم.',
  }
  cv.experience[1] = {
    ...cv.experience[1]!,
    role: cv.personal.jobTitle,
    location: french ? 'À distance' : 'عن بُعد',
    description: french
      ? 'Conception d’expériences complètes pour des entreprises technologiques.\nContribution au lancement de trois produits.'
      : 'صممت تجارب متكاملة لشركات تقنية ناشئة.\nساهمت في إطلاق ثلاثة منتجات من البحث إلى النشر.',
  }
  cv.education[0] = {
    ...cv.education[0]!,
    degree: french
      ? 'Licence en design de communication'
      : 'بكالوريوس تصميم الاتصال',
    school: french ? 'École des arts Exemple' : 'كلية الفنون النموذجية',
    description: french ? 'Diplôme obtenu avec mention.' : 'تخرجت بامتياز.',
  }
  cv.skills = (
    french
      ? [
          'Stratégie produit',
          'Recherche utilisateur',
          'Design d’interaction',
          'Systèmes de design',
          'Figma',
          'Prototypage',
        ]
      : [
          'استراتيجية المنتج',
          'بحث المستخدم',
          'تصميم التفاعل',
          'أنظمة التصميم',
          'Figma',
          'النماذج الأولية',
        ]
  ).map((name, index) => ({ id: `example-skill-${index}`, name, level: null }))
  cv.languages = french
    ? ['Français (langue maternelle)', 'Anglais (courant)']
    : ['العربية (اللغة الأم)', 'الفرنسية (متقدم)', 'الإنجليزية (محادثة)']
  return cv
}
