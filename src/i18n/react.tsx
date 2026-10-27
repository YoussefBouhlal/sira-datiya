import type { ReactNode } from 'react'
import type { Language } from './messages'
import { LanguageContext } from './context'

export function LanguageProvider({
  language,
  children,
}: {
  language: Language
  children: ReactNode
}) {
  return (
    <LanguageContext.Provider value={language}>
      {children}
    </LanguageContext.Provider>
  )
}
