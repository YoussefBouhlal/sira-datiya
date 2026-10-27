import { useEffect, useRef, useState } from 'react'
import {
  getDocument,
  GlobalWorkerOptions,
  type PDFDocumentLoadingTask,
  type RenderTask,
} from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { useTranslation } from '../../i18n/context'

GlobalWorkerOptions.workerSrc = workerUrl

export function PdfCanvas({
  blob,
  page,
  onPageCount,
  scale = 1.7,
}: {
  blob: Blob
  page: number
  onPageCount: (count: number) => void
  scale?: number
}) {
  const { t } = useTranslation()
  const canvas = useRef<HTMLCanvasElement>(null)
  const [failure, setFailure] = useState<{
    blob: Blob
    page: number
    message: string
  } | null>(null)
  useEffect(() => {
    let cancelled = false
    let loader: PDFDocumentLoadingTask | undefined
    let renderer: RenderTask | undefined
    async function render() {
      const bytes = await blob.arrayBuffer()
      if (cancelled) return
      loader = getDocument({
        data: new Uint8Array(bytes),
        useSystemFonts: true,
        disableFontFace: true,
      })
      const document = await loader.promise
      if (cancelled) return
      onPageCount(document.numPages)
      const pdfPage = await document.getPage(Math.min(page, document.numPages))
      if (cancelled || !canvas.current) return
      const target = canvas.current
      const viewport = pdfPage.getViewport({ scale })
      const context = target.getContext('2d')
      if (!context) throw new Error('Canvas unavailable')
      target.width = viewport.width
      target.height = viewport.height
      renderer = pdfPage.render({
        canvas: target,
        canvasContext: context,
        viewport,
      })
      await renderer.promise
    }
    void render().catch(() => {
      if (!cancelled)
        setFailure({
          blob,
          page,
          message: 'Preview unavailable. You can still download the PDF.',
        })
    })
    return () => {
      cancelled = true
      renderer?.cancel()
      void loader?.destroy().catch(() => {})
    }
  }, [blob, page, onPageCount, scale])

  const error =
    failure?.blob === blob && failure.page === page ? failure.message : ''
  return error ? (
    <p className="preview-error" role="alert">
      {t(error)}
    </p>
  ) : (
    <canvas
      ref={canvas}
      aria-label={t('CV preview, page {page}', { page })}
      role="img"
    />
  )
}
