import { expect, test, type Download, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { PDFDocument } from 'pdf-lib'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createDocument } from '../src/domain/cv/defaults'
import { createExampleCv } from '../src/domain/cv/example'

const storageKey = 'sira-datiya.cv.v1'

async function preview(page: Page) {
  const switcher = page.getByRole('group', { name: 'Workspace view' })
  if (await switcher.isVisible())
    await switcher.getByRole('button', { name: 'Preview', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Download PDF' })).toBeEnabled({
    timeout: 20_000,
  })
  const canvas = page.getByRole('img', { name: /CV preview, page/ })
  await expect(canvas).toBeVisible()
  await expect
    .poll(() =>
      canvas.evaluate((element) => {
        const target = element as HTMLCanvasElement
        const context = target.getContext('2d')
        if (!context || !target.width) return 0
        const { data } = context.getImageData(0, 0, target.width, target.height)
        let ink = 0
        for (let offset = 0; offset < data.length; offset += 4) {
          if (
            data[offset + 3]! > 0 &&
            data[offset]! < 200 &&
            data[offset + 1]! < 200 &&
            data[offset + 2]! < 200
          )
            ink++
        }
        return ink
      }),
    )
    .toBeGreaterThan(500)
}

async function downloadBytes(download: Download): Promise<Buffer> {
  const stream = await download.createReadStream()
  if (!stream) throw new Error('Download stream unavailable')
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks)
}

test('edit, reload, choose a template, and download a real text PDF', async ({
  page,
  context,
  baseURL,
}) => {
  if (!baseURL) throw new Error('A production preview baseURL is required')
  const expectedURL = new URL(baseURL)
  const errors: string[] = []
  const unexpectedRequests: string[] = []
  const failedRequests: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  context.on('request', (request) => {
    if (!/^https?:/.test(request.url())) return
    const requestURL = new URL(request.url())
    if (
      requestURL.origin !== expectedURL.origin ||
      !requestURL.pathname.startsWith(expectedURL.pathname)
    )
      unexpectedRequests.push(request.url())
  })
  context.on('response', (response) => {
    if (response.status() >= 400)
      failedRequests.push(`${response.status()} ${response.url()}`)
  })
  context.on('requestfailed', (request) => {
    if (/^https?:/.test(request.url()))
      failedRequests.push(`${request.failure()?.errorText} ${request.url()}`)
  })
  await page.goto('./')
  await expect(page).toHaveURL(baseURL)
  await page.getByLabel('Full name', { exact: true }).fill('Taylor Example')
  await page
    .getByLabel('Professional title', { exact: true })
    .fill('Software Engineer')
  await page.getByRole('button', { name: 'Continue' }).click()
  await page
    .getByRole('textbox', { name: 'Professional summary', exact: true })
    .fill('Building thoughtful, accessible software.')
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key) ?? '{}').cv?.summary,
        storageKey,
      ),
    )
    .toBe('Building thoughtful, accessible software.')
  await page.reload()
  await expect(page).toHaveURL(baseURL)
  await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
    'Taylor Example',
  )
  await page.getByRole('button', { name: /06 Template & style/ }).click()
  await page
    .locator('.template-option')
    .filter({ has: page.getByRole('radio', { name: 'Classic', exact: true }) })
    .click()
  await expect(
    page.getByRole('radio', { name: 'Classic', exact: true }),
  ).toBeChecked()
  await page.getByTitle('Cobalt', { exact: true }).click()
  await page.getByLabel('Paper size').selectOption('LETTER')
  await preview(page)
  const pending = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download PDF' }).click()
  const download = await pending
  expect(download.suggestedFilename()).toBe('Taylor-Example-CV.pdf')
  const bytes = await downloadBytes(download)
  const pdfDocument = await PDFDocument.load(bytes)
  expect(pdfDocument.getPageCount()).toBe(1)
  expect(pdfDocument.getPage(0).getSize().width).toBe(612)
  const loadingTask = getDocument({
    data: new Uint8Array(bytes),
    useSystemFonts: true,
  })
  const parsed = await loadingTask.promise
  const text = (await (await parsed.getPage(1)).getTextContent()).items
    .map((item) => ('str' in item ? item.str : ''))
    .join(' ')
  expect(text).toContain('Taylor Example')
  expect(text).toContain('Building thoughtful, accessible software.')
  await loadingTask.destroy()
  expect(errors).toEqual([])
  expect(unexpectedRequests).toEqual([])
  expect(failedRequests).toEqual([])
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await page.screenshot({
    path: test.info().outputPath('builder-preview.png'),
    fullPage: true,
  })
})

