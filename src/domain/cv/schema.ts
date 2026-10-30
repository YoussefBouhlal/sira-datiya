import { z } from 'zod'

const shortText = z.string().max(500)
const longText = z.string().max(20_000)
const month = z.string().regex(/^(?:\d{4}-(?:0[1-9]|1[0-2]))?$/)

export const experienceSchema = z.object({
  id: z.string().min(1),
  role: shortText,
  employer: shortText,
  location: shortText,
  startDate: month,
  endDate: month,
  current: z.boolean(),
  description: longText,
})

export const educationSchema = z.object({
  id: z.string().min(1),
  degree: shortText,
  school: shortText,
  startDate: month,
  endDate: month,
  description: longText,
})

export const projectSchema = z.object({
  id: z.string().min(1),
  name: shortText,
  url: shortText,
  description: longText,
})

export const skillSchema = z.object({
  id: z.string().min(1),
  name: shortText,
  level: z.number().int().min(1).max(5).nullable(),
})

export const referenceSchema = z.object({
  id: z.string().min(1),
  name: shortText,
  jobTitle: shortText,
  organization: shortText,
  email: shortText,
  phone: shortText,
})

export const cvSchema = z.object({
  personal: z.object({
    fullName: shortText,
    jobTitle: shortText,
    email: shortText,
    phone: shortText,
    location: shortText,
    website: shortText,
    linkedin: shortText,
    portrait: z
      .string()
      .max(300_000)
      .regex(/^(?:data:image\/(?:png|jpeg);base64,[A-Za-z0-9+/]+={0,2})?$/)
      .default(''),
  }),
  summary: longText,
  experience: z.array(experienceSchema).max(100),
  education: z.array(educationSchema).max(100),
  skills: z
    .array(z.union([shortText, skillSchema]))
    .max(200)
    .transform((skills) =>
      skills.map((skill, index) =>
        typeof skill === 'string'
          ? { id: `legacy-skill-${index}`, name: skill, level: null }
          : skill,
      ),
    ),
  languages: z.array(shortText).max(100),
  certifications: z.array(shortText).max(100),
  projects: z.array(projectSchema).max(100),
  references: z.array(referenceSchema).max(100).default([]),
})

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/)

export const appearanceSchema = z.object({
  language: z.enum(['en', 'fr', 'ar']).default('en'),
  templateId: z.string(),
  accent: z.enum(['#177568', '#3456a0', '#8c4255', '#292929']),
  colors: z
    .object({
      headings: hexColor.optional(),
      details: hexColor.optional(),
      body: hexColor.optional(),
      accent: hexColor.optional(),
      surface: hexColor.optional(),
    })
    .optional(),
  fontSize: z.union([z.literal(10), z.literal(11), z.literal(12)]),
  pageSize: z.enum(['A4', 'LETTER']),
})
