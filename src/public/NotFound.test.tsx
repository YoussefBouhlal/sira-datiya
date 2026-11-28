// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { NotFound } from './NotFound'
import { publicLanguages } from './content'

it.each(['/', '/__pages-e2e__/'])(
  'renders a script-free trilingual error document under %s without storage',
  (base) => {
    const storage = vi
      .spyOn(window, 'localStorage', 'get')
      .mockImplementation(() => {
        throw new Error('Private storage accessed')
      })
    try {
      const parsed = new DOMParser().parseFromString(
        renderToStaticMarkup(<NotFound base={base} />),
        'text/html',
      )
      expect(parsed.querySelectorAll('h1')).toHaveLength(1)
      expect(
        parsed.querySelector('meta[name="robots"]')?.getAttribute('content'),
      ).toBe('noindex')
      expect(
        parsed.querySelector(
          'script, link[rel="canonical"], link[rel="alternate"]',
        ),
      ).toBeNull()
      expect(
        parsed.querySelector('link[rel="stylesheet"]')?.getAttribute('href'),
      ).toBe(`${base}en/overview.css`)
      for (const language of publicLanguages) {
        const section = parsed.querySelector(`section[lang="${language}"]`)!
        expect(section.getAttribute('dir')).toBe(
          language === 'ar' ? 'rtl' : 'ltr',
        )
        expect(
          section.querySelector('.builder-link')?.getAttribute('href'),
        ).toBe(base)
        expect(
          section.querySelector('.not-found-overview')?.getAttribute('href'),
        ).toBe(`${base}${language}/`)
      }
      expect(storage).not.toHaveBeenCalled()
    } finally {
      storage.mockRestore()
    }
  },
)
