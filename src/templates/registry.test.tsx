import { renderToBuffer } from '@react-pdf/renderer'
import { PDFDocument } from 'pdf-lib'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { describe, expect, it } from 'vitest'
import { createDocument, createEmptyCv } from '../domain/cv/defaults'
import { createExampleCv } from '../domain/cv/example'
import { createTemplateRegistry, templateRegistry } from './registry'

describe('template registry', () => {
  it('rejects an empty registry, duplicate IDs, or a missing default', () => {
    const first = templateRegistry.templates[0]!
    expect(() => createTemplateRegistry([], 'none')).toThrow()
    expect(() => createTemplateRegistry([first, first], first.id)).toThrow(
      /unique/,
    )
    expect(() => createTemplateRegistry([first], 'missing')).toThrow(/default/)
  })

  it('falls back from removed templates without changing CV content', () => {
    const document = createDocument('removed')
    const original = structuredClone(document.cv)
    expect(templateRegistry.resolve(document.appearance.templateId).id).toBe(
      templateRegistry.defaultId,
    )
    expect(document.cv).toEqual(original)
  })

  for (const template of templateRegistry.templates) {
    it(`${template.id} preserves structured skills, references and overflowing sidebar content`, async () => {
      const cv = createExampleCv()
      cv.personal.website = `https://portfolio.example/${'long-path-'.repeat(25)}`
      cv.skills = Array.from({ length: 90 }, (_, index) => ({
        id: `skill-${index}`,
        name: `Specialist capability ${index}`,
        level: index % 2 ? 4 : null,
      }))
      cv.references = [
        {
          id: 'reference-1',
          name: 'Jordan Example',
          jobTitle: 'Team Lead',
          organization: 'Example Studio',
          email: 'jordan@example.com',
          phone: '+1 202 555 0140',
        },
      ]
      cv.projects = [
        {
          id: 'project-1',
          name: 'Community Toolkit',
          url: 'https://toolkit.example',
          description: 'Built accessible public resources.',
        },
      ]
      cv.certifications = ['Accessibility Practitioner']
      const appearance = {
        ...createDocument(template.id).appearance,
        pageSize: 'LETTER' as const,
        fontSize: 12 as const,
      }
      const render = await template.load()
      const buffer = await renderToBuffer(render({ cv, appearance }))
      const task = getDocument({
        data: new Uint8Array(buffer),
        useSystemFonts: true,
      })
      const pdf = await task.promise
      try {
        expect(pdf.numPages).toBeGreaterThan(1)
        const pages = await Promise.all(
          Array.from({ length: pdf.numPages }, async (_, index) => {
            const page = await pdf.getPage(index + 1)
            const content = await page.getTextContent()
            const items = content.items.filter((item) => 'str' in item)
            for (const item of items) {
              if (!item.str.trim()) continue
              expect(item.transform[4]).toBeGreaterThanOrEqual(0)
              expect(item.transform[4] + item.width).toBeLessThanOrEqual(
                page.view[2]! + 1,
              )
              expect(item.transform[5]).toBeGreaterThanOrEqual(15)
              expect(item.transform[5]).toBeLessThanOrEqual(page.view[3]!)
              if (
                template.id === 'sidebar' &&
                item.transform[4] < page.view[2]! * 0.32
              )
                expect(item.transform[4] + item.width).toBeLessThanOrEqual(
                  page.view[2]! * 0.32 - 20,
                )
            }
            return items
              .filter((item) => item.transform[5] > 40)
              .map((item) => item.str)
              .join(' ')
          }),
        )
        const text = pages.join(' ').replace(/\s+/g, ' ')
        for (let index = 0; index < 90; index++)
          expect(text).toContain(`Specialist capability ${index}`)
        for (const value of [
          'Jordan Example',
          'jordan@example.com',
          'Community Toolkit',
          'Accessibility Practitioner',
          'French (conversational)',
          'Advanced',
        ])
          expect(text).toContain(value)
        expect(text.match(/Alex Morgan/g)).toHaveLength(1)
      } finally {
        await task.destroy()
      }
    })

    it(`${template.id} generates empty, typical and long PDFs without mutating data`, async () => {
      const long = createExampleCv()
      long.experience = Array.from({ length: 16 }, (_, index) => ({
        ...long.experience[0]!,
        id: `long-${index}`,
        description:
          'Delivered accessible, maintainable digital products.\n'.repeat(8),
      }))
      for (const cv of [createEmptyCv(), createExampleCv(), long]) {
        const snapshot = structuredClone(cv)
        const appearance = createDocument(template.id).appearance
        const render = await template.load()
        const buffer = await renderToBuffer(render({ cv, appearance }))
        expect(buffer.subarray(0, 5).toString()).toBe('%PDF-')
        expect(buffer.byteLength).toBeGreaterThan(1000)
        const pdf = await PDFDocument.load(buffer)
        expect(pdf.getPageCount()).toBeGreaterThanOrEqual(cv === long ? 2 : 1)
        expect(cv).toEqual(snapshot)
      }
    })
  }
})
