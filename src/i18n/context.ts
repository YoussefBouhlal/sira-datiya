import { createContext, useContext } from 'react'
import { translate, type Language } from './messages'

export const LanguageContext = createContext<Language>('en')

export function useTranslation() {
  const language = useContext(LanguageContext)
  return {
    language,
    t: (message: string, values?: Record<string, string | number>) =>
      translate(language, message, values),
  }
}
