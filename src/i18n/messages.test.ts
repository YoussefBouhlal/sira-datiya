import { describe, expect, it } from 'vitest'
import { createExampleCv } from '../domain/cv/example'
import { dateRange, formatMonth, messages, translate } from './messages'

describe('document language', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'uses Siravuno branding in %s',
    (language) => {
      expect(translate(language, 'Siravuno home')).toContain('Siravuno')
      expect(
        translate(language, 'SIRAVUNO / CV BUILDER').toLowerCase(),
      ).toContain('siravuno')
      expect(
        translate(
          language,
          'This backup could not be opened. Choose a valid Siravuno JSON backup smaller than 2 MB.',
        ),
      ).toContain('Siravuno')
    },
  )

  it.each([
    ['en', 'CV storage', 'Your CV in this browser'],
    ['fr', 'Stockage du CV', 'Votre CV dans ce navigateur'],
    ['ar', 'تخزين السيرة الذاتية', 'سيرتك الذاتية في هذا المتصفح'],
  ] as const)(
    'keeps storage wording specific to the CV in %s',
    (language, label, title) => {
      expect(translate(language, 'CV storage')).toBe(label)
      expect(translate(language, 'Your CV in this browser')).toBe(title)
      const storageMessage =
        'Your CV is saved in this browser. No account is required, and fonts are bundled with the app.'
      expect(messages).toHaveProperty(storageMessage)
      expect(translate(language, storageMessage)).not.toMatch(
        /analytics|analyse|تحليلات/i,
      )
      expect(
        translate(
          language,
          'Browser storage is not encrypted. Clearing site data or using private browsing can remove your CV. Download a JSON backup to keep a copy.',
        ),
      ).toContain('JSON')
    },
  )

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
