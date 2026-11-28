// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { TemplatePages } from './TemplatePages'
import { previewFilename, publicLanguages } from './content'
import { galleryCopy, publicTemplateNumbers } from './template-content'

describe('public template pages', () => {
  for (const language of publicLanguages) {
    for (const base of ['/', '/__pages-e2e__/']) {
      it.each([undefined, ...publicTemplateNumbers])(
        `renders ${language} template page %s under ${base} without private storage`,
        (number) => {
          const storage = vi
            .spyOn(window, 'localStorage', 'get')
            .mockImplementation(() => {
              throw new Error('Private storage accessed')
            })
          try {
            const html = renderToStaticMarkup(
              <TemplatePages base={base} language={language} number={number} />,
            )
            const parsed = new DOMParser().parseFromString(html, 'text/html')
            const path = number ? `templates/${number}/` : 'templates/'
            expect(parsed.documentElement.lang).toBe(language)
            expect(parsed.documentElement.dir).toBe(
              language === 'ar' ? 'rtl' : 'ltr',
            )
            expect(parsed.querySelector('h1')?.textContent).toBe(
              number
                ? galleryCopy[language].templates[number].name
                : galleryCopy[language].heading,
            )
            expect(parsed.title).toBe(
              number
                ? `${galleryCopy[language].templates[number].name} | ${galleryCopy[language].heading}`
                : galleryCopy[language].heading,
            )
            expect(
              parsed
                .querySelector('meta[name="description"]')
                ?.getAttribute('content'),
            ).toBe(
              number
                ? galleryCopy[language].templates[number].description
                : galleryCopy[language].description,
            )
            expect(
              parsed
                .querySelector('link[rel="canonical"]')
                ?.getAttribute('href'),
            ).toBe(`https://siravuno.com${base}${language}/${path}`)
            expect(
              Array.from(parsed.querySelectorAll('link[rel="alternate"]')).map(
                (link) => link.getAttribute('href'),
              ),
            ).toEqual(
              publicLanguages.map(
                (alternative) =>
                  `https://siravuno.com${base}${alternative}/${path}`,
              ),
            )
            expect(
              Array.from(parsed.querySelectorAll('.language-navigation a')).map(
                (link) => link.getAttribute('href'),
              ),
            ).toEqual(
              publicLanguages.map(
                (alternative) => `${base}${alternative}/${path}`,
              ),
            )
            expect(parsed.querySelector('script')).toBeNull()
            expect(
              parsed
                .querySelector('link[rel="stylesheet"]')
                ?.getAttribute('href'),
            ).toBe(`${base}${language}/overview.css`)
            for (const link of parsed.querySelectorAll('.builder-link'))
              expect(link.getAttribute('href')).toBe(base)
            expect(parsed.querySelector('main')?.textContent).toContain(
              galleryCopy[language].entryNote,
            )
            expect(
              Array.from(parsed.querySelectorAll('img')).map((image) =>
                image.getAttribute('src'),
              ),
            ).toEqual(
              (number ? [number] : publicTemplateNumbers).map(
                (candidate) =>
                  `${base}public-preview/${previewFilename(language, candidate)}`,
              ),
            )
            expect(storage).not.toHaveBeenCalled()
          } finally {
            storage.mockRestore()
          }
        },
      )
    }
  }
})
