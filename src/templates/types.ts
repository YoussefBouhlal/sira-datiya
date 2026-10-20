import type { ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import type { Appearance, CvData, DeepReadonly } from '../domain/cv/types'

export type TemplateProps = {
  cv: DeepReadonly<CvData>
  appearance: Readonly<Appearance>
}

export type TemplateDefinition = {
  readonly id: string
  readonly name: string
  readonly typography: 'serif' | 'sans'
  readonly layout?: 'single-column' | 'two-column'
  readonly load: () => Promise<
    (props: TemplateProps) => ReactElement<DocumentProps>
  >
}

export type TemplateOption = Pick<
  TemplateDefinition,
  'id' | 'name' | 'typography' | 'layout'
>
