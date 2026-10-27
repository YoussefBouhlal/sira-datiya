import { Text as PdfText, type TextProps } from '@react-pdf/renderer'
import { Children, type PropsWithChildren } from 'react'
import { flattenStyle, languageStyle, usePdfTranslation } from './localization'

function breakLongWords(word: string): string[] {
  if (/[\u0600-\u06ff]/.test(word)) return [word]
  return word.length > 16 ? Array.from(word) : [word]
}

export function Text(props: PropsWithChildren<TextProps>) {
  const { language } = usePdfTranslation()
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