test('backup, confirmed reset, and restore preserve the document', async ({
  page,
}) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Load example' }).click()
  await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
    'Alex Morgan',
  )
  await page.getByLabel('Document actions', { exact: true }).click()
  const pending = page.waitForEvent('download')
  await page
    .getByRole('button', { name: 'Download backup', exact: true })
    .click()
  const bytes = await downloadBytes(await pending)
  await page.getByLabel('Document actions', { exact: true }).click()
  await page.getByRole('button', { name: 'Start over', exact: true }).click()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
    'Alex Morgan',
  )
  await page.getByLabel('Document actions', { exact: true }).click()
  await page.getByRole('button', { name: 'Start over', exact: true }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Start over', exact: true })
    .click()
  await expect(page.getByLabel('Full name', { exact: true })).toHaveValue('')
  await page.getByLabel('CV backup file').setInputFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: bytes,
  })
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Restore backup', exact: true })
    .click()
  await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
    'Alex Morgan',
  )
  await preview(page)
})

test('corrupt data is not overwritten by editing or reload', async ({
  page,
}) => {
  await page.addInitScript((key) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, '{"version":99}')
  }, storageKey)
  await page.goto('./')
  await expect(page.getByRole('alert')).toContainText(
    'saved data has not been changed',
  )
  await page.getByLabel('Full name', { exact: true }).fill('Unsaved Example')
  await page.getByLabel('Professional title', { exact: true }).fill('Designer')
  await page.reload()
  expect(
    await page.evaluate((key) => localStorage.getItem(key), storageKey),
  ).toBe('{"version":99}')
  await expect(page.getByRole('alert')).toBeVisible()
})

test('removed template IDs fall back without discarding content', async ({
  page,
}) => {
  const document = createDocument('removed-template')
  document.cv = createExampleCv()
  await page.addInitScript(
    ({ key, value }) => localStorage.setItem(key, JSON.stringify(value)),
    { key: storageKey, value: { version: 1, ...document } },
  )
  await page.goto('./')
  await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
    'Alex Morgan',
  )
  await preview(page)
  await expect(
    page
      .getByRole('group', { name: 'Preview template' })
      .getByRole('button', { name: 'Studio', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
})

test('storage write failure is actionable and does not prevent PDF export', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError')
    }
  })
  await page.goto('./')
  await page.getByRole('button', { name: 'Load example' }).click()
  await expect(page.getByRole('alert')).toContainText('download a backup')
  await preview(page)
})

test('editor and template controls have no automated accessibility violations', async ({
  page,
}) => {
  await page.goto('./')
  await page.keyboard.press('Tab')
  await expect(page.getByLabel('Full name', { exact: true })).toBeFocused()
  const editorResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(
    editorResults.violations.map((issue) => ({
      id: issue.id,
      targets: issue.nodes.map((node) => node.target),
    })),
  ).toEqual([])
  await page.getByRole('button', { name: /06 Template & style/ }).click()
  await page.getByRole('radio', { name: 'Studio', exact: true }).focus()
  await page.keyboard.press('ArrowLeft')
  await expect(
    page.getByRole('radio', { name: 'Classic', exact: true }),
  ).toBeChecked()
  const designResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(
    designResults.violations.map((issue) => ({
      id: issue.id,
      targets: issue.nodes.map((node) => node.target),
    })),
  ).toEqual([])
})
