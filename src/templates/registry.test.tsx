import { renderToBuffer } from '@react-pdf/renderer'
import { PDFDocument } from 'pdf-lib'
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
