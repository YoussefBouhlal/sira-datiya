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
  'adds a local portrait only to the %s gallery sample',
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
    expect(sample.personal.portrait).toMatch(/^data:image\/png;base64,/)
    expect({
      ...sample,
      personal: { ...sample.personal, portrait: '' },
    }).toEqual(createExampleCv(language))
    expect(createExampleCv(language).personal.portrait).toBe('')
    expect(appearance.language).toBe(language)
    expect(definition).toBe(template)
  },
)
