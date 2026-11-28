// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { Help } from './Help'
import { publicLanguages } from './content'
import { helpCopy } from './help-content'
import { privacyCopy } from './privacy-content'

describe('public help pages', () => {
  for (const page of ['help', 'privacy'] as const) {
    for (const language of publicLanguages) {
      const copy =
        page === 'privacy' ? privacyCopy[language] : helpCopy[language]
      for (const base of ['/', '/__pages-e2e__/']) {
        it(`renders ${language} ${page} under ${base} without private storage`, () => {
          const storage = vi
            .spyOn(window, 'localStorage', 'get')
            .mockImplementation(() => {
              throw new Error('Private storage accessed')
            })
          try {
            const parsed = new DOMParser().parseFromString(
              renderToStaticMarkup(
                <Help base={base} language={language} page={page} />,
              ),
              'text/html',
            )
            expect(parsed.documentElement.lang).toBe(language)
            expect(parsed.documentElement.dir).toBe(
              language === 'ar' ? 'rtl' : 'ltr',
            )
            expect(parsed.title).toBe(copy.heading)
            expect(parsed.querySelector('h1')?.textContent).toBe(parsed.title)
            expect(
              parsed
                .querySelector('meta[name="description"]')
                ?.getAttribute('content'),
            ).toBe(copy.description)
            expect(
              parsed
                .querySelector('link[rel="canonical"]')
                ?.getAttribute('href'),
            ).toBe(`https://siravuno.com${base}${language}/${page}/`)
            expect(
              Array.from(parsed.querySelectorAll('link[rel="alternate"]')).map(
                (link) => link.getAttribute('href'),
              ),
            ).toEqual(
              publicLanguages.map(
                (alternative) =>
                  `https://siravuno.com${base}${alternative}/${page}/`,
              ),
            )
            expect(
              Array.from(parsed.querySelectorAll('.language-navigation a')).map(
                (link) => link.getAttribute('href'),
              ),
            ).toEqual(
              publicLanguages.map(
                (alternative) => `${base}${alternative}/${page}/`,
              ),
            )
            expect(
              parsed
                .querySelector('link[rel="stylesheet"]')
                ?.getAttribute('href'),
            ).toBe(`${base}${language}/overview.css`)
            for (const link of parsed.querySelectorAll('.builder-link'))
              expect(link.getAttribute('href')).toBe(base)
            for (const section of copy.sections) {
              expect(parsed.getElementById(section.id)?.textContent).toBe(
                section.heading,
              )
              expect(
                parsed.querySelector(`a[href="#${section.id}"]`),
              ).not.toBeNull()
              for (const paragraph of section.paragraphs)
                expect(parsed.querySelector('main')?.textContent).toContain(
                  paragraph,
                )
            }
            expect(parsed.querySelector('script')).toBeNull()
            expect(storage).not.toHaveBeenCalled()
          } finally {
            storage.mockRestore()
          }
        })
      }
    }
  }
})
