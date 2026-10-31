import { FileText, LoaderCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createExampleCv } from '../../domain/cv/example'
import type { Appearance } from '../../domain/cv/types'
import type { TemplateDefinition } from '../../templates/types'
import { PdfCanvas } from './PdfCanvas'
import { generatePdfDocument } from './use-pdf-document'
import { useTranslation } from '../../i18n/context'

const samplePortrait =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAAAAADmVT4XAAABKElEQVR4nO3YyxGDMAxFUfrvgCZTQ7aZBH2eUJA9c7039+yQfLyGzwEAAAAAAAAAAAAAAID61fPzPA84v8+zgJ98mVACXOaLhArA7FcEBYDTLwh0gNvXBTIg6MsCFRD2VcFugERfFGwGSPU1wV6AZF8SAAAAAAAAAHv9DecB4xPRPGB8Kp4HjG9G87vh/HY8/z4w/0Iy/0Z0SSh+BwAAAAAAAABQBfz0q4L9RjKnXjJstZql6qpBAAh9QZAGSHmBkATI+TQhByj1c4IUoNhPCTKAcj8jiAE38hlCCLjZDwUR4HY/EqwOaOgHAh/Q0vcFLqCp7wqWBrT1PYEDaOw7goUBrX1bsC6guW8KAFiA9r4lAGAA/tA3BAAAAAAAAAAAAKtORACe2wvepVWsQGAXKeQAAAAASUVORK5CYII='

const sampleDocuments = new WeakMap<
  TemplateDefinition,
  Map<string, Promise<Blob>>
>()
const ignorePageCount = () => {}

export function TemplateThumbnail({
  template,
}: {
  template: TemplateDefinition
}) {
  const { language, t } = useTranslation()
  const container = useRef<HTMLSpanElement>(null)
  const [visible, setVisible] = useState(false)
  const [result, setResult] = useState<{
    template: TemplateDefinition
    language: Appearance['language']
    blob: Blob | null
    failed: boolean
  } | null>(null)
  const current =
    result?.template === template && result.language === language
      ? result
      : null
  const blob = current?.blob ?? null
  const failed = current?.failed ?? false

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisible(true)
        observer.disconnect()
      }
    })
    if (container.current) observer.observe(container.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    let cancelled = false
    const documents =
      sampleDocuments.get(template) ?? new Map<string, Promise<Blob>>()
    sampleDocuments.set(template, documents)
    let pending = documents.get(language)
    if (!pending) {
      const appearance: Appearance = {
        language,
        templateId: template.id,
        accent: '#177568',
        fontSize: 11,
        pageSize: 'A4',
      }
      const sample = createExampleCv(language)
      sample.personal.portrait = samplePortrait
      pending = generatePdfDocument(sample, appearance, template)
      documents.set(language, pending)
    }
    void pending.then(
      (result) => {
        if (!cancelled)
          setResult({ template, language, blob: result, failed: false })
      },
      () => {
        documents.delete(language)
        if (!cancelled)
          setResult({ template, language, blob: null, failed: true })
      },
    )
    return () => {
      cancelled = true
    }
  }, [visible, template, language])

  return (
    <span
      ref={container}
      className="template-thumbnail"
      aria-busy={!blob && !failed}
    >
      {blob ? (
        <PdfCanvas
          blob={blob}
          page={1}
          onPageCount={ignorePageCount}
          scale={0.6}
        />
      ) : (
        <span className="thumbnail-placeholder">
          {failed ? (
            <FileText size={22} />
          ) : (
            <LoaderCircle size={18} className="spin" />
          )}
          <span>{t(failed ? 'Preview unavailable' : 'Loading')}</span>
        </span>
      )}
    </span>
  )
}
