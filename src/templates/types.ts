import type { ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import type {
  Appearance,
  ContactLabelKey,
  CvData,
  DeepReadonly,
  SectionHeadingKey,
  SkillProficiencyDisplay,
} from '../domain/cv/types'
import type { TemplateColorDefaults } from '../domain/cv/colors'
import { translate, type Language } from '../i18n/messages'

export const defaultSectionHeadings = {
  summary: 'Profile',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  languages: 'Languages',
  certifications: 'Certifications',
  projects: 'Projects',
  references: 'References',
} as const

export type SectionHeadings = Partial<Record<SectionHeadingKey, string>>

export type ContactLabels = Partial<Record<ContactLabelKey, string>>

export const defaultContactLabels = {
  location: 'Location',
  phone: 'Phone',
  email: 'Email',
  website: 'Website',
  linkedin: 'Linkedin',
} as const

export function resolveContactLabel(
  labels: Readonly<ContactLabels> | undefined,
  defaults: Readonly<ContactLabels>,
  key: ContactLabelKey,
  language: Language,
): string {
  return labels?.[key]?.trim() || translate(language, defaults[key] ?? '')
}

export function resolveSectionHeading(
  headings: Readonly<SectionHeadings> | undefined,
  defaults: Readonly<SectionHeadings>,
  key: SectionHeadingKey,
  language: Language,
): string {
  return headings?.[key]?.trim() || translate(language, defaults[key] ?? '')
}

export type TemplateProps = {
  cv: DeepReadonly<CvData>
  appearance: Readonly<Appearance>
}

export type TemplateDefinition = {
  readonly id: string
  readonly name: string
  readonly typography: 'serif' | 'sans'
  readonly layout?: 'single-column' | 'two-column'
  readonly portraitShape?: 'circle' | 'square'
  readonly colorDefaults?: TemplateColorDefaults
  readonly headings?: Readonly<SectionHeadings>
  readonly contactLabels?: Readonly<ContactLabels>
  readonly skillProficiencyDisplay?: {
    readonly modes: readonly SkillProficiencyDisplay[]
    readonly defaultMode: SkillProficiencyDisplay
  }
  readonly load: () => Promise<
    (props: TemplateProps) => ReactElement<DocumentProps>
  >
}

export type TemplateOption = Pick<
  TemplateDefinition,
  | 'id'
  | 'name'
  | 'typography'
  | 'layout'
  | 'portraitShape'
  | 'colorDefaults'
  | 'headings'
  | 'contactLabels'
  | 'skillProficiencyDisplay'
>

export function resolveSkillProficiencyDisplay(
  template: Pick<TemplateDefinition, 'skillProficiencyDisplay'>,
  preferred: Appearance['skillProficiencyDisplay'],
): SkillProficiencyDisplay {
  const capability = template.skillProficiencyDisplay
  if (!capability) return 'text'
  return preferred && capability.modes.includes(preferred)
    ? preferred
    : capability.defaultMode
}
