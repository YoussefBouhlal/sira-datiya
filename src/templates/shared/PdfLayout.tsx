import { Image as PdfImage, View as PdfView } from '@react-pdf/renderer'
import type { ComponentProps, ReactNode } from 'react'
import type { Language } from '../../i18n/messages'
import type { TextProps } from '@react-pdf/renderer'
import type { ColorScheme } from '../../domain/cv/colors'
import { PdfColorContext } from './color-context'
import { Text } from './Text'
import {
  PdfLanguageContext,
  languageStyle,
  usePdfTranslation,
} from './localization'

export function PdfLanguage({
  language,
  colors,
  children,
}: {
  language: Language
  colors?: ColorScheme
  children: ReactNode
}) {
  return (
    <PdfLanguageContext.Provider value={language}>
      <PdfColorContext.Provider value={colors ?? {}}>
        {children}
      </PdfColorContext.Provider>
    </PdfLanguageContext.Provider>
  )
}

export function View(props: ComponentProps<typeof PdfView>) {
  const { language } = usePdfTranslation()
  return <PdfView {...props} style={languageStyle(props.style, language)} />
}

export function Image(props: ComponentProps<typeof PdfImage>) {
  const { language } = usePdfTranslation()
  return <PdfImage {...props} style={languageStyle(props.style, language)} />
}

export function ContactText({
  values,
  separator = ' | ',
  centered = false,
  style,
}: {
  values: readonly string[]
  separator?: string
  centered?: boolean
  style?: TextProps['style']
}) {
  const { language } = usePdfTranslation()
  const content = values.filter(Boolean)
  if (language !== 'ar')
    return (
      <Text colorRole="details" style={style}>
        {content.join(separator)}
      </Text>
    )
  return (
    <View
      style={[
        ...(Array.isArray(style) ? style : [style ?? {}]),
        {
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          justifyContent: centered ? 'center' : 'flex-start',
        },
      ]}
    >
      {content.map((value, index) => (
        <View key={index} style={{ flexDirection: 'row', maxWidth: '100%' }}>
          {index > 0 && <Text colorRole="details">{separator}</Text>}
          <Text colorRole="details" style={{ maxWidth: '100%' }}>
            {value}
          </Text>
        </View>
      ))}
    </View>
  )
}
