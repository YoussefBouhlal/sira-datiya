import { describe, expect, it } from 'vitest'
import { createExampleCv } from '../domain/cv/example'
import { dateRange, formatMonth, messages, translate } from './messages'

describe('document language', () => {
  it('supplies French and Arabic text with the same interpolation placeholders', () => {
    const placeholders = (value: string) =>
      [...value.matchAll(/\{\w+\}/g)].map(([key]) => key).sort()
    for (const [english, translations] of Object.entries(messages)) {
      for (const translation of translations) {
        expect(translation.trim(), english).not.toBe('')
        expect(placeholders(translation), english).toEqual(
          placeholders(english),
        )
      }
    }
    expect(
      translate('fr', 'Page {page} of {total}', { page: 1, total: 2 }),
    ).toBe('Page 1 sur 2')
    expect(
      translate('ar', 'Page {page} of {total}', { page: 1, total: 2 }),
    ).toBe('الصفحة 1 من 2')
  })

  it('uses localized full month names with Western digits and Gregorian years', () => {
    expect(formatMonth('2024-01', 'en')).toBe('January 2024')
    expect(formatMonth('2024-01', 'fr')).toBe('janvier 2024')
    expect(formatMonth('2024-01', 'ar')).toBe('يناير 2024')
    expect(dateRange('2022-03', '', true, 'fr')).toBe('mars 2022 - Aujourd’hui')
    expect(dateRange('', '', false, 'ar')).toBe('')
  })

  it('creates independent fictional samples without translating entered data', () => {
    for (const language of ['en', 'fr', 'ar'] as const) {
      const sample = createExampleCv(language)
      expect(sample.personal.fullName).not.toBe('')
      sample.summary = 'Edited locally'
      expect(createExampleCv(language).summary).not.toBe('Edited locally')
    }
    expect(createExampleCv('fr').personal.fullName).toBe('Camille Martin')
    expect(createExampleCv('ar').personal.fullName).toBe('ليلى منصور')
  })
})
