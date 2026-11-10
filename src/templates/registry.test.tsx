import { renderToBuffer } from '@react-pdf/renderer'
import { PDFDocument } from 'pdf-lib'
import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { describe, expect, it } from 'vitest'
import { createDocument, createEmptyCv } from '../domain/cv/defaults'
import { effectiveColors } from '../domain/cv/colors'
import { createExampleCv } from '../domain/cv/example'
import { translate } from '../i18n/messages'
import { createTemplateRegistry, templateRegistry } from './registry'
import { resolveSkillProficiencyDisplay } from './types'

describe('template registry', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'atelier mirrors its portrait layout and preserves flowing content in %s',
    async (language) => {
      const template = templateRegistry.resolve('atelier')
      expect(template.name).toBe('019')
      expect(template.headings).not.toHaveProperty('summary')
      const render = await template.load()
      const cv = createEmptyCv()
      cv.personal.fullName = 'Avery Example'
      cv.personal.email = 'avery@example.com'
      cv.personal.portrait =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aVVQAAAAASUVORK5CYII='
      cv.summary = 'Opening profile marker.'
      cv.skills = [{ id: 'skill', name: 'Studio planning', level: 4 }]
      cv.languages = ['Literal language']
      cv.experience = [
        {
          id: 'job',
          role: 'Example role',
          employer: 'Example employer',
          location: '',
          startDate: '2020-01',
          endDate: '',
          current: true,
          description: `${'Selectable achievement across page breaks.\n'.repeat(100)}Final achievement marker`,
        },
      ]
      const snapshot = structuredClone(cv)
      for (const pageSize of ['A4', 'LETTER'] as const) {
        const task = getDocument({
          data: new Uint8Array(
            await renderToBuffer(
              render({
                cv,
                appearance: {
                  ...createDocument(template.id, language).appearance,
                  pageSize,
                },
              }),
            ),
          ),
          useSystemFonts: true,
        })
        try {
          const pdf = await task.promise
          expect(pdf.numPages).toBeGreaterThan(1)
          const text: string[] = []
          for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            const page = await pdf.getPage(pageNumber)
            const items = (await page.getTextContent()).items.filter(
              (item) => 'str' in item,
            )
            const body = items.filter(
              (item) => item.str.trim() && item.transform[5] > 40,
            )
            expect(body.length).toBeGreaterThan(0)
            text.push(body.map((item) => item.str).join(' '))
            for (const item of items.filter((item) => item.str.trim())) {
              expect(item.transform[4]).toBeGreaterThanOrEqual(0)
              expect(item.transform[4] + item.width).toBeLessThanOrEqual(
                page.view[2]! + 1,
              )
              expect(item.transform[5]).toBeGreaterThan(15)
              expect(item.transform[5]).toBeLessThanOrEqual(page.view[3]!)
            }
            const operators = (await page.getOperatorList()).fnArray
            if (pageNumber === 1) {
              expect(operators).toContain(OPS.paintImageXObject)
              const contact = items.find(
                (item) => item.str === 'avery@example.com',
              )!
              const title = items.find((item) =>
                item.str.includes('Example role'),
              )!
              expect(contact).toBeDefined()
              expect(title).toBeDefined()
              if (language === 'ar')
                expect(contact.transform[4]).toBeGreaterThan(
                  title.transform[4] + title.width,
                )
              else
                expect(contact.transform[4] + contact.width).toBeLessThan(
                  title.transform[4],
                )
            } else expect(operators).not.toContain(OPS.paintImageXObject)
          }
          const combined = text.join(' ').replace(/\s+/g, ' ')
          for (const value of [
            'Opening profile marker.',
            'Final achievement marker',
            'Studio planning',
            'Literal language',
          ])
            expect(combined).toContain(value)
          expect(combined.match(/Avery Example/g)).toHaveLength(1)
          expect(cv).toEqual(snapshot)
        } finally {
          await task.destroy()
        }
      }
    },
  )

  it.each(['en', 'fr', 'ar'] as const)(
    'confetti centers its identity, mirrors date rails and repeats artwork in %s',
    async (language) => {
      const template = templateRegistry.resolve('confetti')
      expect(template.name).toBe('018')
      expect(template.portraitShape).toBe('square')
      const render = await template.load()
      const cv = createEmptyCv()
      cv.personal.fullName = 'Avery Example'
      cv.personal.email = 'avery@example.com'
      cv.personal.portrait =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aVVQAAAAASUVORK5CYII='
      cv.summary = 'Opening profile marker.'
      cv.experience = [
        {
          id: 'job',
          role: 'Example role',
          employer: 'Example employer',
          location: 'Rail location',
          startDate: '2020-01',
          endDate: '',
          current: true,
          description: `${'Selectable achievement across page breaks.\n'.repeat(100)}Final achievement marker`,
        },
      ]
      cv.languages = ['Literal language']
      const snapshot = structuredClone(cv)
      for (const pageSize of ['A4', 'LETTER'] as const) {
        const task = getDocument({
          data: new Uint8Array(
            await renderToBuffer(
              render({
                cv,
                appearance: {
                  ...createDocument(template.id, language).appearance,
                  pageSize,
                },
              }),
            ),
          ),
          useSystemFonts: true,
        })
        try {
          const pdf = await task.promise
          expect(pdf.numPages).toBeGreaterThan(1)
          const texts: string[] = []
          for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            const page = await pdf.getPage(pageNumber)
            const items = (await page.getTextContent()).items.filter(
              (item) => 'str' in item,
            )
            expect(
              items.some((item) => item.str.trim() && item.transform[5] > 40),
            ).toBe(true)
            texts.push(items.map((item) => item.str).join(' '))
            for (const item of items.filter((item) => item.str.trim())) {
              expect(item.transform[4]).toBeGreaterThanOrEqual(0)
              expect(item.transform[4] + item.width).toBeLessThanOrEqual(
                page.view[2]! + 1,
              )
              expect(item.transform[5]).toBeGreaterThan(15)
              expect(item.transform[5]).toBeLessThanOrEqual(page.view[3]!)
            }
            const operators = await page.getOperatorList()
            expect(
              operators.fnArray.filter((value) => value === OPS.constructPath)
                .length,
            ).toBeGreaterThanOrEqual(78)
            if (pageNumber === 1) {
              expect(operators.fnArray).toContain(OPS.paintImageXObject)
              const name = items.find((item) => item.str === 'Avery Example')!
              expect(name.transform[4] + name.width / 2).toBeCloseTo(
                page.view[2]! / 2,
                0,
              )
              const location = items.find(
                (item) => item.str === 'Rail location',
              )!
              const title = items.find((item) =>
                item.str.includes('Example role'),
              )!
              if (language === 'ar')
                expect(location.transform[4]).toBeGreaterThan(
                  title.transform[4] + title.width,
                )
              else
                expect(location.transform[4] + location.width).toBeLessThan(
                  title.transform[4],
                )
            } else
              expect(operators.fnArray).not.toContain(OPS.paintImageXObject)
          }
          const text = texts.join(' ').replace(/\s+/g, ' ')
          expect(text).toContain('Final achievement marker')
          expect(text).toContain('Literal language')
          expect(text).toContain('avery@example.com')
          expect(text.match(/Avery Example/g)).toHaveLength(1)
          for (const number of ['01', '02', '03'])
            expect(text).toContain(number)
          expect(text).not.toContain('04')
          expect(cv).toEqual(snapshot)
        } finally {
          await task.destroy()
        }
      }
    },
  )

  it.each(['A4', 'LETTER'] as const)(
    'flora has no decoration-only pages on %s',
    async (pageSize) => {
      const template = templateRegistry.resolve('flora')
      const render = await template.load()
      const cv = createExampleCv()
      cv.personal.portrait =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aVVQAAAAASUVORK5CYII='
      cv.references = ['Casey Example', 'Jordan Example'].map((name) => ({
        id: name,
        name,
        jobTitle: '',
        organization: 'Example Studio',
        email: 'person@example.com',
        phone: '',
      }))
      const task = getDocument({
        data: new Uint8Array(
          await renderToBuffer(
            render({
              cv,
              appearance: {
                ...createDocument(template.id).appearance,
                pageSize,
              },
            }),
          ),
        ),
        useSystemFonts: true,
      })
      try {
        const pdf = await task.promise
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber)
          const items = (await page.getTextContent()).items.filter(
            (item) => 'str' in item,
          )
          expect(
            items.some((item) => item.str.trim() && item.transform[5] > 40),
            `Body on page ${pageNumber}: ${JSON.stringify(items.map((item) => [item.str, item.transform[5]]))}`,
          ).toBe(true)
        }
      } finally {
        await task.destroy()
      }
    },
  )

  it.each(['en', 'fr', 'ar'] as const)(
    'flora centers its identity, mirrors its columns and preserves flowing text in %s',
    async (language) => {
      const template = templateRegistry.resolve('flora')
      expect(template.name).toBe('017')
      const render = await template.load()
      const cv = createExampleCv()
      cv.personal.fullName = 'Avery Example'
      cv.personal.portrait =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aVVQAAAAASUVORK5CYII='
      cv.summary = 'Opening profile marker.'
      cv.skills = [
        { id: 'rated', name: 'Rated capability', level: 3 },
        { id: 'unrated', name: 'Unrated capability', level: null },
      ]
      cv.languages = ['Literal language']
      cv.experience[0]!.description = `${'Selectable achievement across page breaks.\n'.repeat(100)}Final achievement marker`
      const snapshot = structuredClone(cv)
      for (const pageSize of ['A4', 'LETTER'] as const) {
        const task = getDocument({
          data: new Uint8Array(
            await renderToBuffer(
              render({
                cv,
                appearance: {
                  ...createDocument(template.id, language).appearance,
                  pageSize,
                },
              }),
            ),
          ),
          useSystemFonts: true,
        })
        try {
          const pdf = await task.promise
          expect(pdf.numPages).toBeGreaterThan(1)
          const texts: string[] = []
          for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            const page = await pdf.getPage(pageNumber)
            const items = (await page.getTextContent()).items.filter(
              (item) => 'str' in item,
            )
            texts.push(items.map((item) => item.str).join(' '))
            for (const item of items.filter((item) => item.str.trim())) {
              expect(item.transform[4]).toBeGreaterThanOrEqual(0)
              expect(item.transform[4] + item.width).toBeLessThanOrEqual(
                page.view[2]! + 1,
              )
              expect(item.transform[5]).toBeGreaterThan(15)
              expect(item.transform[5]).toBeLessThanOrEqual(page.view[3]!)
            }
            const operators = await page.getOperatorList()
            const fills = operators.argsArray.filter(
              (_, index) => operators.fnArray[index] === OPS.setFillRGBColor,
            )
            expect(JSON.stringify(fills)).toContain('#f2f0e3')
            if (pageNumber === 1) {
              expect(operators.fnArray).toContain(OPS.paintImageXObject)
              const name = items.find((item) => item.str === 'Avery Example')!
              expect(name).toBeDefined()
              expect(name.transform[4] + name.width / 2).toBeCloseTo(
                page.view[2]! / 2,
                0,
              )
              const skill = items.find(
                (item) => item.str === 'Rated capability',
              )!
              const summary = items.find((item) =>
                item.str.includes('Opening profile marker'),
              )!
              expect(skill).toBeDefined()
              expect(summary).toBeDefined()
              if (language === 'ar')
                expect(skill.transform[4]).toBeGreaterThan(summary.transform[4])
              else expect(skill.transform[4]).toBeLessThan(summary.transform[4])
            } else
              expect(operators.fnArray).not.toContain(OPS.paintImageXObject)
          }
          const text = texts.join(' ').replace(/\s+/g, ' ')
          expect(text).toContain('Final achievement marker')
          expect(text).toContain('Literal language')
          expect(text).toContain('\u00b7')
          expect(text).not.toContain('\\u00b7')
          expect(text.match(/Avery Example/g)).toHaveLength(1)
          expect(cv).toEqual(snapshot)
        } finally {
          await task.destroy()
        }
      }
    },
  )

  it.each(['en', 'fr', 'ar'] as const)(
    'editorial preserves its lead, split rows and flowing content in %s',
    async (language) => {
      const template = templateRegistry.resolve('editorial')
      expect(template.name).toBe('016')
      expect(template.headings).not.toHaveProperty('summary')
      const render = await template.load()
      const cv = createExampleCv()
      cv.personal.fullName = 'Avery Example'
      cv.personal.portrait =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aVVQAAAAASUVORK5CYII='
      cv.summary = 'Opening statement.\n\nSupporting paragraph.'
      cv.skills = Array.from({ length: 5 }, (_, index) => ({
        id: `skill-${index}`,
        name: `Capability ${index}`,
        level: null,
      }))
      cv.experience = [
        {
          id: 'job',
          role: 'Example role',
          employer: 'Example employer',
          location: '',
          startDate: '2020-01',
          endDate: '',
          current: true,
          description: `${'A selectable achievement across page breaks.\n'.repeat(100)}Final achievement marker`,
        },
      ]
      const snapshot = structuredClone(cv)
      for (const pageSize of ['A4', 'LETTER'] as const) {
        const appearance = {
          ...createDocument(template.id, language).appearance,
          pageSize,
        }
        const task = getDocument({
          data: new Uint8Array(
            await renderToBuffer(render({ cv, appearance })),
          ),
          useSystemFonts: true,
        })
        try {
          const pdf = await task.promise
          expect(pdf.numPages).toBeGreaterThan(1)
          const texts: string[] = []
          for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            const page = await pdf.getPage(pageNumber)
            const items = (await page.getTextContent()).items.filter(
              (item) => 'str' in item,
            )
            texts.push(items.map((item) => item.str).join(' '))
            for (const item of items.filter((item) => item.str.trim())) {
              expect(item.transform[4]).toBeGreaterThanOrEqual(-1)
              expect(item.transform[4] + item.width).toBeLessThanOrEqual(
                page.view[2]! + 1,
              )
              expect(item.transform[5]).toBeGreaterThan(0)
              expect(item.transform[5]).toBeLessThanOrEqual(page.view[3]!)
            }
            const operators = await page.getOperatorList()
            const fills = operators.argsArray.filter(
              (_, index) => operators.fnArray[index] === OPS.setFillRGBColor,
            )
            if (pageNumber === 1) {
              expect(JSON.stringify(fills)).toContain('#f6eee2')
              expect(operators.fnArray).toContain(OPS.paintImageXObject)
              const lead = items.find((item) =>
                item.str.includes('Opening statement'),
              )!
              const support = items.find((item) =>
                item.str.includes('Supporting paragraph'),
              )!
              expect(lead).toBeDefined()
              expect(support).toBeDefined()
              expect(lead.height).toBeGreaterThan(support.height * 1.5)
              const role = items.find((item) =>
                item.str.includes('Example role'),
              )!
              const achievement = items.find((item) =>
                item.str.includes('selectable achievement'),
              )!
              expect(role).toBeDefined()
              expect(achievement).toBeDefined()
              if (language === 'ar')
                expect(role.transform[4]).toBeGreaterThan(
                  achievement.transform[4],
                )
              else
                expect(role.transform[4]).toBeLessThan(achievement.transform[4])
              const skillPositions = [0, 1, 2].map((index) =>
                items.find((item) => item.str === `Capability ${index}`)!,
              )
              expect(skillPositions.every(Boolean)).toBe(true)
              expect(
                new Set(
                  skillPositions.map((item) => Math.round(item.transform[5])),
                ).size,
              ).toBe(1)
            } else {
              expect(JSON.stringify(fills)).not.toContain('#f6eee2')
              expect(operators.fnArray).not.toContain(OPS.paintImageXObject)
            }
          }
          const text = texts.join(' ').replace(/\s+/g, ' ')
          expect(text).toContain('Final achievement marker')
          expect(text.match(/Avery Example/g)).toHaveLength(1)
          expect(text.replace(/\s/g, '')).toContain(
            translate(language, 'Employment History').replace(/\s/g, ''),
          )
          for (let index = 0; index < 5; index++)
            expect(text).toContain(`Capability ${index}`)
          expect(cv).toEqual(snapshot)
        } finally {
          await task.destroy()
        }
      }
    },
  )

  it.each(['A4', 'LETTER'] as const)(
    'numbered keeps ordinary employment on the first %s page beside a square portrait',
    async (pageSize) => {
      const template = templateRegistry.resolve('numbered')
      const cv = createExampleCv()
      cv.personal.portrait =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aVVQAAAAASUVORK5CYII='
      const render = await template.load()
      const task = getDocument({
        data: new Uint8Array(
          await renderToBuffer(
            render({
              cv,
              appearance: {
                ...createDocument(template.id).appearance,
                pageSize,
              },
            }),
          ),
        ),
        useSystemFonts: true,
      })
      try {
        const pdf = await task.promise
        const page = await pdf.getPage(1)
        const items = (await page.getTextContent()).items.filter(
          (item) => 'str' in item,
        )
        const employment = items.find(
          (item) => item.str.trim() === 'EMPLOYMENT HISTORY',
        )
        expect(
          employment,
          JSON.stringify(
            items
              .filter((item) => item.str.trim())
              .map((item) => [item.str, item.transform[5]]),
          ),
        ).toBeDefined()
        expect(items.map((item) => item.str).join(' ')).toContain(
          cv.experience[0]!.role,
        )
        const profile = items.find((item) => item.str.trim() === 'PROFILE')!
        const identity = items.filter(
          (item) => item.str.trim() && item.transform[5] > profile.transform[5],
        )
        for (const item of identity)
          expect(item.transform[4] + item.width).toBeLessThanOrEqual(
            page.view[2]! - 30 - 166 - 26 + 1,
          )
      } finally {
        await task.destroy()
      }
    },
  )

  it('numbered preserves paired entries across pages and closes heading-number gaps', async () => {
    const template = templateRegistry.resolve('numbered')
    expect(template.name).toBe('015')
    const render = await template.load()
    const cv = createEmptyCv()
    cv.skills = [{ id: 'skill', name: 'Example skill', level: 3 }]
    cv.languages = ['Literal language']
    cv.experience = Array.from({ length: 3 }, (_, index) => ({
      id: `job-${index}`,
      role: `Role ${index}`,
      employer: 'Example employer',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: `${'A long description that must remain selectable across page breaks.\n'.repeat(60)}Final marker ${index}`,
    }))
    const snapshot = structuredClone(cv)
    for (const language of ['en', 'fr', 'ar'] as const) {
      for (const pageSize of ['A4', 'LETTER'] as const) {
        const appearance = {
          ...createDocument(template.id, language).appearance,
          pageSize,
        }
        const task = getDocument({
          data: new Uint8Array(
            await renderToBuffer(render({ cv, appearance })),
          ),
          useSystemFonts: true,
        })
        try {
          const pdf = await task.promise
          expect(pdf.numPages).toBeGreaterThan(1)
          const texts: string[] = []
          for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            const page = await pdf.getPage(pageNumber)
            const items = (await page.getTextContent()).items.filter(
              (item) => 'str' in item,
            )
            texts.push(items.map((item) => item.str).join(' '))
            for (const item of items.filter((item) => item.str.trim())) {
              expect(item.transform[4]).toBeGreaterThanOrEqual(-1)
              expect(item.transform[4] + item.width).toBeLessThanOrEqual(
                page.view[2]! + 1,
              )
              expect(item.transform[5]).toBeGreaterThan(0)
            }
            if (pageNumber === 1) {
              expect(items.some((item) => item.str === '1')).toBe(true)
              expect(items.some((item) => item.str === '2')).toBe(true)
              expect(items.some((item) => item.str === '3')).toBe(true)
              expect(items.some((item) => item.str === '4')).toBe(false)
            }
          }
          const text = texts.join(' ').replace(/\s+/g, ' ')
          expect(text.replace(/\s/g, '')).toContain(
            translate(language, 'Employment History')
              .toUpperCase()
              .replace(/\s/g, ''),
          )
          expect(text.replace(/\s/g, '')).toContain(
            translate(language, 'Page {page}', { page: '' }).replace(/\s/g, ''),
          )
          for (let index = 0; index < 3; index++)
            expect(text).toContain(`Final marker ${index}`)
          expect(text).toContain('Literal language')
          expect(cv).toEqual(snapshot)
        } finally {
          await task.destroy()
        }
      }
    }
  })

  it.each(['en', 'ar'] as const)(
    'botanical keeps profile clear of the organic portrait and repeats its surface in %s',
    async (language) => {
      const template = templateRegistry.resolve('botanical')
      const render = await template.load()
      const cv = createExampleCv()
      cv.personal.fullName = 'Avery Example'
      cv.personal.portrait =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aVVQAAAAASUVORK5CYII='
      cv.summary = 'Profile passage beside the portrait.'
      cv.headings = { details: 'Contact details' }
      cv.skills = Array.from({ length: 70 }, (_, index) => ({
        id: `skill-${index}`,
        name: `Capability ${index}`,
        level: 3,
      }))
      for (const pageSize of ['A4', 'LETTER'] as const) {
        const appearance = {
          ...createDocument(template.id, language).appearance,
          pageSize,
        }
        const snapshot = structuredClone({ cv, appearance })
        const task = getDocument({
          data: new Uint8Array(
            await renderToBuffer(render({ cv, appearance })),
          ),
          useSystemFonts: true,
        })
        try {
          const pdf = await task.promise
          expect(pdf.numPages).toBeGreaterThan(1)
          const texts: string[] = []
          for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            const page = await pdf.getPage(pageNumber)
            const items = (await page.getTextContent()).items.filter(
              (item) => 'str' in item,
            )
            texts.push(items.map((item) => item.str).join(' '))
            const operators = await page.getOperatorList()
            const fills = operators.argsArray.filter(
              (_, index) => operators.fnArray[index] === OPS.setFillRGBColor,
            )
            expect(JSON.stringify(fills)).toContain('#f7f6ff')
            if (pageNumber === 1) {
              expect(operators.fnArray).toContain(OPS.paintImageXObject)
              const profile = items.filter((item) =>
                /Profile|passage|beside|portrait/.test(item.str),
              )
              expect(profile.length).toBeGreaterThan(0)
              for (const item of profile) {
                if (language === 'ar')
                  expect(item.transform[4]).toBeGreaterThanOrEqual(244)
                else
                  expect(item.transform[4] + item.width).toBeLessThanOrEqual(
                    page.view[2]! - 244,
                  )
              }
              const details = items.find(
                (item) => item.str === 'Contact details',
              )!
              expect(details).toBeDefined()
              if (language === 'ar')
                expect(details.transform[4]).toBeLessThan(page.view[2]! / 2)
              else
                expect(details.transform[4]).toBeGreaterThan(page.view[2]! / 2)
            } else
              expect(operators.fnArray).not.toContain(OPS.paintImageXObject)
          }
          const text = texts.join(' ').replace(/\s+/g, ' ')
          expect(text.match(/Avery Example/g)).toHaveLength(1)
          for (let index = 0; index < 70; index++)
            expect(text).toContain(`Capability ${index}`)
          expect({ cv, appearance }).toEqual(snapshot)
        } finally {
          await task.destroy()
        }
      }
    },
  )

  for (const template of templateRegistry.templates) {
    it(`${template.id} wraps long and mixed-script headings within PDF pages`, async () => {
      const render = await template.load()
      for (const title of [
        'Career achievements and selected professional contributions across many projects',
        'W'.repeat(80),
        '\u0627\u0644\u062e\u0628\u0631\u0627\u062a \u0627\u0644\u0645\u0647\u0646\u064a\u0629 / Career Journey',
      ]) {
        const cv = createExampleCv()
        cv.headings = { summary: title, experience: title, skills: title }
        const snapshot = structuredClone(cv)
        for (const pageSize of ['A4', 'LETTER'] as const) {
          const appearance = {
            ...createDocument(template.id).appearance,
            pageSize,
          }
          const buffer = await renderToBuffer(render({ cv, appearance }))
          const task = getDocument({
            data: new Uint8Array(buffer),
            useSystemFonts: true,
          })
          try {
            const pdf = await task.promise
            const extracted: string[] = []
            for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
              const page = await pdf.getPage(pageNumber)
              const items = (await page.getTextContent()).items.filter(
                (item) => 'str' in item,
              )
              extracted.push(items.map((item) => item.str).join(' '))
              for (const item of items.filter((item) => item.str.trim())) {
                expect(item.transform[4], title).toBeGreaterThanOrEqual(-1)
                expect(
                  item.transform[4] + item.width,
                  title,
                ).toBeLessThanOrEqual(page.view[2]! + 1)
                expect(item.transform[5], title).toBeGreaterThan(0)
                expect(item.transform[5], title).toBeLessThanOrEqual(
                  page.view[3]!,
                )
              }
            }
            const text = extracted.join(' ').replace(/[\s-]+/g, '')
            if (/\p{Script=Arabic}/u.test(title)) {
              expect(text).toContain('CareerJourney')
              for (const character of Array.from(
                title.replace(/\s/g, ''),
              ).filter((value) => /\p{Script=Arabic}/u.test(value)))
                expect(text).toContain(character)
            } else expect(text).toContain(title.replace(/\s+/g, ''))
          } finally {
            await task.destroy()
          }
          expect(cv).toEqual(snapshot)
        }
      }
    })

    it(`${template.id} renders literal custom headings without adding empty sections`, async () => {
      const cv = createExampleCv()
      cv.certifications = ['Example certificate']
      cv.projects = [
        { id: 'project', name: 'Example project', url: '', description: '' },
      ]
      cv.references = [
        {
          id: 'reference',
          name: 'Jordan Example',
          jobTitle: '',
          organization: '',
          email: '',
          phone: '',
        },
      ]
      cv.headings = {
        details: 'Contact me',
        summary: 'My Profile',
        experience: 'Career Journey',
        education: 'My Studies',
        skills: 'My Toolkit',
        languages: 'Spoken Words',
        certifications: 'My Credentials',
        projects: 'Selected Work',
        references: 'My Contacts',
        additionalInformation: 'More About Me',
      }
      const render = await template.load()
      for (const language of ['en', 'fr', 'ar'] as const) {
        const appearance = createDocument(template.id, language).appearance
        const buffer = await renderToBuffer(render({ cv, appearance }))
        const task = getDocument({
          data: new Uint8Array(buffer),
          useSystemFonts: true,
        })
        try {
          const pdf = await task.promise
          const text: string[] = []
          for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            const page = await pdf.getPage(pageNumber)
            text.push(
              (await page.getTextContent()).items
                .filter((item) => 'str' in item)
                .map((item) => item.str)
                .join(' '),
            )
          }
          const extracted = text.join(' ').replace(/\s+/g, '')
          for (const key of Object.keys(template.headings ?? {})) {
            const value = cv.headings[key as keyof typeof cv.headings]
            expect(extracted, `${template.id} ${language} ${key}`).toContain(
              value?.replace(/\s+/g, ''),
            )
          }
        } finally {
          await task.destroy()
        }
      }
      const empty = createEmptyCv()
      empty.headings = cv.headings
      const buffer = await renderToBuffer(
        render({
          cv: empty,
          appearance: createDocument(template.id).appearance,
        }),
      )
      const task = getDocument({
        data: new Uint8Array(buffer),
        useSystemFonts: true,
      })
      try {
        const pdf = await task.promise
        const page = await pdf.getPage(1)
        const text = (await page.getTextContent()).items
          .filter((item) => 'str' in item)
          .map((item) => item.str)
          .join(' ')
        for (const value of Object.values(cv.headings))
          expect(text).not.toContain(value)
      } finally {
        await task.destroy()
      }
    })
  }

  it('resolves proficiency display capabilities without changing the preferred mode', () => {
    for (const template of templateRegistry.templates) {
      const appearance = createDocument(template.id).appearance
      expect(resolveSkillProficiencyDisplay(template, undefined)).toBe(
        template.skillProficiencyDisplay?.defaultMode ?? 'text',
      )
      for (const preferred of ['bar', 'text', 'both', 'dots'] as const) {
        appearance.skillProficiencyDisplay = preferred
        expect(resolveSkillProficiencyDisplay(template, preferred)).toBe(
          template.skillProficiencyDisplay?.modes.includes(preferred)
            ? preferred
            : (template.skillProficiencyDisplay?.defaultMode ?? 'text'),
        )
        expect(appearance.skillProficiencyDisplay).toBe(preferred)
      }
      if (template.skillProficiencyDisplay)
        expect(template.skillProficiencyDisplay.modes).toContain(
          template.skillProficiencyDisplay.defaultMode,
        )
    }
  })

  it.each(
    [
      'sidebar',
      'timeline',
      'columnar',
      'ruled',
      'charcoal',
      'framed',
      'botanical',
      'numbered',
      'flora',
    ].flatMap((id) =>
      (['en', 'fr', 'ar'] as const).map((language) => [id, language] as const),
    ),
  )(
    '%s renders proficiency display labels and bar geometry in %s PDFs',
    async (id, language) => {
      const template = templateRegistry.resolve(id)
      const render = await template.load()
      const cv = createEmptyCv()
      cv.personal.fullName = 'Avery Example'
      cv.skills = [
        { id: 'rated', name: 'Rated capability', level: 3 },
        { id: 'unrated', name: 'Unrated capability', level: null },
        { id: 'blank', name: ' ', level: 5 },
      ]
      const snapshot = structuredClone(cv)
      for (const pageSize of ['A4', 'LETTER'] as const) {
        const drawings: number[] = []
        const modes = [
          'text',
          'bar',
          'both',
          undefined,
          ...(template.skillProficiencyDisplay?.modes.includes('dots')
            ? ['dots' as const]
            : []),
        ] as const
        for (const mode of modes) {
          const appearance = {
            ...createDocument(template.id, language).appearance,
            pageSize,
            skillProficiencyDisplay: mode,
          }
          const buffer = await renderToBuffer(render({ cv, appearance }))
          const task = getDocument({
            data: new Uint8Array(buffer),
            useSystemFonts: true,
          })
          try {
            const pdf = await task.promise
            expect(pdf.numPages).toBe(1)
            const page = await pdf.getPage(1)
            const items = (await page.getTextContent()).items.filter(
              (item) => 'str' in item,
            )
            const text = items.map((item) => item.str).join(' ')
            expect(text).toContain('Rated capability')
            expect(text).toContain('Unrated capability')
            const label = translate(language, 'Intermediate')
            if (
              ['bar', 'dots'].includes(
                mode ?? template.skillProficiencyDisplay?.defaultMode ?? 'text',
              )
            )
              expect(text).not.toContain(label)
            else expect(text.match(new RegExp(label, 'g'))).toHaveLength(1)
            expect(text).not.toContain(translate(language, 'Expert'))
            expect(
              items.some(
                (item) => item.str.trim() === translate(language, 'Unrated'),
              ),
            ).toBe(false)
            for (const item of items.filter((item) => item.str.trim())) {
              expect(item.transform[4]).toBeGreaterThanOrEqual(0)
              expect(item.transform[4] + item.width).toBeLessThanOrEqual(
                page.view[2]! + 1,
              )
              expect(item.transform[5]).toBeGreaterThan(0)
            }
            const operators = await page.getOperatorList()
            drawings.push(
              operators.fnArray.filter((value) => value === OPS.constructPath)
                .length,
            )
          } finally {
            await task.destroy()
          }
          expect(cv).toEqual(snapshot)
        }
        expect(drawings[1]).toBe(drawings[0]! + (id === 'botanical' ? 10 : 4))
        expect(drawings[2]).toBe(drawings[1])
        if (template.skillProficiencyDisplay?.defaultMode === 'dots') {
          expect(drawings[3]).toBeGreaterThan(drawings[2]!)
          expect(drawings[4]).toBe(drawings[3])
        } else expect(drawings[3]).toBe(drawings[2])
      }
    },
  )

  for (const { id } of templateRegistry.templates) {
    it(`${id} applies independent color roles to real PDFs`, async () => {
      const cv = createExampleCv()
      const appearance = createDocument(id).appearance
      appearance.colors = {
        headings: '#913355',
        details: '#345678',
        body: '#263947',
        accent: '#a53b12',
        surface: '#eeeeee',
      }
      const render = await templateRegistry.resolve(id).load()
      const buffer = await renderToBuffer(render({ cv, appearance }))
      const task = getDocument({
        data: new Uint8Array(buffer),
        useSystemFonts: true,
      })
      try {
        const pdf = await task.promise
        const page = await pdf.getPage(1)
        const operators = await page.getOperatorList()
        const fills = operators.argsArray.filter(
          (_, index) => operators.fnArray[index] === OPS.setFillRGBColor,
        )
        for (const color of ['#913355', '#345678', '#263947']) {
          expect(JSON.stringify(fills), color).toContain(color)
        }
        const strokes = operators.argsArray.filter(
          (_, index) => operators.fnArray[index] === OPS.setStrokeRGBColor,
        )
        if (!['sidebar', 'executive', 'columnar', 'sage'].includes(id))
          expect(JSON.stringify(strokes)).toContain('#a53b12')
        if (
          [
            'sidebar',
            'traditional',
            'columnar',
            'sage',
            'charcoal',
            'framed',
            'botanical',
            'flora',
            'atelier',
          ].includes(id)
        ) {
          expect(JSON.stringify(fills)).toContain('#eeeeee')
        }
      } finally {
        await task.destroy()
      }
    })
  }

  it('keeps permanent template numbers independent of order and default', () => {
    const expected = {
      classic: '001',
      modern: '002',
      sidebar: '003',
      traditional: '004',
      'prime-ats': '005',
      'pure-ats': '006',
      executive: '007',
      timeline: '008',
      columnar: '009',
      ruled: '010',
      sage: '011',
      charcoal: '012',
      framed: '013',
      botanical: '014',
      numbered: '015',
      editorial: '016',
      flora: '017',
      confetti: '018',
      atelier: '019',
    }
    const reordered = createTemplateRegistry(
      [...templateRegistry.templates].reverse(),
      templateRegistry.defaultId,
    )
    for (const [id, number] of Object.entries(expected)) {
      expect(templateRegistry.resolve(id).name).toBe(number)
      expect(reordered.resolve(id).name).toBe(number)
    }
    expect(templateRegistry.resolve('removed').name).toBe('002')
    const reduced = createTemplateRegistry(
      templateRegistry.templates.filter(
        (template) => template.id !== 'classic',
      ),
      templateRegistry.defaultId,
    )
    expect(reduced.resolve('sidebar').name).toBe('003')
  })

  it.each(['A4', 'LETTER'] as const)(
    'timeline centers its identity above separate details and career columns on %s',
    async (pageSize) => {
      const template = templateRegistry.resolve('timeline')
      expect(template.name).toBe('008')
      const cv = createExampleCv()
      cv.skills = [
        { id: 'rated', name: 'Rated capability', level: 3 },
        { id: 'unrated', name: 'Unrated capability', level: null },
      ]
      const snapshot = structuredClone(cv)
      const render = await template.load()
      const appearance = { ...createDocument(template.id).appearance, pageSize }
      const task = getDocument({
        data: new Uint8Array(await renderToBuffer(render({ cv, appearance }))),
        useSystemFonts: true,
      })
      try {
        const pdf = await task.promise
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
        expect(name.transform[4] + name.width / 2).toBeCloseTo(
          page.view[2]! / 2,
          0,
        )
        const email = find('alex@example.com')
        const profile = find('PROFILE')
        expect(email.transform[4] + email.width).toBeLessThan(
          profile.transform[4],
        )
        expect(profile.transform[5]).toBeLessThan(name.transform[5])
        expect(find('Rated capability').transform[4]).toBeLessThan(
          profile.transform[4],
        )
        expect(find('March 2022 - Present').transform[5]).toBeLessThan(
          find('Senior Product Designer').transform[5],
        )
        const allText: string[] = []
        for (let number = 1; number <= pdf.numPages; number++) {
          const current = await pdf.getPage(number)
          const content = (await current.getTextContent()).items.filter(
            (item) => 'str' in item,
          )
          allText.push(content.map((item) => item.str).join(' '))
          for (const item of content.filter((item) => item.str.trim())) {
            expect(item.transform[4]).toBeGreaterThanOrEqual(0)
            expect(item.transform[4] + item.width).toBeLessThanOrEqual(
              current.view[2]! + 1,
            )
            expect(item.transform[5]).toBeGreaterThan(0)
          }
        }
        expect(allText.join(' ')).toContain('Unrated capability')
        expect(allText.join(' ')).toContain('California College')
      } finally {
        await task.destroy()
      }
      expect(cv).toEqual(snapshot)
    },
  )

  it('rejects duplicate or non-numeric template numbers', () => {
    const first = templateRegistry.templates[0]!
    expect(() =>
      createTemplateRegistry([first, { ...first, id: 'other' }], first.id),
    ).toThrow(/numbers must be unique/)
    for (const name of ['Classic', '01', '٠٠١']) {
      expect(() =>
        createTemplateRegistry([{ ...first, name }], first.id),
      ).toThrow(/three digits/)
    }
  })

  it.each(
    (['en', 'ar'] as const).flatMap((language) =>
      (['A4', 'LETTER'] as const).map(
        (pageSize) => [language, pageSize] as const,
      ),
    ),
  )(
    'columnar separates its identity and navy sidebar in %s on %s',
    async (language, pageSize) => {
      const template = templateRegistry.resolve('columnar')
      const cv = createExampleCv()
      cv.summary =
        'Thoughtful professional creating useful services.\nSecond profile line.'
      cv.headings = { summary: 'Profile label', details: 'Contact label' }
      cv.experience = [
        {
          ...cv.experience[0]!,
          role: 'Designer',
          employer: 'Example Studio',
          location: 'Remote',
          description:
            'First achievement.\n\u2022 Second achievement.\n1. Third achievement.',
        },
      ]
      cv.education = []
      cv.skills = [
        { id: 'rated', name: 'Rated capability', level: 3 },
        { id: 'unrated', name: 'Unrated capability', level: null },
      ]
      const appearance = {
        ...createDocument(template.id, language).appearance,
        pageSize,
      }
      const snapshot = structuredClone({ cv, appearance })
      expect(effectiveColors(appearance, template.colorDefaults).surface).toBe(
        '#0c2d4d',
      )
      expect(
        effectiveColors(
          { ...appearance, colors: { surface: '#eeeeee' } },
          template.colorDefaults,
        ).surface,
      ).toBe('#eeeeee')
      const render = await template.load()
      const task = getDocument({
        data: new Uint8Array(await renderToBuffer(render({ cv, appearance }))),
        useSystemFonts: true,
      })
      try {
        const pdf = await task.promise
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
        const name = find('Alex Morgan')
        const summary = find('Thoughtful professional')
        expect(
          summary.transform[5] - find('Second profile line.').transform[5],
        ).toBeCloseTo((appearance.fontSize - 2) * 1.5, 1)
        const email = find('alex@example.com')
        const profile = find('Profile label')
        const details = find('Contact label')
        const boundary = page.view[2]! * (language === 'ar' ? 0.32 : 0.68)
        for (const item of [name, summary, profile, find('Designer,')]) {
          if (language === 'ar')
            expect(item.transform[4]).toBeGreaterThan(boundary)
          else expect(item.transform[4] + item.width).toBeLessThan(boundary)
        }
        for (const item of [email, details, find('Rated capability')]) {
          if (language === 'ar')
            expect(item.transform[4] + item.width).toBeLessThan(boundary)
          else expect(item.transform[4]).toBeGreaterThan(boundary)
        }
        expect(profile.transform[5]).toBeLessThan(name.transform[5])
        if (language === 'ar') expect(name.fontName).toBe(summary.fontName)
        else expect(name.fontName).not.toBe(summary.fontName)
        const text = items.map((item) => item.str).join(' ')
        expect(text).toContain('\u2022 First achievement.')
        expect(text).toContain('\u2022 Second achievement.')
        expect(text).not.toContain('\u2022 \u2022')
        expect(text).toContain('1. Third achievement.')
        expect(text).not.toContain('\u2022 1.')
        expect(text).not.toContain(translate(language, 'Intermediate'))
        const operators = await page.getOperatorList()
        const fills = operators.argsArray.filter(
          (_, index) => operators.fnArray[index] === OPS.setFillRGBColor,
        )
        expect(JSON.stringify(fills)).toContain('#0c2d4d')
        expect(JSON.stringify(fills)).toContain('#ffffff')
      } finally {
        await task.destroy()
      }
      expect({ cv, appearance }).toEqual(snapshot)
    },
  )

  it.each(
    (['en', 'ar'] as const).flatMap((language) =>
      (['A4', 'LETTER'] as const).map((size) => [language, size] as const),
    ),
  )(
    'ruled separates its full-width identity and white columns in %s on %s',
    async (language, pageSize) => {
      const template = templateRegistry.resolve('ruled')
      expect(template.name).toBe('010')
      expect(template.portraitShape).toBe('square')
      const cv = createExampleCv()
      cv.summary = 'First profile line.\nSecond profile line.'
      cv.headings = { summary: 'Profile label', details: 'Contact label' }
      cv.education = []
      cv.experience = [
        {
          ...cv.experience[0]!,
          role: 'Designer',
          employer: 'Example Studio',
          location: 'Remote',
          description:
            'First achievement.\n\u2022 Second achievement.\n1. Third achievement.',
        },
      ]
      cv.skills = [
        { id: 'rated', name: 'Rated capability', level: 3 },
        { id: 'unrated', name: 'Unrated capability', level: null },
      ]
      const appearance = {
        ...createDocument(template.id, language).appearance,
        pageSize,
      }
      const snapshot = structuredClone({ cv, appearance })
      const render = await template.load()
      const task = getDocument({
        data: new Uint8Array(await renderToBuffer(render({ cv, appearance }))),
        useSystemFonts: true,
      })
      try {
        const pdf = await task.promise
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
        const name = find('ALEX MORGAN')
        const profile = find('Profile label')
        const details = find('Contact label')
        const boundary =
          44 + (page.view[2]! - 88) * (language === 'ar' ? 0.72 : 0.28)
        for (const item of [
          profile,
          find('First profile line.'),
          find('Designer,'),
        ]) {
          if (language === 'ar')
            expect(item.transform[4] + item.width).toBeLessThan(boundary)
          else expect(item.transform[4]).toBeGreaterThan(boundary)
        }
        for (const item of [
          details,
          find('alex@example.com'),
          find('Rated capability'),
        ]) {
          if (language === 'ar')
            expect(item.transform[4]).toBeGreaterThan(boundary)
          else expect(item.transform[4] + item.width).toBeLessThan(boundary)
        }
        expect(profile.transform[5]).toBeLessThan(name.transform[5])
        expect(details.transform[5]).toBeCloseTo(profile.transform[5], 0)
        expect(
          find('First profile line.').transform[5] -
            find('Second profile line.').transform[5],
        ).toBeCloseTo((appearance.fontSize - 1) * 1.5, 1)
        expect(
          Math.abs(
            find('Remote').transform[5] - find('Designer,').transform[5],
          ),
        ).toBeLessThan(2)
        const text = items.map((item) => item.str).join(' ')
        expect(text).toContain('\u2022 First achievement.')
        expect(text).toContain('\u2022 Second achievement.')
        expect(text).toContain('1. Third achievement.')
        expect(text).not.toContain('\u2022 \u2022')
        expect(text).not.toContain('\u2022 1.')
        expect(text).not.toContain(translate(language, 'Intermediate'))
        expect(text).toContain('French (conversational)')
      } finally {
        await task.destroy()
      }
      expect({ cv, appearance }).toEqual(snapshot)
    },
  )

  for (const language of ['fr', 'ar'] as const) {
    for (const pageSize of ['A4', 'LETTER'] as const) {
      for (const { id } of templateRegistry.templates) {
        it(`${id} renders localized ${language} text with local fonts on ${pageSize}`, async () => {
          const template = templateRegistry.resolve(id)
          const render = await template.load()
          const cv = createExampleCv(language)
          cv.skills[0]!.level = 4
          cv.projects = [
            {
              id: 'localized-project',
              name: 'Figma Toolkit',
              url: 'https://toolkit.example',
              description:
                language === 'ar'
                  ? 'أدوات تصميم سهلة الاستخدام'
                  : 'Outils de design accessibles',
            },
          ]
          cv.references = [
            {
              id: 'localized-reference',
              name: language === 'ar' ? 'عمر Example' : 'Dominique Exemple',
              jobTitle: 'Team Lead',
              organization: 'Example Studio',
              email: 'reference@example.com',
              phone: '+1 415 555 0142',
            },
          ]
          const appearance = {
            ...createDocument(id, language).appearance,
            pageSize,
          }
          const buffer = await renderToBuffer(render({ cv, appearance }))
          const task = getDocument({
            data: new Uint8Array(buffer),
            useSystemFonts: true,
          })
          const pdf = await task.promise
          try {
            const text = (
              await Promise.all(
                Array.from({ length: pdf.numPages }, async (_, index) => {
                  const page = await pdf.getPage(index + 1)
                  const items = (await page.getTextContent()).items.filter(
                    (item) => 'str' in item,
                  )
                  for (const item of items.filter((item) => item.str.trim())) {
                    expect(item.transform[4], item.str).toBeGreaterThanOrEqual(
                      -1,
                    )
                    expect(
                      item.transform[4] + item.width,
                      item.str,
                    ).toBeLessThanOrEqual(page.view[2]! + 1)
                    expect(item.transform[5], item.str).toBeGreaterThan(0)
                    expect(item.transform[5], item.str).toBeLessThan(
                      page.view[3]!,
                    )
                  }
                  return items.map((item) => item.str).join(' ')
                }),
              )
            ).join(' ')
            expect(text.toLowerCase()).toContain(
              language === 'fr' ? 'camille martin' : 'ليلى',
            )
            expect(text.toLowerCase()).toContain(
              language === 'fr' ? 'mars 2022' : '2022',
            )
            expect(text).not.toContain('Present')
            expect(text).not.toContain('\uFFFD')
            expect(text).not.toMatch(/[\u2066-\u2069]/)
            expect(text.replace(/\s/g, '')).toContain(
              cv.summary.replace(/\s/g, ''),
            )
            expect(text).toContain(cv.personal.phone)
            expect(text).toContain('Figma Toolkit')
            expect(text).toContain('reference@example.com')
            if (
              !['bar', 'dots'].includes(
                resolveSkillProficiencyDisplay(
                  templateRegistry.resolve(id),
                  appearance.skillProficiencyDisplay,
                ),
              )
            )
              expect(text).toContain(translate(language, 'Advanced'))
            expect(text.toLowerCase()).not.toMatch(
              /\b(profile|education|present|references)\b/,
            )
          } finally {
            await task.destroy()
          }
        })
      }
    }
  }

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
        const date = find('March 2022 - Present')
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
        const date = find('March 2022 - Present')
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
        const date = find('March 2022 - Present')
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
          'March 2022 - Present',
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

  it.each(['prime-ats', 'pure-ats'])(
    '%s omits blank optional sections',
    async (templateId) => {
      const cv = createEmptyCv()
      cv.summary = '   '
      cv.languages = ['   ']
      cv.certifications = ['   ']
      const appearance = createDocument(templateId).appearance
      const render = await templateRegistry.resolve(templateId).load()
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
        expect(text.toUpperCase()).toContain('YOUR NAME')
        expect(text).not.toMatch(
          /PROFILE|SUMMARY|PROFESSIONAL EXPERIENCE|EDUCATION|TECHNICAL SKILLS|AREAS OF EXPERTISE|PROJECTS|LANGUAGES|CERTIFICATIONS|ADDITIONAL INFORMATION|REFERENCES/i,
        )
      } finally {
        await task.destroy()
      }
    },
  )

  for (const pageSize of ['A4', 'LETTER'] as const) {
    it(`pure-ats follows the reference geometry and reading order on ${pageSize}`, async () => {
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
        ...createDocument('pure-ats').appearance,
        pageSize,
        fontSize: pageSize === 'A4' ? (10 as const) : (12 as const),
        accent: '#292929' as const,
      }
      const render = await templateRegistry.resolve('pure-ats').load()
      const task = getDocument({
        data: new Uint8Array(await renderToBuffer(render({ cv, appearance }))),
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
            const footer = items.find(
              (item) => item.str === `Page ${index + 1}`,
            )!
            expect(footer).toBeDefined()
            expect(footer.transform[5]).toBeGreaterThan(15)
            expect(footer.transform[5]).toBeLessThan(40)
            expect(footer.transform[4] + footer.width).toBeCloseTo(
              page.view[2]! - 35,
              0,
            )
            const body = items.filter(
              (item) => item.str.trim() && item.transform[5] > 40,
            )
            expect(body.at(-1)?.str).not.toMatch(
              /^(Profile|Professional Experience|Education|Areas of Expertise|Projects|Languages|Certifications|References)$/,
            )
            return body
          }),
        )
        const items = pages.flat()
        const find = (value: string) => {
          const item = items.find((item) => item.str.includes(value))
          expect(item, value).toBeDefined()
          return item!
        }
        const firstPage = await pdf.getPage(1)
        const name = find('Alex Morgan')
        expect(name.transform[4]).toBeCloseTo(35, 0)
        expect(name.height).toBeCloseTo(appearance.fontSize * 1.8, 0)
        const role = find('Senior Product Designer')
        const date = find('March 2022 - Present')
        expect(date.transform[4]).toBeCloseTo(role.transform[4], 0)
        expect(date.transform[5]).toBeLessThan(role.transform[5])
        const alpha = find('Alpha capability')
        for (const [index, label] of [
          'Alpha',
          'Bravo',
          'Charlie',
          'Delta',
        ].entries()) {
          const skill = find(`${label} capability`)
          expect(skill.transform[4]).toBeCloseTo(
            35 + (index * (firstPage.view[2]! - 70)) / 4,
            0,
          )
          expect(skill.transform[5]).toBeCloseTo(alpha.transform[5], 0)
        }
        expect(find('Echo capability').transform[4]).toBeCloseTo(35, 0)
        expect(find('Echo capability').transform[5]).toBeLessThan(
          alpha.transform[5],
        )
        const text = items
          .map((item) => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
        let position = -1
        for (const value of [
          'Alex Morgan',
          'Product Designer',
          'San Francisco, CA',
          'alex@example.com',
          '+1 415 555 0142',
          'alexmorgan.example',
          'linkedin.com/in/alex-example',
          'Profile',
          'Professional Experience',
          'Senior Product Designer',
          'March 2022 - Present',
          'Education',
          'California College',
          'BFA, Communication Design',
          'Areas of Expertise',
          'Alpha capability',
          'Expert',
          'Bravo capability',
          'Charlie capability',
          'Delta capability',
          'Echo capability',
          'Projects',
          'Community Toolkit',
          'Languages',
          'French (conversational)',
          'Certifications',
          'Accessibility Practitioner',
          'References',
          'Jordan Example',
          'jordan@example.com',
        ]) {
          const next = text.indexOf(value, position + 1)
          expect(next, value).toBeGreaterThan(position)
          position = next
        }
        expect(text).toContain('\u2022 Plain achievement')
        expect(text).toContain('- Existing dash')
        expect(text).toContain('1. Numbered achievement')
        expect(text).not.toContain('\u2022 \u2022')
        expect(text).not.toContain('\u2022 -')
      } finally {
        await task.destroy()
      }
    })
  }

  for (const pageSize of ['A4', 'LETTER'] as const) {
    it(`executive follows the reference header, expertise grid and footer on ${pageSize}`, async () => {
      const cv = createExampleCv()
      cv.headings = { summary: 'Hidden profile label' }
      cv.experience[0]!.description =
        'Plain achievement\n\u2022 Existing bullet\n- Existing dash\n1. Numbered achievement'
      cv.skills = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot'].map(
        (name, index) => ({
          id: name,
          name: `${name} capability`,
          level: index === 0 ? 5 : null,
        }),
      )
      const appearance = {
        ...createDocument('executive').appearance,
        pageSize,
        fontSize: pageSize === 'A4' ? (10 as const) : (12 as const),
      }
      const render = await templateRegistry.resolve('executive').load()
      const task = getDocument({
        data: new Uint8Array(await renderToBuffer(render({ cv, appearance }))),
        useSystemFonts: true,
      })
      try {
        const pdf = await task.promise
        const pages = await Promise.all(
          Array.from({ length: pdf.numPages }, async (_, index) => {
            const page = await pdf.getPage(index + 1)
            const items = (await page.getTextContent()).items.filter(
              (item) => 'str' in item,
            )
            const footer = items.find(
              (item) => item.str === `Page ${index + 1} | ${pdf.numPages}`,
            )
            expect(footer).toBeDefined()
            expect(footer!.transform[5]).toBeGreaterThan(20)
            expect(footer!.transform[5]).toBeLessThan(40)
            expect(footer!.transform[4] + footer!.width).toBeCloseTo(
              page.view[2]! - 35,
              0,
            )
            const body = items.filter(
              (item) => item.str.trim() && item.transform[5] > 40,
            )
            expect(body.at(-1)?.str).not.toMatch(
              /^(Professional Experience|Education|Areas of Expertise|Languages)$/,
            )
            return body
          }),
        )
        const items = pages.flat()
        const find = (value: string) => {
          const item = items.find((item) => item.str.includes(value))
          expect(item, value).toBeDefined()
          return item!
        }
        const firstPage = await pdf.getPage(1)
        const name = find('Alex Morgan')
        expect(name.transform[4]).toBeCloseTo(35, 0)
        expect(name.height).toBeCloseTo(appearance.fontSize * 2.2, 0)
        const contact = find('alex@example.com')
        expect(contact.transform[4]).toBeGreaterThan(
          name.transform[4] + name.width,
        )
        expect(contact.transform[4] + contact.width).toBeCloseTo(
          firstPage.view[2]! - 35,
          0,
        )
        const employer = find('Forma Studio')
        const role = find('Senior Product Designer')
        const date = find('March 2022 - Present')
        expect(role.transform[4]).toBeCloseTo(employer.transform[4], 0)
        expect(role.transform[5]).toBeLessThan(employer.transform[5])
        expect(date.transform[5]).toBeCloseTo(employer.transform[5], 0)
        expect(date.transform[4] + date.width).toBeCloseTo(
          firstPage.view[2]! - 35,
          0,
        )
        expect(find('California College').transform[5]).toBeLessThan(
          find('BFA, Communication Design').transform[5],
        )
        const alpha = find('Alpha capability')
        for (const [index, label] of ['Alpha', 'Bravo', 'Charlie'].entries()) {
          const skill = find(`${label} capability`)
          expect(skill.transform[4]).toBeCloseTo(
            50 + (index * (firstPage.view[2]! - 70)) / 3,
            0,
          )
          expect(skill.transform[5]).toBeCloseTo(alpha.transform[5], 0)
        }
        expect(find('Delta capability').transform[4]).toBeCloseTo(
          alpha.transform[4],
          0,
        )
        expect(find('Delta capability').transform[5]).toBeLessThan(
          alpha.transform[5],
        )
        const text = items
          .map((item) => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
        expect(text).not.toContain('Hidden profile label')
        expect(text).not.toContain('Profile')
        expect(text).toContain('Expert')
        expect(text).toContain('\u2022 Plain achievement')
        expect(text).toContain('- Existing dash')
        expect(text).toContain('1. Numbered achievement')
        expect(text).not.toContain('\u2022 \u2022')
        expect(text).not.toContain('\u2022 -')
        expect(text).not.toContain('\\u00b7')
        expect(text).toContain('\u00b7')
        expect(text.indexOf('Professional Experience')).toBeLessThan(
          text.indexOf('Education'),
        )
        expect(text.indexOf('Education')).toBeLessThan(
          text.indexOf('Areas of Expertise'),
        )
      } finally {
        await task.destroy()
      }
    })
  }

  it('executive mirrors its header, date column, expertise and footer in Arabic', async () => {
    const cv = createEmptyCv()
    cv.personal.fullName = 'Avery Example'
    cv.personal.email = 'avery@example.com'
    cv.personal.phone = '+1 202 555 0140'
    cv.experience = [
      {
        id: 'work',
        employer: 'Example Works',
        role: 'Engineer',
        location: '',
        startDate: '2020-01',
        endDate: '',
        current: true,
        description: 'Built a useful service.',
      },
    ]
    cv.skills = ['Alpha', 'Bravo', 'Charlie'].map((name) => ({
      id: name,
      name,
      level: null,
    }))
    const render = await templateRegistry.resolve('executive').load()
    const task = getDocument({
      data: new Uint8Array(
        await renderToBuffer(
          render({
            cv,
            appearance: createDocument('executive', 'ar').appearance,
          }),
        ),
      ),
      useSystemFonts: true,
    })
    try {
      const pdf = await task.promise
      const page = await pdf.getPage(1)
      const items = (await page.getTextContent()).items.filter(
        (item) => 'str' in item,
      )
      const find = (value: string) =>
        items.find((item) => item.str.includes(value))!
      expect(find('Avery Example').transform[4]).toBeGreaterThan(
        find('avery@example.com').transform[4],
      )
      expect(find('Example Works').transform[4]).toBeGreaterThan(
        page.view[2]! / 2,
      )
      expect(find('2020').transform[4]).toBeLessThan(page.view[2]! / 2)
      expect(find('Alpha').transform[4]).toBeGreaterThan(
        find('Bravo').transform[4],
      )
      expect(find('Bravo').transform[4]).toBeGreaterThan(
        find('Charlie').transform[4],
      )
      const footer = items.filter((item) => item.transform[5] < 40)
      expect(footer.length).toBeGreaterThan(0)
      expect(Math.min(...footer.map((item) => item.transform[4]))).toBeCloseTo(
        35,
        0,
      )
      expect(items.map((item) => item.str).join(' ')).toContain(
        cv.personal.phone,
      )
    } finally {
      await task.destroy()
    }
  })

  it.each(
    (['en', 'fr', 'ar'] as const).flatMap((language) =>
      (['A4', 'LETTER'] as const).map(
        (pageSize) => [language, pageSize] as const,
      ),
    ),
  )(
    'sage follows its band, body and footer layout in %s on %s',
    async (language, pageSize) => {
      const template = templateRegistry.resolve('sage')
      expect(template.name).toBe('011')
      expect(template.headings).not.toHaveProperty('summary')
      const cv = createExampleCv()
      cv.experience[0]!.description =
        'Plain achievement\n\u2022 Existing bullet\n1. Numbered achievement'
      const snapshot = structuredClone(cv)
      const appearance = {
        ...createDocument('sage', language).appearance,
        pageSize,
      }
      const render = await template.load()
      const task = getDocument({
        data: new Uint8Array(await renderToBuffer(render({ cv, appearance }))),
        useSystemFonts: true,
      })
      try {
        const pdf = await task.promise
        const firstPage = await pdf.getPage(1)
        const items = (await firstPage.getTextContent()).items.filter(
          (item) => 'str' in item,
        )
        const find = (value: string) => {
          const item = items.find((item) => item.str.includes(value))
          expect(item, value).toBeDefined()
          return item!
        }
        const name = find('Alex Morgan')
        const email = find('alex@example.com')
        expect(name.height).toBeGreaterThan(appearance.fontSize * 2)
        expect(name.transform[5]).toBeGreaterThan(
          find('Product Designer').transform[5],
        )
        if (language === 'ar')
          expect(name.transform[4]).toBeGreaterThan(email.transform[4])
        else expect(name.transform[4]).toBeLessThan(email.transform[4])
        const fills = (await firstPage.getOperatorList()).argsArray
        expect(JSON.stringify(fills)).toContain('#c2d2b3')
        expect(JSON.stringify(fills)).toContain('#6b8059')
        const extracted: string[] = []
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber)
          const content = (await page.getTextContent()).items.filter(
            (item) => 'str' in item,
          )
          const footer = content.filter(
            (item) => item.str.trim() && item.transform[5] < 40,
          )
          expect(footer.length).toBeGreaterThan(0)
          expect(
            footer
              .map((item) => item.str)
              .join(' ')
              .replace(/\s/g, ''),
          ).toContain(
            translate(language, 'Page {page}', { page: pageNumber }).replace(
              /\s/g,
              '',
            ),
          )
          if (language === 'ar')
            expect(
              Math.max(...footer.map((item) => item.transform[4] + item.width)),
            ).toBeCloseTo(page.view[2]! - 36, 0)
          else
            expect(
              Math.min(...footer.map((item) => item.transform[4])),
            ).toBeCloseTo(36, 0)
          for (const item of content.filter((item) => item.str.trim())) {
            expect(item.transform[4]).toBeGreaterThanOrEqual(0)
            expect(item.transform[4] + item.width).toBeLessThanOrEqual(
              page.view[2]! + 1,
            )
            expect(item.transform[5]).toBeGreaterThan(0)
            expect(item.transform[5]).toBeLessThan(page.view[3]!)
          }
          extracted.push(
            content
              .filter((item) => item.transform[5] > 40)
              .map((item) => item.str)
              .join(' '),
          )
        }
        const text = extracted.join(' ').replace(/\s+/g, ' ')
        for (const value of [
          'Plain achievement',
          'Existing bullet',
          'Numbered achievement',
          cv.education[0]!.school,
        ])
          expect(text).toContain(value)
        expect(text).not.toMatch(/\u2022\s*\u2022|\u2022\s*1\./)
        expect(text.replace(/\s/g, '')).toContain(
          translate(language, 'Career Experience').replace(/\s/g, ''),
        )
        expect(cv).toEqual(snapshot)
      } finally {
        await task.destroy()
      }
    },
  )

  it.each(
    (['en', 'fr', 'ar'] as const).flatMap((language) =>
      (['A4', 'LETTER'] as const).map(
        (pageSize) => [language, pageSize] as const,
      ),
    ),
  )(
    'charcoal centers its identity and uses row-major skill columns in %s on %s',
    async (language, pageSize) => {
      const template = templateRegistry.resolve('charcoal')
      expect(template.name).toBe('012')
      expect(template.portraitShape).toBe('circle')
      const cv = createExampleCv()
      cv.skills = [
        { id: 'first', name: 'First capability', level: 2 },
        { id: 'second', name: 'Second capability', level: 5 },
        { id: 'third', name: 'Third capability', level: null },
      ]
      cv.experience[0]!.description =
        'Plain achievement\n\u2022 Existing bullet\n1. Numbered achievement'
      const appearance = {
        ...createDocument(template.id, language).appearance,
        pageSize,
      }
      const render = await template.load()
      const snapshot = structuredClone({ cv, appearance })
      const task = getDocument({
        data: new Uint8Array(await renderToBuffer(render({ cv, appearance }))),
        useSystemFonts: true,
      })
      try {
        const pdf = await task.promise
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
        expect(name.transform[4] + name.width / 2).toBeCloseTo(
          page.view[2]! / 2,
          0,
        )
        expect(name.transform[5]).toBeGreaterThan(
          find('PRODUCT DESIGNER').transform[5],
        )
        expect(find('PRODUCT DESIGNER').transform[5]).toBeGreaterThan(
          find('alex@example.com').transform[5],
        )
        const fills = JSON.stringify((await page.getOperatorList()).argsArray)
        expect(fills).toContain('#303030')
        expect(fills).toContain('#ffffff')
        const extracted: string[] = []
        const skillPositions: typeof items = []
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const current = await pdf.getPage(pageNumber)
          const content = (await current.getTextContent()).items.filter(
            (item) => 'str' in item,
          )
          skillPositions.push(
            ...content.filter((item) => item.str.includes('capability')),
          )
          for (const item of content.filter((item) => item.str.trim())) {
            expect(item.transform[4]).toBeGreaterThanOrEqual(0)
            expect(item.transform[4] + item.width).toBeLessThanOrEqual(
              current.view[2]! + 1,
            )
            expect(item.transform[5]).toBeGreaterThan(0)
            expect(item.transform[5]).toBeLessThan(current.view[3]!)
          }
          extracted.push(content.map((item) => item.str).join(' '))
        }
        const first = skillPositions.find(
          (item) => item.str === 'First capability',
        )!
        const second = skillPositions.find(
          (item) => item.str === 'Second capability',
        )!
        const third = skillPositions.find(
          (item) => item.str === 'Third capability',
        )!
        expect(first).toBeDefined()
        expect(second).toBeDefined()
        expect(third).toBeDefined()
        expect(first.transform[5]).toBeCloseTo(second.transform[5], 0)
        expect(third.transform[5]).toBeLessThan(first.transform[5])
        if (language === 'ar')
          expect(first.transform[4]).toBeGreaterThan(second.transform[4])
        else expect(first.transform[4]).toBeLessThan(second.transform[4])
        const text = extracted.join(' ').replace(/\s+/g, ' ')
        expect(text).toContain('Plain achievement')
        expect(text).toContain('Existing bullet')
        expect(text).toContain('Numbered achievement')
        expect(text).not.toMatch(/\u2022\s*\u2022|\u2022\s*1\./)
        expect({ cv, appearance }).toEqual(snapshot)
      } finally {
        await task.destroy()
      }
    },
  )

  it.each([
    'classic',
    'traditional',
    'prime-ats',
    'pure-ats',
    'executive',
    'timeline',
    'columnar',
    'ruled',
    'sage',
    'charcoal',
    'framed',
    'botanical',
    'flora',
    'confetti',
    'atelier',
  ])(
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
            if (template.id === 'columnar' || template.id === 'framed') {
              const operators = await page.getOperatorList()
              const fills = operators.argsArray.filter(
                (_, index) => operators.fnArray[index] === OPS.setFillRGBColor,
              )
              expect(JSON.stringify(fills)).toContain(
                template.id === 'framed' ? '#f3f3f3' : '#0c2d4d',
              )
            }
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
              if (template.id === 'columnar') {
                if (item.transform[4] < page.view[2]! * 0.68)
                  expect(item.transform[4] + item.width).toBeLessThanOrEqual(
                    page.view[2]! * 0.68 - 29,
                  )
                else
                  expect(item.transform[4]).toBeGreaterThanOrEqual(
                    page.view[2]! * 0.68 + 31,
                  )
              }
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
          ...(['bar', 'dots'].includes(
            template.skillProficiencyDisplay?.defaultMode ?? 'text',
          )
            ? []
            : ['Advanced']),
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
