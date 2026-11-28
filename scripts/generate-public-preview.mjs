import { mkdir, writeFile } from 'node:fs/promises'
import { renderToBuffer } from '@react-pdf/renderer'
import react from '@vitejs/plugin-react'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createServer } from 'vite'

const server = await createServer({
  configFile: false,
  plugins: [react()],
  server: { middlewareMode: true, watch: null },
  appType: 'custom',
})
let task
try {
  const { createExampleCv } = await server.ssrLoadModule(
    '/src/domain/cv/example.ts',
  )
  const { createDocument } = await server.ssrLoadModule(
    '/src/domain/cv/defaults.ts',
  )
  const { templateRegistry } = await server.ssrLoadModule(
    '/src/templates/registry.ts',
  )
  const { publicTemplateNumbers } = await server.ssrLoadModule(
    '/src/public/template-content.ts',
  )
  const { publicLanguages, previewFilename } = await server.ssrLoadModule(
    '/src/public/content.ts',
  )
  for (const number of publicTemplateNumbers) {
    const definition = templateRegistry.templates.find(
      (template) => template.name === number,
    )
    if (!definition)
      throw new Error(`Public template ${number} is not registered`)
    const Document = await definition.load()
    for (const language of publicLanguages) {
      const cv = createExampleCv(language)
      cv.projects = []
      cv.references = []
      cv.certifications = []
      const bytes = await renderToBuffer(
        Document({
          cv,
          appearance: createDocument(definition.id, language).appearance,
        }),
      )
      task = getDocument({ data: new Uint8Array(bytes), useSystemFonts: true })
      const pdf = await task.promise
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({
        scale: 900 / page.getViewport({ scale: 1 }).width,
      })
      const target = pdf.canvasFactory.create(900, Math.round(viewport.height))
      await page.render({ canvasContext: target.context, viewport }).promise
      await mkdir(new URL('../public/public-preview/', import.meta.url), {
        recursive: true,
      })
      await writeFile(
        new URL(
          `../public/public-preview/${previewFilename(language, number)}`,
          import.meta.url,
        ),
        target.canvas.toBuffer('image/png'),
      )
      console.log(
        `Generated fictional ${language} Template ${number} preview: 900 x ${target.canvas.height}`,
      )
      pdf.canvasFactory.destroy(target)
      await task.destroy()
      task = undefined
    }
  }
} finally {
  await task?.destroy()
  await server.close()
}
