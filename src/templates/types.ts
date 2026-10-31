import type { ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import type {
  Appearance,
  CvData,
  DeepReadonly,
  SkillProficiencyDisplay,
} from '../domain/cv/types'
import type { TemplateColorDefaults } from '../domain/cv/colors'

export type TemplateProps = {
  cv: DeepReadonly<CvData>
  appearance: Readonly<Appearance>
}

export type TemplateDefinition = {
  readonly id: string
  readonly name: string
  readonly typography: 'serif' | 'sans'
  readonly layout?: 'single-column' | 'two-column'
  readonly colorDefaults?: TemplateColorDefaults
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
  | 'colorDefaults'
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
