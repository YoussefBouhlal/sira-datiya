import { renderToBuffer } from '@react-pdf/renderer'
import { PDFDocument } from 'pdf-lib'
import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { describe, expect, it } from 'vitest'
import { createDocument, createEmptyCv } from '../domain/cv/defaults'
import { createExampleCv } from '../domain/cv/example'
import { translate } from '../i18n/messages'
import { createTemplateRegistry, templateRegistry } from './registry'
import { resolveSkillProficiencyDisplay } from './types'

describe('template registry', () => {
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
        template.id === 'sidebar' ? 'both' : 'text',
      )
      for (const preferred of ['bar', 'text', 'both'] as const) {
        appearance.skillProficiencyDisplay = preferred
        expect(resolveSkillProficiencyDisplay(template, preferred)).toBe(
          template.id === 'sidebar' ? preferred : 'text',
        )
        expect(appearance.skillProficiencyDisplay).toBe(preferred)
      }
      if (template.skillProficiencyDisplay)
        expect(template.skillProficiencyDisplay.modes).toContain(
          template.skillProficiencyDisplay.defaultMode,
        )
    }
  })

  it.each(['en', 'fr', 'ar'] as const)(
    'renders proficiency display labels and bar geometry in %s PDFs',
    async (language) => {
      const template = templateRegistry.resolve('sidebar')
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
        for (const mode of ['text', 'bar', 'both', undefined] as const) {
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
            if (mode === 'bar') expect(text).not.toContain(label)
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
        expect(drawings[1]).toBe(drawings[0]! + 4)
        expect(drawings[2]).toBe(drawings[1])
        expect(drawings[3]).toBe(drawings[2])
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
        if (id !== 'sidebar')
          expect(JSON.stringify(strokes)).toContain('#a53b12')
        if (id === 'sidebar' || id === 'traditional') {
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
            expect(text).toContain(language === 'fr' ? 'mars 2022' : '2022')
            expect(text).not.toContain('Present')
            expect(text).not.toContain('\uFFFD')
            expect(text).not.toMatch(/[\u2066-\u2069]/)
            expect(text.replace(/\s/g, '')).toContain(
              cv.summary.replace(/\s/g, ''),
            )
            expect(text).toContain(cv.personal.phone)
            expect(text).toContain('Figma Toolkit')
            expect(text).toContain('reference@example.com')
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

  it.each(['classic', 'traditional', 'prime-ats', 'pure-ats'])(
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
