import { FileText, LoaderCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createExampleCv } from '../../domain/cv/example'
import type { Appearance } from '../../domain/cv/types'
import type { TemplateDefinition } from '../../templates/types'
import { PdfCanvas } from './PdfCanvas'
import { generatePdfDocument } from './use-pdf-document'

const sample = createExampleCv()
const sampleDocuments = new WeakMap<TemplateDefinition, Promise<Blob>>()
const ignorePageCount = () => {}

export function TemplateThumbnail({
  template,
}: {
  template: TemplateDefinition
}) {
  const container = useRef<HTMLSpanElement>(null)
  const [visible, setVisible] = useState(false)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [failed, setFailed] = useState(false)

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
    let pending = sampleDocuments.get(template)
    if (!pending) {
      const appearance: Appearance = {
        templateId: template.id,
        accent: '#177568',
        fontSize: 11,
        pageSize: 'A4',
      }
      pending = generatePdfDocument(sample, appearance, template)
      sampleDocuments.set(template, pending)
    }
    void pending.then(
      (result) => {
        if (!cancelled) setBlob(result)
      },
      () => {
        sampleDocuments.delete(template)
        if (!cancelled) setFailed(true)
      },
    )
    return () => {
      cancelled = true
    }
  }, [visible, template])

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
          <span>{failed ? 'Preview unavailable' : 'Loading'}</span>
        </span>
      )}
    </span>
  )
}
