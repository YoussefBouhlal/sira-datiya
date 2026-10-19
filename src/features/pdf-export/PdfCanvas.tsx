import { useEffect, useRef, useState } from 'react'
import {
  getDocument,
  GlobalWorkerOptions,
  type PDFDocumentLoadingTask,
  type RenderTask,
} from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = workerUrl

export function PdfCanvas({
  blob,
  page,
  onPageCount,
}: {
  blob: Blob
  page: number
  onPageCount: (count: number) => void
}) {
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
      })
      const document = await loader.promise
      if (cancelled) return
      onPageCount(document.numPages)
      const pdfPage = await document.getPage(Math.min(page, document.numPages))
      if (cancelled || !canvas.current) return
      const target = canvas.current
      const viewport = pdfPage.getViewport({ scale: 1.7 })
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
  }, [blob, page, onPageCount])

  const error =
    failure?.blob === blob && failure.page === page ? failure.message : ''
  return error ? (
    <p className="preview-error" role="alert">
      {error}
    </p>
  ) : (
    <canvas ref={canvas} aria-label={`CV preview, page ${page}`} role="img" />
  )
}
