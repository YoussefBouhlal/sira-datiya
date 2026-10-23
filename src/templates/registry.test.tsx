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

  for (const pageSize of ['A4', 'LETTER'] as const) {
    it(`classic aligns its header, date rail and language columns on ${pageSize}`, async () => {
      const cv = createExampleCv()
      cv.experience[0]!.description =
        'Plain achievement\n\u2022 Existing bullet\n- Existing dash'
      const appearance = {
        ...createDocument('classic').appearance,
        pageSize,
        fontSize: pageSize === 'A4' ? (10 as const) : (12 as const),
      }
      const render = await templateRegistry.resolve('classic').load()
      const buffer = await renderToBuffer(render({ cv, appearance }))
      const task = getDocument({
        data: new Uint8Array(buffer),
        useSystemFonts: true,
      })
      const pdf = await task.promise
      try {
        expect(pdf.numPages).toBe(1)
        const page = await pdf.getPage(1)
        const items = (await page.getTextContent()).items.filter(
          (item) => 'str' in item,
        )
        const find = (value: string) => {
          const item = items.find((item) => item.str.includes(value))
          expect(item, value).toBeDefined()
          return item!
        }
        const title = find('Alex Morgan, Product Designer')
        expect(title.transform[4] + title.width / 2).toBeCloseTo(
          page.view[2]! / 2,
          0,
        )
        const profile = find('PROFILE')
        const summary = find('Product designer turning')
        expect(profile.transform[4]).toBeCloseTo(60, 0)
        expect(summary.transform[4]).toBeCloseTo(
          60 + (page.view[2]! - 120) * 0.235,
          0,
        )
        expect(
          Math.abs(profile.transform[5] - summary.transform[5]),
        ).toBeLessThan(3)
        const date = find('Mar 2022 - Present')
        const role = find('Senior Product Designer')
        expect(date.transform[4]).toBeCloseTo(profile.transform[4], 0)
        expect(role.transform[4]).toBeCloseTo(summary.transform[4], 0)
        expect(date.transform[4] + date.width).toBeLessThan(role.transform[4])
        expect(find('English (native)').transform[4]).toBeLessThan(
          find('French (conversational)').transform[4],
        )
        const text = items.map((item) => item.str).join(' ')
        expect(text).toContain('\u2022 Plain achievement')
        expect(text).not.toContain('\u2022 \u2022')
        expect(text).not.toContain('\u2022 -')
        expect(text).toContain('1 / 1')
      } finally {
        await task.destroy()
      }
    })
  }

  for (const pageSize of ['A4', 'LETTER'] as const) {
    it(`traditional centers its header and aligns dates on ${pageSize}`, async () => {
      const cv = createExampleCv()
      cv.experience[0]!.description =
        'Plain achievement\n\u2022 Existing bullet\n- Existing dash\n1. Numbered achievement'
      const appearance = {
        ...createDocument('traditional').appearance,
        pageSize,
        fontSize: pageSize === 'A4' ? (10 as const) : (12 as const),
        accent: '#292929' as const,
      }
      const render = await templateRegistry.resolve('traditional').load()
      const buffer = await renderToBuffer(render({ cv, appearance }))
      const task = getDocument({
        data: new Uint8Array(buffer),
        useSystemFonts: true,
      })
      const pdf = await task.promise
      try {
        const page = await pdf.getPage(1)
        const items = (await page.getTextContent()).items.filter(
          (item) => 'str' in item,
        )
        const find = (value: string) => {
          const item = items.find((item) => item.str.includes(value))
          expect(item, value).toBeDefined()
          return item!
        }
        const name = find('Alex Morgan')
        const job = find('Product Designer')
        const heading = find('PROFILE')
        for (const item of [name, job, heading])
          expect(item.transform[4] + item.width / 2).toBeCloseTo(
            page.view[2]! / 2,
            0,
          )
        const phone = find('+1 415 555 0142')
        const email = find('alex@example.com')
        expect(phone.transform[4]).toBeCloseTo(42, 0)
        expect(email.transform[4] + email.width).toBeCloseTo(
          page.view[2]! - 42,
          0,
        )
        expect(phone.transform[5]).toBeCloseTo(email.transform[5], 0)
        const role = find('Senior Product Designer')
        const date = find('Mar 2022 - Present')
        expect(role.transform[4] + role.width).toBeLessThan(date.transform[4])
        expect(date.transform[4] + date.width).toBeCloseTo(
          page.view[2]! - 42,
          0,
        )
        const prose = find('Plain achievement')
        const bullet = find('\u2022 Existing bullet')
        expect(prose.fontName).not.toBe(bullet.fontName)
        expect(find('Product designer turning').fontName).toBe(prose.fontName)
        expect(bullet.str).toBe('\u2022 Existing bullet')
        const text = items.map((item) => item.str).join(' ')
        expect(text).not.toContain('\u2022 Plain achievement')
        expect(text).not.toContain('\u2022 \u2022')
        expect(text).toContain('- Existing dash')
        expect(text).toContain('1. Numbered achievement')
        expect(text).toContain('EDUCATION')
        expect(text).not.toContain('PROJECTS')
        expect(text).not.toContain('CERTIFICATIONS')
        expect(text).not.toContain('REFERENCES')
      } finally {
        await task.destroy()
      }
    })
  }

  for (const pageSize of ['A4', 'LETTER'] as const) {
    it(`prime-ats preserves reading order and four-column geometry on ${pageSize}`, async () => {
      const cv = createExampleCv()
      cv.experience[0]!.description =
        'Plain achievement\n\u2022 Existing bullet\n- Existing dash\n1. Numbered achievement'
      cv.skills = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo'].map(
        (name, index) => ({
          id: `skill-${index}`,
          name: `${name} capability`,
          level: index === 0 ? 5 : null,
        }),
      )
      cv.projects = [
        {
          id: 'project',
          name: 'Community Toolkit',
          url: 'toolkit.example',
          description: 'Built public resources.',
        },
      ]
      cv.certifications = ['Accessibility Practitioner']
      cv.references = [
        {
          id: 'reference',
          name: 'Jordan Example',
          jobTitle: 'Team Lead',
          organization: 'Example Studio',
          email: 'jordan@example.com',
          phone: '',
        },
      ]
      const appearance = {
        ...createDocument('prime-ats').appearance,
        pageSize,
        fontSize: pageSize === 'A4' ? (10 as const) : (12 as const),
        accent: '#3456a0' as const,
      }
      const render = await templateRegistry.resolve('prime-ats').load()
      const buffer = await renderToBuffer(render({ cv, appearance }))
      const task = getDocument({
        data: new Uint8Array(buffer),
        useSystemFonts: true,
      })
      const pdf = await task.promise
      try {
        const pages = await Promise.all(
          Array.from({ length: pdf.numPages }, async (_, index) => {
            const page = await pdf.getPage(index + 1)
            const items = (await page.getTextContent()).items.filter(
              (item) => 'str' in item,
            )
            const body = items.filter(
              (item) => item.str.trim() && item.transform[5] > 40,
            )
            expect(body.at(-1)?.str).not.toMatch(
              /^(SUMMARY|PROFESSIONAL EXPERIENCE|EDUCATION|TECHNICAL SKILLS|PROJECTS|ADDITIONAL INFORMATION|REFERENCES)$/,
            )
            return items
          }),
        )
        const items = pages.flat()
        const find = (value: string) => {
          const item = items.find((item) => item.str.includes(value))
          expect(item, value).toBeDefined()
          return item!
        }
        const firstPage = await pdf.getPage(1)
        expect(find('ALEX MORGAN').transform[4]).toBeCloseTo(40, 0)
        expect(find('ALEX MORGAN').height).toBeCloseTo(
          appearance.fontSize * 2.3,
          0,
        )
        const role = find('Senior Product Designer')
        const date = find('Mar 2022 - Present')
        expect(role.transform[4] + role.width).toBeLessThan(date.transform[4])
        expect(date.transform[4] + date.width).toBeCloseTo(
          firstPage.view[2]! - 40,
          0,
        )
        expect(Math.abs(role.transform[5] - date.transform[5])).toBeLessThan(3)
        const alpha = find('Alpha capability')
        for (const [index, name] of [
          'Alpha',
          'Bravo',
          'Charlie',
          'Delta',
        ].entries()) {
          const skill = find(`${name} capability`)
          expect(skill.transform[4]).toBeCloseTo(
            40 + (index * (firstPage.view[2]! - 80)) / 4,
            0,
          )
          expect(skill.transform[5]).toBeCloseTo(alpha.transform[5], 0)
        }
        expect(find('Echo capability').transform[4]).toBeCloseTo(40, 0)
        expect(find('Echo capability').transform[5]).toBeLessThan(
          alpha.transform[5],
        )
        const text = items
          .filter((item) => item.transform[5] > 40)
          .map((item) => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
        const sequence = [
          'ALEX MORGAN',
          'PRODUCT DESIGNER',
          'San Francisco, CA',
          '+1 415 555 0142',
          'alex@example.com',
          'alexmorgan.example',
          'linkedin.com/in/alex-example',
          'SUMMARY',
          'Product designer turning',
          'PROFESSIONAL EXPERIENCE',
          'Senior Product Designer',
          'Mar 2022 - Present',
          'EDUCATION',
          'TECHNICAL SKILLS',
          'Alpha capability',
          'Expert',
          'Bravo capability',
          'Charlie capability',
          'Delta capability',
          'Echo capability',
          'PROJECTS',
          'Community Toolkit',
          'ADDITIONAL INFORMATION',
          'Languages:',
          'French (conversational)',
          'Certifications:',
          'Accessibility Practitioner',
          'REFERENCES',
          'Jordan Example',
          'jordan@example.com',
        ]
        let position = -1
        for (const value of sequence) {
          const next = text.indexOf(value, position + 1)
          expect(next, value).toBeGreaterThan(position)
          position = next
        }
        expect(text).toContain('\u2022 Plain achievement')
        expect(text).toContain('1. Numbered achievement')
        expect(text).not.toContain('\u2022 \u2022')
        expect(text).not.toContain('\u2022 -')
        expect(text).not.toContain('AWARDS')
      } finally {
        await task.destroy()
      }
    })
  }

  it('prime-ats omits blank optional sections', async () => {
    const cv = createEmptyCv()
    cv.summary = '   '
    cv.languages = ['   ']
    cv.certifications = ['   ']
    const appearance = createDocument('prime-ats').appearance
    const render = await templateRegistry.resolve('prime-ats').load()
    const buffer = await renderToBuffer(render({ cv, appearance }))
    const task = getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
    })
    const pdf = await task.promise
    try {
      const items = (
        await (await pdf.getPage(1)).getTextContent()
      ).items.filter((item) => 'str' in item)
      const text = items.map((item) => item.str).join(' ')
      expect(text).toContain('YOUR NAME')
      expect(text).not.toMatch(
        /SUMMARY|PROFESSIONAL EXPERIENCE|EDUCATION|TECHNICAL SKILLS|PROJECTS|ADDITIONAL INFORMATION|REFERENCES/,
      )
    } finally {
      await task.destroy()
    }
  })

  it.each(['classic', 'traditional', 'prime-ats'])(
    '%s preserves long profile and a single experience across page breaks',
    async (templateId) => {
      const cv = createEmptyCv()
      cv.personal.fullName = 'Avery Example'
      cv.summary = Array.from(
        { length: 80 },
        (_, index) => `Profile passage ${index} describes thoughtful work.`,
      ).join(' ')
      cv.experience = [
        {
          id: 'long-entry',
          role: 'Engineer',
          employer: 'Example Works',
          location: 'Remote',
          startDate: '2020-01',
          endDate: '',
          current: true,
          description: Array.from(
            { length: 100 },
            (_, index) => `Achievement ${index} improved a useful service.`,
          ).join('\n'),
        },
      ]
      const appearance = {
        ...createDocument(templateId).appearance,
        fontSize: 12 as const,
      }
      const render = await templateRegistry.resolve(templateId).load()
      const buffer = await renderToBuffer(render({ cv, appearance }))
      const task = getDocument({
        data: new Uint8Array(buffer),
        useSystemFonts: true,
      })
      const pdf = await task.promise
      try {
        expect(pdf.numPages).toBeGreaterThan(2)
        const pages = await Promise.all(
          Array.from({ length: pdf.numPages }, async (_, index) => {
            const page = await pdf.getPage(index + 1)
            const items = (await page.getTextContent()).items
              .filter((item) => 'str' in item)
              .filter((item) => item.str.trim())
            for (const item of items) {
              expect(item.transform[4]).toBeGreaterThanOrEqual(0)
              expect(item.transform[4] + item.width).toBeLessThanOrEqual(
                page.view[2]! + 1,
              )
              expect(item.transform[5]).toBeGreaterThan(15)
              expect(item.transform[5]).toBeLessThan(page.view[3]!)
            }
            return items
              .filter((item) => item.transform[5] > 40)
              .map((item) => item.str)
              .join(' ')
          }),
        )
        const text = pages.join(' ').replace(/\s+/g, ' ')
        for (let index = 0; index < 80; index++)
          expect(text).toContain(`Profile passage ${index}`)
        for (let index = 0; index < 100; index++)
          expect(text).toContain(`Achievement ${index}`)
        expect(text.match(/Avery Example/gi)).toHaveLength(1)
      } finally {
        await task.destroy()
      }
    },
  )

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
        expect(text.match(/Alex Morgan/gi)).toHaveLength(1)
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
