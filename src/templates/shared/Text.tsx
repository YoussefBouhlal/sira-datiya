import { Text as PdfText, type TextProps } from '@react-pdf/renderer'
import { Children, useContext, type PropsWithChildren } from 'react'
import type { TextColorRole } from '../../domain/cv/colors'
import type { SectionHeadingKey } from '../../domain/cv/types'
import { PdfColorContext } from './color-context'
import {
  flattenStyle,
  languageStyle,
  PdfHeadingContext,
  usePdfTranslation,
} from './localization'

function breakLongWords(word: string): string[] {
  if (/[\u0600-\u06ff]/.test(word)) return [word]
  return word.length > 16 ? Array.from(word) : [word]
}

export function Text({
  colorRole = 'body',
  section,
  ...props
}: PropsWithChildren<TextProps> & {
  colorRole?: TextColorRole
  section?: SectionHeadingKey
}) {
  const { language } = usePdfTranslation()
  const { headings } = useContext(PdfHeadingContext)
  const customHeading = Boolean(section && headings?.[section]?.trim())
  const colors = useContext(PdfColorContext)
  const flat = flattenStyle(props.style)
  const hasArabic = Children.toArray(props.children).some(
    (child) => typeof child === 'string' && /[\u0600-\u06ff]/.test(child),
  )
  const arabic = language === 'ar' || hasArabic
  const family = String(flat.fontFamily ?? '')
  return (
    <PdfText
      {...props}
      style={[
        languageStyle(props.style, language),
        ...(customHeading ? [{ textTransform: 'none' as const }] : []),
        ...(colors[colorRole] ? [{ color: colors[colorRole] }] : []),
        ...(arabic
          ? [
              {
                fontFamily: 'Amiri',
                fontFeatureSettings: { rlig: false },
                fontWeight: /Bold/.test(family) ? 700 : flat.fontWeight,
                fontStyle: /Italic|Oblique/.test(family)
                  ? ('italic' as const)
                  : flat.fontStyle,
                direction: hasArabic ? ('rtl' as const) : ('ltr' as const),
              },
            ]
          : []),
      ]}
      hyphenationCallback={breakLongWords}
    />
  )
}
