// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { Overview } from './Overview'
import { overviewCopy, previewFilename, publicLanguages } from './content'

describe('public overview', () => {
  it.each(
    publicLanguages.flatMap((language) =>
      ['/', '/__pages-e2e__/'].map((base) => ({ language, base })),
    ),
  )(
    'renders meaningful $language static HTML under $base without accessing storage',
    ({ base, language }) => {
      const storage = vi
        .spyOn(window, 'localStorage', 'get')
        .mockImplementation(() => {
          throw new Error('Public pages must not access private storage')
        })
      try {
        const html = renderToStaticMarkup(
          <Overview base={base} language={language} />,
        )
        const parsed = new DOMParser().parseFromString(html, 'text/html')
        expect(parsed.querySelector('h1')?.textContent).toBe(
          overviewCopy[language].heading,
        )
        expect(parsed.title).toBe(overviewCopy[language].title)
        expect(
          parsed
            .querySelector('meta[name="description"]')
            ?.getAttribute('content'),
        ).toBe(overviewCopy[language].description)
        expect(parsed.documentElement.lang).toBe(language)
        expect(parsed.documentElement.dir).toBe(
          language === 'ar' ? 'rtl' : 'ltr',
        )
        expect(
          parsed.querySelector('link[rel="canonical"]')?.getAttribute('href'),
        ).toBe(`https://siravuno.com${base}${language}/`)
        expect(
          Array.from(parsed.querySelectorAll('link[rel="alternate"]')).map(
            (link) => [
              link.getAttribute('hreflang'),
              link.getAttribute('href'),
            ],
          ),
        ).toEqual(
          publicLanguages.map((alternative) => [
            alternative,
            `https://siravuno.com${base}${alternative}/`,
          ]),
        )
        expect(
          parsed
            .querySelector('nav a[aria-current="page"]')
            ?.getAttribute('href'),
        ).toBe(`${base}${language}/`)
        expect(
          Array.from(parsed.querySelectorAll('nav a')).map((link) =>
            link.getAttribute('href'),
          ),
        ).toEqual(
          publicLanguages.map((alternative) => `${base}${alternative}/`),
        )
        expect(parsed.querySelector('script')).toBeNull()
        expect(parsed.querySelector('img')?.getAttribute('src')).toBe(
          `${base}public-preview/${previewFilename(language)}`,
        )
        expect(
          parsed.querySelector('.builder-link')?.getAttribute('href'),
        ).toBe(base)
        expect(parsed.querySelector('main')?.textContent).toContain('JSON')
        expect(storage).not.toHaveBeenCalled()
      } finally {
        storage.mockRestore()
      }
    },
  )

  it.each(publicLanguages)(
    'contains no effects that read or change a visitor draft on %s browser render',
    (language) => {
      const getItem = vi.spyOn(Storage.prototype, 'getItem')
      const setItem = vi.spyOn(Storage.prototype, 'setItem')
      const removeItem = vi.spyOn(Storage.prototype, 'removeItem')
      const { unmount } = render(<Overview base="/" language={language} />)
      window.dispatchEvent(new Event('pagehide'))
      document.dispatchEvent(new Event('visibilitychange'))
      expect(getItem).not.toHaveBeenCalled()
      expect(setItem).not.toHaveBeenCalled()
      expect(removeItem).not.toHaveBeenCalled()
      unmount()
      vi.restoreAllMocks()
    },
  )
})
