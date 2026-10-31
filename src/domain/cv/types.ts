import type { z } from 'zod'
import type {
  appearanceSchema,
  cvSchema,
  educationSchema,
  experienceSchema,
  projectSchema,
  referenceSchema,
  sectionHeadingKeys,
  skillSchema,
} from './schema'

export type CvData = z.infer<typeof cvSchema>
export type SectionHeadingKey = (typeof sectionHeadingKeys)[number]
export type Experience = z.infer<typeof experienceSchema>
export type Education = z.infer<typeof educationSchema>
export type Project = z.infer<typeof projectSchema>
export type Skill = z.infer<typeof skillSchema>
export type Reference = z.infer<typeof referenceSchema>
export type Appearance = z.infer<typeof appearanceSchema>
export type SkillProficiencyDisplay = NonNullable<
  Appearance['skillProficiencyDisplay']
>
export type CvDocument = { cv: CvData; appearance: Appearance }
export type DeepReadonly<Value> = {
  readonly [Key in keyof Value]: Value[Key] extends object
    ? DeepReadonly<Value[Key]>
    : Value[Key]
}
