import { Font } from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'
import { createContext, useContext } from 'react'
import { dateRange, translate, type Language } from '../../i18n/messages'

export const PdfLanguageContext = createContext<Language>('en')
const nodeFontDirectory = '../../../public/fonts/amiri/'
const fontRoot =
  typeof window === 'undefined'
    ? decodeURIComponent(new URL(nodeFontDirectory, import.meta.url).pathname)
    : `${import.meta.env.BASE_URL}fonts/amiri/`

Font.register({
  family: 'Amiri',
  fonts: [
    { src: `${fontRoot}Amiri-Regular.ttf` },
    { src: `${fontRoot}Amiri-Bold.ttf`, fontWeight: 700 },
    { src: `${fontRoot}Amiri-Italic.ttf`, fontStyle: 'italic' },
    {
      src: `${fontRoot}Amiri-BoldItalic.ttf`,
      fontWeight: 700,
      fontStyle: 'italic',
    },
  ],
})

export function usePdfTranslation() {
  const language = useContext(PdfLanguageContext)
  return {
    language,
    t: (message: string, values?: Record<string, string | number>) =>
      translate(language, message, values),
    dates: (start: string, end: string, current = false) =>
      dateRange(start, end, current, language),
  }
}

type NestedStyle = Style | undefined | readonly NestedStyle[]

function isStyleArray(style: NestedStyle): style is readonly NestedStyle[] {
  return Array.isArray(style)
}

export function flattenStyle(style: NestedStyle): Style {
  return isStyleArray(style)
    ? Object.assign(
        {},
        ...style.map((entry: NestedStyle) => flattenStyle(entry)),
      )
    : Object.assign({}, style)
}

export function languageStyle(style: NestedStyle, language: Language): Style {
  const flat = flattenStyle(style)
  if (language !== 'ar') return flat
  const result: Style = { ...flat }
  if (flat.flexDirection === 'row') result.flexDirection = 'row-reverse'
  else if (flat.flexDirection === 'row-reverse') result.flexDirection = 'row'
  for (const [left, right] of [
    ['left', 'right'],
    ['marginLeft', 'marginRight'],
    ['paddingLeft', 'paddingRight'],
    ['borderLeftWidth', 'borderRightWidth'],
    ['borderLeftColor', 'borderRightColor'],
  ] as const) {
    if (left in flat || right in flat)
      Object.assign(result, { [left]: flat[right], [right]: flat[left] })
  }
  if (flat.textAlign === 'left') result.textAlign = 'right'
  else if (flat.textAlign === 'right') result.textAlign = 'left'
  return result
}

export function pageLanguageStyle(language: Language): Style {
  return language === 'ar'
    ? { fontFamily: 'Amiri', textAlign: 'right', direction: 'rtl' }
    : {}
}
