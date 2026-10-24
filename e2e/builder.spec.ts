import { expect, test, type Download, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { PDFDocument } from 'pdf-lib'
import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs'
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
  await expect(
    page.getByRole('group', { name: 'Preview template' }),
  ).toHaveCount(0)
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
  await expect(page.locator('.workspace-heading')).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
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

test('portrait, rated skills and ordered references persist and render in every template', async ({
  page,
}) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Load example' }).click()
  const portrait = await page.evaluate(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 80
    canvas.height = 100
    const context = canvas.getContext('2d')!
    context.fillStyle = '#e8efe9'
    context.fillRect(0, 0, 80, 100)
    context.fillStyle = '#3456a0'
    context.beginPath()
    context.arc(40, 88, 30, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = '#b97657'
    context.beginPath()
    context.arc(40, 35, 17, 0, Math.PI * 2)
    context.fill()
    return canvas.toDataURL('image/png').split(',')[1]!
  })
  await page.getByLabel('Portrait', { exact: true }).setInputFiles({
    name: 'fictional-portrait.png',
    mimeType: 'image/png',
    buffer: Buffer.from(portrait, 'base64'),
  })
  await expect(
    page.getByRole('img', { name: 'Your portrait', exact: true }),
  ).toBeVisible()
  await page.getByLabel('Portrait', { exact: true }).setInputFiles({
    name: 'invalid.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('not an image'),
  })
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(
    page.getByRole('img', { name: 'Your portrait', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: /Skills & extras/ }).click()
  await page
    .getByLabel('Skill name', { exact: true })
    .first()
    .fill('Service design')
  await page
    .getByLabel('Proficiency', { exact: true })
    .first()
    .selectOption('5')
  for (const name of ['Jordan Example', 'Casey Example']) {
    await page
      .getByRole('button', { name: 'Add reference', exact: true })
      .click()
    await page.getByLabel('Reference name', { exact: true }).last().fill(name)
    await page
      .getByLabel('Reference organization', { exact: true })
      .last()
      .fill('Example Studio')
    await page
      .getByLabel('Reference email', { exact: true })
      .last()
      .fill(`${name.split(' ')[0]!.toLowerCase()}@example.com`)
  }
  await page.getByRole('button', { name: 'Move reference 2 up' }).click()
  await expect(
    page.getByLabel('Reference name', { exact: true }).first(),
  ).toHaveValue('Casey Example')
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(results.violations.map((issue) => issue.id)).toEqual([])
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key) ?? '{}').cv?.references?.[0]
            ?.name,
        storageKey,
      ),
    )
    .toBe('Casey Example')
  await page.reload()
  await expect(
    page.getByRole('img', { name: 'Your portrait', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: /Skills & extras/ }).click()
  await expect(
    page.getByLabel('Proficiency', { exact: true }).first(),
  ).toHaveValue('5')
  await expect(
    page.getByLabel('Reference name', { exact: true }).first(),
  ).toHaveValue('Casey Example')
  await page.getByLabel('Document actions', { exact: true }).click()
  const pendingBackup = page.waitForEvent('download')
  await page
    .getByRole('button', { name: 'Download backup', exact: true })
    .click()
  const backup = JSON.parse(
    (await downloadBytes(await pendingBackup)).toString(),
  )
  expect(backup.version).toBe(2)
  expect(backup.cv.personal.portrait).toMatch(/^data:image\/jpeg;base64,/)
  expect(backup.cv.personal.portrait.length).toBeLessThanOrEqual(270_000)
  expect(backup.cv.skills[0]).toMatchObject({
    name: 'Service design',
    level: 5,
  })
  expect(backup.cv.references[0].name).toBe('Casey Example')
  await page.getByRole('button', { name: /06 Template & style/ }).click()
  await page
    .locator('.template-option')
    .filter({ has: page.getByRole('radio', { name: 'Sidebar', exact: true }) })
    .click()
  await page.getByLabel('Paper size').selectOption('LETTER')
  for (const template of [
    'Sidebar',
    'Classic',
    'Studio',
    'Traditional',
    'Prime ATS',
    'Pure ATS',
  ]) {
    if (template !== 'Sidebar') {
      await page.getByRole('button', { name: /06 Template & style/ }).click()
      await page
        .locator('.template-option')
        .filter({
          has: page.getByRole('radio', { name: template, exact: true }),
        })
        .click()
    }
    await preview(page)
    await expect(page.locator('.preview-status')).toHaveText(
      `${template} / US Letter`,
    )
    const pending = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download PDF' }).click()
    const bytes = await downloadBytes(await pending)
    const task = getDocument({
      data: new Uint8Array(bytes),
      useSystemFonts: true,
    })
    const pdf = await task.promise
    try {
      const text = (
        await Promise.all(
          Array.from({ length: pdf.numPages }, async (_, index) => {
            const items = (
              await (await pdf.getPage(index + 1)).getTextContent()
            ).items.filter((item) => 'str' in item)
            if (
              (template === 'Prime ATS' || template === 'Pure ATS') &&
              index === 0
            ) {
              const summary = items.find(
                (item) =>
                  item.str ===
                  (template === 'Pure ATS' ? 'Profile' : 'SUMMARY'),
              )!
              const header = items.filter(
                (item) =>
                  item.str.trim() && item.transform[5] > summary.transform[5],
              )
              const firstPage = await pdf.getPage(1)
              for (const item of header)
                expect(item.transform[4] + item.width).toBeLessThanOrEqual(
                  firstPage.view[2]! -
                    (template === 'Pure ATS' ? 113 : 134) +
                    1,
                )
            }
            if (
              template === 'Traditional' ||
              template === 'Prime ATS' ||
              template === 'Pure ATS'
            ) {
              const body = items.filter(
                (item) => item.str.trim() && item.transform[5] > 40,
              )
              expect(body.at(-1)?.str).not.toMatch(
                /^(PROFILE|SUMMARY|EXPERIENCE|PROFESSIONAL EXPERIENCE|EDUCATION|SKILLS|TECHNICAL SKILLS|AREAS OF EXPERTISE|LANGUAGES|PROJECTS|CERTIFICATIONS|ADDITIONAL INFORMATION|REFERENCES)$/i,
              )
            }
            return items.map((item) => item.str).join(' ')
          }),
        )
      ).join(' ')
      for (const value of [
        'Alex Morgan',
        'Service design',
        'Expert',
        'Casey Example',
        'casey@example.com',
        'Jordan Example',
      ])
        expect(text.toLowerCase()).toContain(value.toLowerCase())
      expect(text).not.toContain('[object Object]')
      expect(
        (await (await pdf.getPage(1)).getOperatorList()).fnArray,
      ).toContain(OPS.paintImageXObject)
    } finally {
      await task.destroy()
    }
    if (template === 'Traditional') {
      await page.screenshot({
        path: test.info().outputPath('traditional-portrait-preview.png'),
        fullPage: true,
      })
    }
    if (template === 'Prime ATS') {
      await page.screenshot({
        path: test.info().outputPath('prime-ats-portrait-preview.png'),
        fullPage: true,
      })
    }
    if (template === 'Pure ATS') {
      const samples = await page
        .getByRole('img', { name: /CV preview, page/ })
        .evaluate((element) => {
          const canvas = element as HTMLCanvasElement
          const context = canvas.getContext('2d')!
          const pixels = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height,
          ).data
          let ink = 0
          for (let index = 0; index < pixels.length; index += 4) {
            if (
              pixels[index]! < 180 &&
              pixels[index + 1]! < 180 &&
              pixels[index + 2]! < 180
            )
              ink++
          }
          return ink
        })
      expect(samples).toBeGreaterThan(500)
      await page.screenshot({
        path: test.info().outputPath('pure-ats-portrait-preview.png'),
        fullPage: true,
      })
    }
    if (template === 'Sidebar') {
      const samples = await page
        .getByRole('img', { name: /CV preview, page/ })
        .evaluate((element) => {
          const canvas = element as HTMLCanvasElement
          const context = canvas.getContext('2d')!
          return [2, Math.floor(canvas.height / 2), canvas.height - 2].map(
            (height) => Array.from(context.getImageData(2, height, 1, 1).data),
          )
        })
      for (const pixel of samples)
        expect(pixel.slice(0, 3)).toEqual([16, 82, 73])
      await page.screenshot({
        path: test.info().outputPath('sidebar-portrait-preview.png'),
        fullPage: true,
      })
    }
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
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
  await page.getByRole('button', { name: /06 Template & style/ }).click()
  await expect(
    page.getByRole('radio', { name: 'Studio', exact: true }),
  ).toBeChecked()
  await preview(page)
  await expect(page.locator('.preview-status')).toHaveText('Studio / A4')
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
