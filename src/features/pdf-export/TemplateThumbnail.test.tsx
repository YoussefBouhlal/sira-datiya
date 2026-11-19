// @vitest-environment jsdom
import { cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { createExampleCv } from '../../domain/cv/example'
import { LanguageProvider } from '../../i18n/react'
import type { TemplateDefinition } from '../../templates/types'
import { TemplateThumbnail } from './TemplateThumbnail'
import { generatePdfDocument } from './use-pdf-document'

vi.mock('./use-pdf-document', () => ({
  generatePdfDocument: vi.fn(async () => new Blob(['sample PDF'])),
}))

vi.mock('./PdfCanvas', () => ({
  PdfCanvas: () => <span>Rendered thumbnail</span>,
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

it.each(['en', 'fr', 'ar'] as const)(
  'adds a local portrait and proficiency levels only to the %s gallery sample',
  async (language) => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        private callback: (entries: { isIntersecting: boolean }[]) => void

        constructor(
          callback: (entries: { isIntersecting: boolean }[]) => void,
        ) {
          this.callback = callback
        }
        observe() {
          this.callback([{ isIntersecting: true }])
        }
        disconnect() {}
      },
    )
    const template: TemplateDefinition = {
      id: 'sample',
      name: '007',
      typography: 'sans',
      load: vi.fn<TemplateDefinition['load']>(),
    }
    render(
      <LanguageProvider language={language}>
        <TemplateThumbnail template={template} />
      </LanguageProvider>,
    )
    await waitFor(() => expect(generatePdfDocument).toHaveBeenCalledOnce())
    const [sample, appearance, definition] =
      vi.mocked(generatePdfDocument).mock.calls[0]!
    const example = createExampleCv(language)
    expect(sample.personal.portrait).toMatch(/^data:image\/png;base64,/)
    expect(sample.skills).toEqual(
      example.skills.map((skill, index) => ({
        ...skill,
        level: [5, 4, 3, 4, 5, null][index],
      })),
    )
    expect({
      ...sample,
      personal: { ...sample.personal, portrait: '' },
      skills: example.skills,
    }).toEqual(example)
    expect(example.personal.portrait).toBe('')
    expect(example.skills.every((skill) => skill.level === null)).toBe(true)
    expect(appearance.language).toBe(language)
    expect(appearance).not.toHaveProperty('skillProficiencyDisplay')
    expect(definition).toBe(template)
  },
)
