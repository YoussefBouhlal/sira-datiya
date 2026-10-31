import {
  expect,
  test,
  type Download,
  type Locator,
  type Page,
} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { PDFDocument } from 'pdf-lib'
import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createDocument, createEmptyCv } from '../src/domain/cv/defaults'
import { createExampleCv } from '../src/domain/cv/example'

const storageKey = 'sira-datiya.cv.v1'

for (const choice of [
  {
    label: 'English',
    language: 'en',
    heading: 'Choose a template',
    direction: 'ltr',
  },
  {
    label: 'Français',
    language: 'fr',
    heading: 'Choisir un modèle',
    direction: 'ltr',
  },
  {
    label: 'العربية',
    language: 'ar',
    heading: 'اختر قالبًا',
    direction: 'rtl',
  },
]) {
  test(`first visit chooses ${choice.label} before templates and remembers it`, async ({
    page,
  }) => {
    await page.goto('./')
    const entry = page.getByRole('region', { name: 'Choose your language' })
    await expect(
      page.getByRole('heading', { name: 'Choose your language' }),
    ).toBeFocused()
    await expect(entry.getByRole('button')).toHaveCount(3)
    await expect(page.locator('.template-start')).toHaveCount(0)
    await page.reload()
    await expect(entry).toBeVisible()
    for (const width of [1440, 800, 390, 320]) {
      await page.setViewportSize({ width, height: 844 })
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width)
      for (const label of ['English', 'Français', 'العربية']) {
        await expect(
          entry.getByRole('button', { name: label, exact: true }),
        ).toBeInViewport()
      }
      if (width === 1440 || width === 320)
        await page.screenshot({
          path: test.info().outputPath(`language-choice-${width}.png`),
          fullPage: true,
        })
    }
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(results.violations).toEqual([])
    await entry.getByRole('button', { name: choice.label, exact: true }).focus()
    await page.keyboard.press('Enter')
    await expect(
      page.getByRole('heading', { name: choice.heading }),
    ).toBeFocused()
    await expect(page.locator('.language-control select')).toHaveValue(
      choice.language,
    )
    await expect(page.locator('html')).toHaveAttribute('dir', choice.direction)
    await page.reload()
    await expect(
      page.getByRole('heading', { name: choice.heading }),
    ).toBeVisible()
    await expect(page.locator('.language-choices')).toHaveCount(0)
  })
}

test('document language detects, switches, restores and resets without translating content', async ({
  page,
}) => {
  test.setTimeout(90_000)
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'languages', {
      get: () => ['de-DE', 'fr-CA', 'en'],
    })
  })
  await page.goto('./')
  await page.getByRole('button', { name: 'Français', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Choisir un modèle' }),
  ).toBeVisible()
  await expect(page.getByLabel('Langue')).toHaveValue('fr')
  await expectThumbnailInk(
    page
      .getByRole('button', { name: 'Examiner 002', exact: true })
      .locator('canvas'),
  )
  await page
    .getByRole('button', { name: 'Utiliser ce modèle', exact: true })
    .click()
  await page.getByLabel('Nom complet', { exact: true }).fill('ليلى Example')
  await page
    .getByLabel('Titre professionnel', { exact: true })
    .fill('Product Designer')
  await page.getByLabel('Langue').selectOption('ar')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.getByLabel('الاسم الكامل', { exact: true })).toHaveValue(
    'ليلى Example',
  )
  await expect(page.getByLabel('المسمى المهني', { exact: true })).toHaveValue(
    'Product Designer',
  )
  await page.reload()
  await expect(page.getByLabel('اللغة')).toHaveValue('ar')
  await expect(page.getByLabel('الاسم الكامل', { exact: true })).toHaveValue(
    'ليلى Example',
  )

  for (const width of [320, 390, 800, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width)
    const language = await page.getByLabel('اللغة').boundingBox()
    const actions = await page.getByLabel('إجراءات المستند').boundingBox()
    expect(language!.x).toBeGreaterThanOrEqual(0)
    expect(actions!.x + actions!.width).toBeLessThanOrEqual(width)
  }

  await page.getByLabel('إجراءات المستند').click()
  const backupEvent = page.waitForEvent('download')
  await page
    .getByRole('button', { name: 'تنزيل نسخة احتياطية', exact: true })
    .click()
  const bytes = await downloadBytes(await backupEvent)
  const backup = JSON.parse(bytes.toString())
  expect(backup.appearance.language).toBe('ar')
  expect(backup.cv.personal.fullName).toBe('ليلى Example')
  await page.getByLabel('اللغة').selectOption('fr')
  await page.getByLabel('Fichier de sauvegarde du CV').setInputFiles({
    name: 'arabic-backup.json',
    mimeType: 'application/json',
    buffer: bytes,
  })
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Restaurer une sauvegarde', exact: true })
    .click()
  await expect(page.getByLabel('اللغة')).toHaveValue('ar')
  await expect(page.getByLabel('الاسم الكامل', { exact: true })).toHaveValue(
    'ليلى Example',
  )
  await page.getByLabel('إجراءات المستند').click()
  await page.getByRole('button', { name: 'البدء من جديد', exact: true }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'البدء من جديد', exact: true })
    .click()
  await expect(page.getByRole('heading', { name: 'اختر قالبًا' })).toBeVisible()
  await expect(page.getByLabel('اللغة')).toHaveValue('ar')
})

test('Arabic templates render local fonts and download selectable mixed-script PDFs', async ({
  page,
  isMobile,
}) => {
  test.setTimeout(180_000)
  const document = createDocument('modern', 'ar')
  document.cv = createExampleCv('ar')
  document.cv.projects = [
    {
      id: 'mixed-project',
      name: 'Figma Toolkit',
      url: 'toolkit.example',
      description: 'أدوات تصميم سهلة الاستخدام',
    },
  ]
  const externalRequests: string[] = []
  page.on('request', (request) => {
    if (
      /^https?:/.test(request.url()) &&
      new URL(request.url()).hostname !== '127.0.0.1'
    )
      externalRequests.push(request.url())
  })
  await page.addInitScript(
    ({ key, value }) => localStorage.setItem(key, value),
    { key: storageKey, value: JSON.stringify({ version: 2, ...document }) },
  )
  await page.goto('./')
  const canvas = page.getByRole('img', {
    name: /معاينة السيرة الذاتية، الصفحة/,
  })
  for (const name of ['001', '002', '003', '004', '005', '006']) {
    const switcher = page.getByRole('group', { name: 'عرض مساحة العمل' })
    if (await switcher.isVisible())
      await switcher.getByRole('button', { name: 'تحرير', exact: true }).click()
    await page.getByRole('button', { name: /القالب والتنسيق/ }).click()
    await page
      .getByRole('button', { name: 'تصفح القوالب', exact: true })
      .click()
    const gallery = page.getByRole('dialog')
    await gallery
      .getByRole('button', { name: `معاينة ${name}`, exact: true })
      .click()
    await expectThumbnailInk(
      gallery
        .getByRole('button', { name: `معاينة ${name}`, exact: true })
        .locator('canvas'),
    )
    await gallery
      .getByRole('button', { name: 'استخدام القالب', exact: true })
      .click()
    if (await switcher.isVisible())
      await switcher
        .getByRole('button', { name: 'معاينة', exact: true })
        .click()
    await expect(
      page.getByRole('button', { name: 'تنزيل PDF', exact: true }),
    ).toBeEnabled({ timeout: 30_000 })
    await expectThumbnailInk(canvas)
    const downloadEvent = page.waitForEvent('download')
    await page.getByRole('button', { name: 'تنزيل PDF', exact: true }).click()
    const task = getDocument({
      data: new Uint8Array(await downloadBytes(await downloadEvent)),
      useSystemFonts: true,
    })
    const pdf = await task.promise
    try {
      const text = (
        await Promise.all(
          Array.from({ length: pdf.numPages }, async (_, index) => {
            const pdfPage = await pdf.getPage(index + 1)
            return (await pdfPage.getTextContent()).items
              .filter((item) => 'str' in item)
              .map((item) => item.str)
              .join(' ')
          }),
        )
      ).join(' ')
      expect(text).toContain('ليلى')
      expect(text).toContain('layla@example.com')
      expect(text).toContain('Figma Toolkit')
      expect(text).not.toContain('Present')
      expect(text).not.toContain('\uFFFD')
      if (name === '006') {
        const first = await pdf.getPage(1)
        const items = (await first.getTextContent()).items.filter(
          (item) => 'str' in item,
        )
        const title = items.find((item) => item.str === 'Figma Toolkit')!
        expect(title).toBeDefined()
        const overlap = await canvas.evaluate(
          async (element, info) => {
            const target = element as HTMLCanvasElement
            const scale = target.width / info.width
            const size = info.size * scale
            await window.document.fonts.load(`700 ${size}px Amiri`)
            const reference = window.document.createElement('canvas')
            reference.width = target.width
            reference.height = target.height
            const context = reference.getContext('2d')!
            context.fillStyle = 'white'
            context.fillRect(0, 0, reference.width, reference.height)
            context.fillStyle = 'black'
            context.font = `700 ${size}px Amiri`
            context.textAlign = 'left'
            context.direction = 'ltr'
            const left = info.x * scale
            const baseline = (info.height - info.y) * scale
            context.fillText('Figma Toolkit', left, baseline)
            const width = Math.ceil(info.textWidth * scale + 6)
            const top = Math.floor(baseline - size * 1.2)
            const height = Math.ceil(size * 1.7)
            const actual = target
              .getContext('2d')!
              .getImageData(Math.floor(left - 3), top, width, height).data
            const expected = context.getImageData(
              Math.floor(left - 3),
              top,
              width,
              height,
            ).data
            let best = 0
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                let intersection = 0
                let union = 0
                for (let y = 1; y < height - 1; y++) {
                  for (let x = 1; x < width - 1; x++) {
                    const a = actual[(y * width + x) * 4]! < 180
                    const b = expected[((y + dy) * width + x + dx) * 4]! < 180
                    if (a && b) intersection++
                    if (a || b) union++
                  }
                }
                best = Math.max(best, intersection / union)
              }
            }
            return best
          },
          {
            x: title.transform[4]!,
            y: title.transform[5]!,
            size: title.height,
            textWidth: title.width,
            width: first.view[2]!,
            height: first.view[3]!,
          },
        )
        expect(
          overlap,
          'PDF glyphs should match the same font rendered by the browser',
        ).toBeGreaterThan(0.55)
      }
    } finally {
      await task.destroy()
    }
    await page.screenshot({
      path: test
        .info()
        .outputPath(`arabic-${name.toLowerCase().replaceAll(' ', '-')}.png`),
      fullPage: true,
    })
  }
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(
    results.violations.map((issue) => ({
      id: issue.id,
      targets: issue.nodes.map((node) => node.target),
    })),
  ).toEqual([])
  expect(externalRequests).toEqual([])
  if (isMobile) {
    await page.setViewportSize({ width: 320, height: 844 })
    expect(
      await page.evaluate(() => window.document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(320)
  }
})

async function expectThumbnailInk(canvas: Locator) {
  await expect(canvas).toBeVisible({ timeout: 20_000 })
  await expect
    .poll(() =>
      canvas.evaluate((element) => {
        if (!(element instanceof HTMLCanvasElement)) return 0
        const { data } = element
          .getContext('2d')!
          .getImageData(0, 0, element.width, element.height)
        let ink = 0
        for (let offset = 0; offset < data.length; offset += 4)
          if (
            data[offset + 3]! &&
            data[offset]! < 200 &&
            data[offset + 1]! < 200 &&
            data[offset + 2]! < 200
          )
            ink++
        return ink
      }),
    )
    .toBeGreaterThan(100)
}

async function chooseTemplate(page: Page, name: string) {
  await page.getByRole('button', { name: 'Browse templates' }).click()
  const gallery = page.getByRole('dialog', { name: /Templates/ })
  await gallery
    .getByRole('button', { name: `Inspect ${name}`, exact: true })
    .click()
  await gallery
    .getByRole('button', { name: 'Use template', exact: true })
    .click()
  await expect(gallery).toHaveCount(0)
}

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

test('empty CVs start with template samples before editing and resume entered content', async ({
  page,
  isMobile,
}) => {
  test.setTimeout(90_000)
  await page.goto('./')
  await page.getByRole('button', { name: 'English', exact: true }).click()
  const entry = page.getByRole('region', { name: 'Choose a template' })
  await expect(
    page.getByRole('heading', { name: 'Choose a template' }),
  ).toBeFocused()
  await expect(entry.getByRole('button', { name: /^Inspect / })).toHaveCount(6)
  await expect(page.getByRole('group', { name: 'Workspace view' })).toHaveCount(
    0,
  )
  await expect(page.getByLabel('Full name', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Accent color', { exact: true })).toHaveCount(0)
  const defaultChoice = entry.getByRole('button', {
    name: 'Inspect 002',
    exact: true,
  })
  await expect(defaultChoice).toHaveAttribute('aria-pressed', 'true')
  await expectThumbnailInk(defaultChoice.locator('canvas'))
  for (const width of isMobile ? [390, 320] : [1440, 800, 700]) {
    await page.setViewportSize({ width, height: 844 })
    await expect(
      entry.getByRole('button', { name: 'Use this template' }),
    ).toBeInViewport()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width)
    const grid = await entry
      .locator('.template-options')
      .evaluate(
        (element) =>
          getComputedStyle(element).gridTemplateColumns.split(' ').length,
      )
    expect(grid).toBe(isMobile ? 2 : 3)
    const first = await entry
      .getByRole('button', { name: 'Inspect 001', exact: true })
      .boundingBox()
    expect(first!.y + first!.height).toBeLessThan(844)
  }
  await page.screenshot({
    path: test.info().outputPath('template-start.png'),
    fullPage: true,
  })
  const entryResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(
    entryResults.violations.map((issue) => ({
      id: issue.id,
      targets: issue.nodes.map((node) => node.target),
    })),
  ).toEqual([])
  await entry.getByRole('button', { name: 'Inspect 001', exact: true }).click()
  let gallery = page.getByRole('dialog', { name: /Templates/ })
  await expect(
    gallery.getByRole('button', { name: 'Inspect 001', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(
    gallery.getByRole('region', { name: 'CV preview text' }),
  ).toHaveCount(0)
  await expect(
    gallery.getByRole('button', { name: 'Download PDF' }),
  ).toHaveCount(0)
  await expect(gallery.locator('.pdf-paper')).toHaveCount(0)
  await expectThumbnailInk(
    gallery
      .getByRole('button', { name: 'Inspect 001', exact: true })
      .locator('canvas'),
  )
  if (isMobile) {
    expect(await gallery.boundingBox()).toMatchObject({
      x: 0,
      y: 0,
      width: 320,
      height: 844,
    })
    await expect(
      gallery.getByRole('button', { name: 'Close template gallery' }),
    ).toBeFocused()
  }
  await expect(
    gallery.getByRole('button', { name: 'Use template', exact: true }),
  ).toBeInViewport()
  await gallery.screenshot({
    path: test.info().outputPath('template-start-inspection.png'),
  })
  const inspectionResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(
    inspectionResults.violations.map((issue) => ({
      id: issue.id,
      targets: issue.nodes.map((node) => node.target),
    })),
  ).toEqual([])
  await page.keyboard.press('Escape')
  await expect(
    entry.getByRole('button', { name: 'Inspect 001', exact: true }),
  ).toBeFocused()
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key) ?? '{}').cv,
        storageKey,
      ),
    )
    .toEqual(createEmptyCv())
  await entry.getByRole('button', { name: 'Inspect 001', exact: true }).click()
  gallery = page.getByRole('dialog', { name: /Templates/ })
  await gallery
    .getByRole('button', { name: 'Use template', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Personal details' }),
  ).toBeFocused()
  await expect(page.getByLabel('Full name', { exact: true })).toHaveValue('')
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key) ?? '{}').appearance?.templateId,
        storageKey,
      ),
    )
    .toBe('classic')
  await page.reload()
  await expect(entry).toBeVisible()
  await expect(
    entry.getByRole('button', { name: 'Inspect 001', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await entry.getByRole('button', { name: 'Use this template' }).click()
  await page.getByLabel('Full name', { exact: true }).fill('Taylor Returning')
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key) ?? '{}').cv?.personal?.fullName,
        storageKey,
      ),
    )
    .toBe('Taylor Returning')
  await page.reload()
  await expect(entry).toHaveCount(0)
  await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
    'Taylor Returning',
  )
})

test('appearance-only drafts retain styling through opening template selection', async ({
  page,
}) => {
  const document = createDocument('sidebar')
  document.appearance = {
    ...document.appearance,
    accent: '#8c4255',
    fontSize: 12,
    pageSize: 'LETTER',
  }
  await page.addInitScript(
    ({ key, value }) => localStorage.setItem(key, JSON.stringify(value)),
    { key: storageKey, value: { version: 2, ...document } },
  )
  await page.goto('./')
  await expect(
    page.getByRole('button', { name: 'Inspect 003', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Use this template' }).click()
  await expect(page.getByLabel('Full name', { exact: true })).toHaveValue('')
  await page.getByRole('button', { name: /06 Template & style/ }).click()
  await expect(page.locator('.selected-template-details')).toHaveText(
    'Browse templates',
  )
  await expect(page.getByLabel('Accent', { exact: true })).toHaveValue(
    '#8c4255',
  )
  await expect(
    page.getByText('Palette: Original', { exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('radio', { name: 'Large' })).toBeChecked()
  await expect(page.getByLabel('Paper size')).toHaveValue('LETTER')
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key) ?? '{}'),
        storageKey,
      ),
    )
    .toEqual({ version: 2, ...document })
})

test('custom color roles persist across templates, backups, previews and reset', async ({
  page,
}) => {
  test.setTimeout(90_000)
  await page.goto('./')
  await page.getByRole('button', { name: 'Load example' }).click()
  await page.getByRole('button', { name: /06 Template & style/ }).click()
  await expect(page.getByLabel('Surface', { exact: true })).toHaveCount(0)
  await page.getByLabel('Headings', { exact: true }).fill('#913355')
  await page.getByLabel('Subtitles & details', { exact: true }).fill('#345678')
  await page.getByLabel('Body text', { exact: true }).fill('#263947')
  await page.getByLabel('Accent', { exact: true }).fill('#a53b12')
  await chooseTemplate(page, '003')
  await page.getByLabel('Surface', { exact: true }).fill('#eeeeee')
  await page.getByLabel('Headings', { exact: true }).fill('#ffffff')
  await expect(page.getByText('Low contrast on white paper.')).toBeVisible()
  await page.getByLabel('Headings', { exact: true }).fill('#913355')
  const colors = {
    headings: '#913355',
    details: '#345678',
    body: '#263947',
    accent: '#a53b12',
    surface: '#eeeeee',
  }
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key) ?? '{}').appearance?.colors,
        storageKey,
      ),
    )
    .toEqual(colors)
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width)
    for (const input of await page.locator('.color-inputs input').all()) {
      const bounds = await input.boundingBox()
      expect(bounds).not.toBeNull()
      expect(bounds!.x).toBeGreaterThanOrEqual(0)
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width)
    }
    await page.screenshot({
      path: test.info().outputPath(`color-settings-${width}.png`),
      fullPage: true,
    })
  }
  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(accessibility.violations).toEqual([])
  await page.reload()
  await page.getByRole('button', { name: /06 Template & style/ }).click()
  await expect(page.getByLabel('Headings', { exact: true })).toHaveValue(
    colors.headings,
  )
  await expect(page.getByLabel('Surface', { exact: true })).toHaveValue(
    colors.surface,
  )
  await chooseTemplate(page, '004')
  await expect(page.getByLabel('Surface', { exact: true })).toHaveValue(
    colors.surface,
  )
  await page.getByLabel('Document actions', { exact: true }).click()
  const backupPending = page.waitForEvent('download')
  await page
    .getByRole('button', { name: 'Download backup', exact: true })
    .click()
  const backup = JSON.parse(
    (await downloadBytes(await backupPending)).toString(),
  )
  expect(backup.appearance.colors).toEqual(colors)
  await preview(page)
  const pdfPending = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download PDF', exact: true }).click()
  const task = getDocument({
    data: new Uint8Array(await downloadBytes(await pdfPending)),
    useSystemFonts: true,
  })
  try {
    const pdf = await task.promise
    const operators = await (await pdf.getPage(1)).getOperatorList()
    const fills = JSON.stringify(
      operators.argsArray.filter(
        (_, index) => operators.fnArray[index] === OPS.setFillRGBColor,
      ),
    )
    for (const color of [
      colors.headings,
      colors.details,
      colors.body,
      colors.surface,
    ])
      expect(fills).toContain(color)
    const strokes = JSON.stringify(
      operators.argsArray.filter(
        (_, index) => operators.fnArray[index] === OPS.setStrokeRGBColor,
      ),
    )
    expect(strokes).toContain(colors.accent)
  } finally {
    await task.destroy()
  }
  const switcher = page.getByRole('group', { name: 'Workspace view' })
  if (await switcher.isVisible())
    await switcher.getByRole('button', { name: 'Edit', exact: true }).click()
  await page.getByRole('button', { name: 'Reset colors' }).click()
  await expect(page.getByLabel('Accent', { exact: true })).toHaveValue(
    '#177568',
  )
  await expect(page.getByLabel('Surface', { exact: true })).toHaveValue(
    '#dfdfdf',
  )
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key) ?? '{}').appearance?.colors ??
          null,
        storageKey,
      ),
    )
    .toBeNull()
})

test('brand stays on one line without crowding header actions', async ({
  page,
}) => {
  await page.goto('./')
  await page.evaluate(() => document.fonts.ready)
  const brand = page.getByRole('link', { name: 'Sira Datiya home' })
  const actions = page.locator('.header-actions')

  for (const width of [
    1440, 1200, 1199, 960, 959, 800, 700, 699, 390, 360, 359, 320,
  ]) {
    await page.setViewportSize({ width, height: 1000 })
    const textBounds = await brand.evaluate((element) => {
      const text = Array.from(element.childNodes).find(
        (node) =>
          node.nodeType === Node.TEXT_NODE &&
          node.textContent?.includes('Sira'),
      )
      if (!text) throw new Error('Brand text must be present')
      const range = document.createRange()
      range.selectNodeContents(text)
      const lines = Array.from(range.getClientRects()).filter(
        (rect) => rect.width > 0,
      )
      return {
        lineCount: lines.length,
        right: range.getBoundingClientRect().right,
      }
    })
    expect(textBounds.lineCount, `Brand line count at ${width}px`).toBe(1)
    const brandBox = await brand.boundingBox()
    const actionsBox = await actions.boundingBox()
    if (!brandBox || !actionsBox) throw new Error('Header must be visible')
    expect(
      textBounds.right,
      `Brand text bounds at ${width}px`,
    ).toBeLessThanOrEqual(brandBox.x + brandBox.width + 1)
    expect(
      brandBox.x + brandBox.width,
      `Header spacing at ${width}px`,
    ).toBeLessThanOrEqual(actionsBox.x)
    expect(
      actionsBox.x + actionsBox.width,
      `Header width at ${width}px`,
    ).toBeLessThanOrEqual(width)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
      `Page width at ${width}px`,
    ).toBeLessThanOrEqual(width)
  }
})

test('language selector aligns with header actions in every language', async ({
  page,
}) => {
  await page.goto('./')
  const selector = page.locator('.language-control select')
  for (const [language, label] of [
    ['en', 'Language'],
    ['fr', 'Langue'],
    ['ar', 'اللغة'],
  ]) {
    await selector.selectOption(language!)
    await expect(
      page.getByRole('combobox', { name: label, exact: true }),
    ).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    for (const width of [1440, 800, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 })
      const control = await selector.boundingBox()
      const example = await page.locator('.example-button').boundingBox()
      const menu = await page.locator('.document-menu > summary').boundingBox()
      if (!control || !example || !menu)
        throw new Error('Header controls must be visible')
      for (const adjacent of [example, menu]) {
        expect(
          Math.abs(
            control.y + control.height / 2 - adjacent.y - adjacent.height / 2,
          ),
        ).toBeLessThanOrEqual(1)
      }
      expect(control.height).toBe(example.height)
      const brand = await page.locator('.brand').boundingBox()
      const actions = await page.locator('.header-actions').boundingBox()
      if (!brand || !actions) throw new Error('Header must be visible')
      const gap =
        language === 'ar'
          ? brand.x - actions.x - actions.width
          : actions.x - brand.x - brand.width
      expect(gap).toBeGreaterThanOrEqual(width < 700 ? 8 : 0)
      const title = await page.locator('.language-control > span').boundingBox()
      expect(title?.height).toBeLessThanOrEqual(1)
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width)
      if (width === 1440 || width === 320)
        await page.getByRole('banner').screenshot({
          path: test
            .info()
            .outputPath(`language-selector-${language}-${width}.png`),
        })
    }
    await selector.focus()
    await page.keyboard.press('Tab')
    await expect(page.locator('.example-button')).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(selector).toBeFocused()
  }
})

test('preview stays anchored while the editor scrolls and overflows independently', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Side-by-side layout is checked with desktop wheel input')
  await page.goto('./')
  await page.getByRole('button', { name: 'Load example' }).click()
  await page.getByRole('button', { name: /Experience$/ }).click()
  await preview(page)

  const pane = page.getByRole('region', {
    name: 'Document preview',
    exact: true,
  })
  const editor = page.locator('.editor-pane')
  for (const width of [1440, 800, 700]) {
    await page.setViewportSize({ width, height: 1100 })
    await page.evaluate(() => window.scrollTo(0, 0))
    const editorBox = await editor.boundingBox()
    if (!editorBox) throw new Error('Editor must be visible')
    const headerBox = await page.getByRole('banner').boundingBox()
    if (!headerBox) throw new Error('Header must be visible')
    const headerBottom = headerBox.y + headerBox.height
    await expect
      .poll(() =>
        pane.evaluate((element) => element.scrollHeight - element.clientHeight),
      )
      .toBeLessThanOrEqual(1)
    await page.mouse.move(editorBox.x + 50, editorBox.y + 100)
    await page.mouse.wheel(0, 350)
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(100)
    await expect
      .poll(async () => (await pane.boundingBox())?.y)
      .toBeCloseTo(headerBottom, 0)
    expect((await editor.boundingBox())!.y).toBeLessThan(editorBox.y - 100)
    expect(await pane.evaluate((element) => element.scrollTop)).toBe(0)

    await page.setViewportSize({ width, height: 500 })
    await expect
      .poll(() =>
        pane.evaluate((element) => element.scrollHeight - element.clientHeight),
      )
      .toBeGreaterThan(100)
    const paneBox = await pane.boundingBox()
    if (!paneBox) throw new Error('Preview must be visible')
    expect(paneBox.y).toBeCloseTo(headerBottom, 0)
    expect(paneBox.y + paneBox.height).toBeLessThanOrEqual(500)
    const documentScroll = await page.evaluate(() => window.scrollY)
    await page.mouse.move(paneBox.x + paneBox.width / 2, paneBox.y + 100)
    await page.mouse.wheel(0, 300)
    await expect
      .poll(() => pane.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0)
    expect(await page.evaluate(() => window.scrollY)).toBe(documentScroll)
    await page.mouse.wheel(0, 2000)
    await expect
      .poll(() =>
        pane.evaluate(
          (element) =>
            element.scrollHeight - element.clientHeight - element.scrollTop,
        ),
      )
      .toBeLessThanOrEqual(1)
    await page.mouse.wheel(0, 300)
    expect(await page.evaluate(() => window.scrollY)).toBe(documentScroll)
    const keyboardScroll = await pane.evaluate((element) => element.scrollTop)
    await pane.focus()
    await expect(pane).toBeFocused()
    await page.keyboard.press('Home')
    await expect
      .poll(() => pane.evaluate((element) => element.scrollTop))
      .toBeLessThan(keyboardScroll)
  }
})

test('mobile preview keeps normal page scrolling', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Mobile tabs retain their page-scrolling behavior')
  await page.setViewportSize({ width: 390, height: 500 })
  await page.goto('./')
  await page.getByRole('button', { name: 'Load example' }).click()
  await preview(page)
  const pane = page.getByRole('region', {
    name: 'Document preview',
    exact: true,
  })
  await expect(pane).toHaveCSS('position', 'relative')
  await expect(pane).toHaveCSS('overflow-y', 'visible')
  await page
    .getByRole('button', { name: 'Next preview page' })
    .scrollIntoViewIfNeeded()
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  expect(await pane.evaluate((element) => element.scrollTop)).toBe(0)
  await page
    .getByRole('group', { name: 'Workspace view' })
    .getByRole('button', { name: 'Edit', exact: true })
    .click()
  await expect(pane).toBeHidden()
  await expect(page.getByLabel('Full name', { exact: true })).toBeVisible()
})

test('personal details place portrait beside full name and stack below 360px', async ({
  page,
}) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'English', exact: true }).click()
  await page.getByRole('button', { name: 'Use this template' }).click()
  const fullName = page.getByLabel('Full name', { exact: true })
  const portrait = page.getByLabel('Portrait', { exact: true })
  await fullName.focus()
  await page.keyboard.press('Tab')
  await expect(portrait).toBeFocused()

  const titlePositions = new Map<number, number>()
  for (const state of ['empty', 'uploaded', 'replaced', 'removed']) {
    if (state === 'uploaded' || state === 'replaced') {
      const previousImage =
        state === 'replaced'
          ? await page
              .getByRole('img', { name: 'Your portrait' })
              .getAttribute('src')
          : null
      const image = await page.evaluate((currentState) => {
        const canvas = document.createElement('canvas')
        canvas.width = 80
        canvas.height = 100
        const context = canvas.getContext('2d')!
        context.fillStyle = currentState === 'uploaded' ? '#3456a0' : '#b97657'
        context.fillRect(0, 0, 80, 100)
        return canvas.toDataURL('image/png').split(',')[1]!
      }, state)
      const pendingChooser = page.waitForEvent('filechooser')
      if (state === 'uploaded') await portrait.press('Enter')
      else await page.locator('.portrait-upload').click()
      await (
        await pendingChooser
      ).setFiles({
        name: 'fictional-portrait.png',
        mimeType: 'image/png',
        buffer: Buffer.from(image, 'base64'),
      })
      await expect(
        page.getByRole('img', { name: 'Your portrait' }),
      ).toBeVisible()
      if (previousImage)
        await expect(
          page.getByRole('img', { name: 'Your portrait' }),
        ).not.toHaveAttribute('src', previousImage)
      await expect(portrait).toHaveAttribute('title', 'Replace portrait')
    } else if (state === 'removed') {
      await page.getByRole('button', { name: 'Remove portrait' }).click()
      await expect(
        page.getByRole('img', { name: 'Your portrait' }),
      ).toHaveCount(0)
      await expect(portrait).toHaveAttribute('title', 'Upload portrait')
    }
    for (const width of [1440, 390, 360, 359, 320]) {
      await page.setViewportSize({ width, height: 1000 })
      const nameBox = await fullName.locator('..').boundingBox()
      const portraitBox = await page.locator('.portrait-field').boundingBox()
      const titleBox = await page
        .getByLabel('Professional title', { exact: true })
        .locator('..')
        .boundingBox()
      expect(nameBox).not.toBeNull()
      expect(portraitBox).not.toBeNull()
      expect(titleBox).not.toBeNull()
      if (!nameBox || !portraitBox || !titleBox)
        throw new Error('Personal details fields must be visible')
      const portraitInputBox = await portrait.boundingBox()
      expect(portraitInputBox).not.toBeNull()
      expect(portraitInputBox!.width).toBe(42)
      expect(portraitInputBox!.height).toBe(42)
      expect(portraitInputBox!.x).toBeGreaterThanOrEqual(portraitBox.x)
      expect(portraitInputBox!.x + portraitInputBox!.width).toBeLessThanOrEqual(
        portraitBox.x + portraitBox.width,
      )
      if (state === 'empty') titlePositions.set(width, titleBox.y)
      else expect(titleBox.y).toBeCloseTo(titlePositions.get(width)!, 0)
      expect(portraitBox.width).toBeCloseTo(nameBox.width, 0)
      if (width >= 360) {
        expect(portraitBox.y).toBeCloseTo(nameBox.y, 0)
        expect(portraitBox.x).toBeGreaterThan(nameBox.x + nameBox.width)
        const nameInputBox = await fullName.boundingBox()
        expect(nameInputBox).not.toBeNull()
        expect(portraitInputBox!.y).toBeCloseTo(nameInputBox!.y, 0)
        const nameLabelBox = await fullName
          .locator('..')
          .locator('label')
          .boundingBox()
        const portraitLabelBox = await page
          .locator('.portrait-field label')
          .boundingBox()
        expect(nameLabelBox).not.toBeNull()
        expect(portraitLabelBox).not.toBeNull()
        expect(portraitLabelBox!.y).toBeCloseTo(nameLabelBox!.y, 0)
      } else {
        expect(portraitBox.x).toBeCloseTo(nameBox.x, 0)
        expect(portraitBox.y).toBeGreaterThan(nameBox.y + nameBox.height)
      }
      expect(titleBox.y).toBeGreaterThan(portraitBox.y + portraitBox.height)
      expect(titleBox.x).toBeCloseTo(nameBox.x, 0)
      expect(titleBox.width).toBeCloseTo(
        portraitBox.x + portraitBox.width - nameBox.x,
        0,
      )
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true)
      if (
        (state === 'empty' || state === 'uploaded') &&
        (width === 1440 || width === 390)
      )
        await page.screenshot({
          path: test.info().outputPath(`portrait-${state}-${width}.png`),
          fullPage: true,
        })
    }
  }
})

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
  await page.getByRole('button', { name: 'English', exact: true }).click()
  await page.getByRole('button', { name: 'Use this template' }).click()
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
  await chooseTemplate(page, '001')
  await expect(page.locator('.selected-template-details')).toHaveText(
    'Browse templates',
  )
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
  await expect(
    page.getByRole('heading', { name: 'Choose a template' }),
  ).toBeVisible()
  await expect(page.getByLabel('Full name', { exact: true })).toHaveCount(0)
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

test('proficiency display persists, restores and follows template capabilities', async ({
  page,
}) => {
  test.setTimeout(90_000)
  const document = createDocument('sidebar')
  document.cv.personal.fullName = 'Avery Example'
  document.cv.skills = [
    { id: 'rated', name: 'Service design', level: 3 },
    { id: 'unrated', name: 'Research', level: null },
  ]
  await page.addInitScript(
    ({ key, value }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, value)
    },
    { key: storageKey, value: JSON.stringify({ version: 2, ...document }) },
  )
  async function edit() {
    const switcher = page.getByRole('group', { name: 'Workspace view' })
    if (await switcher.isVisible())
      await switcher.getByRole('button', { name: 'Edit', exact: true }).click()
  }
  async function skills() {
    await edit()
    await page.getByRole('button', { name: /Skills & extras/ }).click()
  }
  async function pdfText() {
    await preview(page)
    const pending = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download PDF' }).click()
    const task = getDocument({
      data: new Uint8Array(await downloadBytes(await pending)),
      useSystemFonts: true,
    })
    try {
      const pdf = await task.promise
      const content = await (await pdf.getPage(1)).getTextContent()
      return content.items
        .filter((item) => 'str' in item)
        .map((item) => item.str)
        .join(' ')
    } finally {
      await task.destroy()
    }
  }
  await page.goto('./')
  await skills()
  const display = page.getByRole('combobox', { name: 'Proficiency display' })
  await expect(display).toHaveValue('both')
  await expect(display.getByRole('option')).toHaveText([
    'Bar only',
    'Text only',
    'Both',
  ])
  await display.selectOption('bar')
  await display.focus()
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('button', { name: 'Remove skill 1' }),
  ).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(
    page.getByLabel('Skill name', { exact: true }).first(),
  ).toBeFocused()
  const viewport = page.viewportSize()!
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await expect(display).toBeVisible()
    const bounds = (await display.boundingBox())!
    expect(bounds.x).toBeGreaterThanOrEqual(0)
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
    expect(
      await page.evaluate(() => window.document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width)
    if (width === 320)
      await page.screenshot({
        path: test.info().outputPath('proficiency-editor-320.png'),
        fullPage: true,
      })
  }
  await page.setViewportSize(viewport)
  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(accessibility.violations).toEqual([])
  expect(await pdfText()).not.toContain('Intermediate')
  await expect(
    page.getByRole('region', { name: 'CV preview text' }),
  ).toContainText('Service design: Intermediate')
  await page.screenshot({
    path: test.info().outputPath('proficiency-bar.png'),
    fullPage: true,
  })
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key) ?? '{}').appearance
            ?.skillProficiencyDisplay,
        storageKey,
      ),
    )
    .toBe('bar')
  await page.reload()
  await skills()
  await expect(display).toHaveValue('bar')
  await page.getByLabel('Document actions', { exact: true }).click()
  const pending = page.waitForEvent('download')
  await page
    .getByRole('button', { name: 'Download backup', exact: true })
    .click()
  const backup = await downloadBytes(await pending)
  expect(JSON.parse(backup.toString()).appearance.skillProficiencyDisplay).toBe(
    'bar',
  )
  await display.selectOption('text')
  await page.getByLabel('CV backup file').setInputFiles({
    name: 'proficiency-backup.json',
    mimeType: 'application/json',
    buffer: backup,
  })
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Restore backup', exact: true })
    .click()
  await skills()
  await expect(display).toHaveValue('bar')
  await page.getByRole('button', { name: /06 Template & style/ }).click()
  await chooseTemplate(page, '001')
  await skills()
  await expect(display).toHaveCount(0)
  await expect(
    page.getByLabel('Proficiency', { exact: true }).first(),
  ).toHaveValue('3')
  expect(await pdfText()).toContain('Intermediate')
  await edit()
  await page.getByRole('button', { name: /06 Template & style/ }).click()
  await chooseTemplate(page, '003')
  await skills()
  await expect(display).toHaveValue('bar')
  for (const mode of ['text', 'both']) {
    await display.selectOption(mode)
    const text = await pdfText()
    expect(text).toContain('Intermediate')
    expect(text).toContain('Research')
    expect(text).not.toContain('Unrated')
    await page.screenshot({
      path: test.info().outputPath(`proficiency-${mode}.png`),
      fullPage: true,
    })
    await skills()
  }
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
  await chooseTemplate(page, '003')
  await page.getByLabel('Paper size').selectOption('LETTER')
  for (const template of ['003', '001', '002', '004', '005', '006']) {
    if (template !== '003') {
      await page.getByRole('button', { name: /06 Template & style/ }).click()
      await chooseTemplate(page, template)
    }
    await preview(page)
    await expect(page.locator('.preview-status')).toHaveCount(0)
    await expect(page.locator('.preview-pagination')).toBeVisible()
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
            if ((template === '005' || template === '006') && index === 0) {
              const summary = items.find(
                (item) =>
                  item.str === (template === '006' ? 'Profile' : 'SUMMARY'),
              )!
              const header = items.filter(
                (item) =>
                  item.str.trim() && item.transform[5] > summary.transform[5],
              )
              const firstPage = await pdf.getPage(1)
              for (const item of header)
                expect(item.transform[4] + item.width).toBeLessThanOrEqual(
                  firstPage.view[2]! - (template === '006' ? 113 : 134) + 1,
                )
            }
            if (
              template === '004' ||
              template === '005' ||
              template === '006'
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
    if (template === '004') {
      await page.screenshot({
        path: test.info().outputPath('traditional-portrait-preview.png'),
        fullPage: true,
      })
    }
    if (template === '005') {
      await page.screenshot({
        path: test.info().outputPath('prime-ats-portrait-preview.png'),
        fullPage: true,
      })
    }
    if (template === '006') {
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
    if (template === '003') {
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
  await expect(page.locator('.selected-template-details')).toHaveText(
    'Browse templates',
  )
  await page.getByRole('button', { name: 'Browse templates' }).click()
  await expect(
    page
      .getByRole('dialog')
      .getByRole('button', { name: 'Inspect 002', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Close template gallery' }).click()
  await preview(page)
  await expect(page.locator('.preview-status')).toHaveCount(0)
  await expect(page.locator('.preview-pagination')).toBeVisible()
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
  await page.getByRole('button', { name: 'English', exact: true }).click()
  await page.getByRole('button', { name: 'Use this template' }).click()
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
  await page.getByRole('button', { name: 'Browse templates' }).focus()
  await page.keyboard.press('Enter')
  await expect(
    page.getByRole('button', { name: 'Close template gallery' }),
  ).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(
    page.getByRole('button', { name: 'Browse templates' }),
  ).toBeFocused()
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

test('template gallery supports thumbnails, cancellation and responsive selection without a preview, filters or totals', async ({
  page,
  isMobile,
}) => {
  test.setTimeout(90_000)
  await page.goto('./')
  await page.getByRole('button', { name: 'Load example' }).click()
  await page.getByLabel('Full name', { exact: true }).fill('Jordan Gallery')
  await page.getByRole('button', { name: /06 Template & style/ }).click()
  await page.getByTitle('Cobalt', { exact: true }).click()
  await page.getByText('Large', { exact: true }).click()
  await page.getByLabel('Paper size').selectOption('LETTER')
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key) ?? '{}').appearance?.pageSize,
        storageKey,
      ),
    )
    .toBe('LETTER')
  const before = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    storageKey,
  )
  expect(
    (await page.locator('.selected-template').boundingBox())!.height,
  ).toBeLessThan(150)
  await page.getByRole('button', { name: 'Browse templates' }).click()
  const gallery = page.getByRole('dialog', { name: /Templates/ })
  await expect(
    gallery.getByRole('button', { name: 'Close template gallery' }),
  ).toBeFocused()
  await expect(gallery.getByRole('searchbox')).toHaveCount(0)
  await expect(gallery.getByRole('combobox')).toHaveCount(0)
  await expect(
    gallery.getByRole('heading', { name: 'Templates', exact: true }),
  ).toHaveText('Templates')
  await expect(gallery.getByText(/^\d+ templates?$/)).toHaveCount(0)
  await expect(gallery.getByRole('button', { name: /^Inspect / })).toHaveCount(
    6,
  )
  await expect(
    gallery.getByRole('button', { name: 'Inspect 002', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await gallery.getByRole('button', { name: 'Close template gallery' }).focus()
  await page.keyboard.press('Shift+Tab')
  expect(
    await gallery.evaluate((element) =>
      element.contains(document.activeElement),
    ),
  ).toBe(true)
  await page.keyboard.press('Escape')
  await expect(gallery).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Browse templates' }),
  ).toBeFocused()
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      storageKey,
    ),
  ).toEqual(before)
  await page.getByRole('button', { name: 'Browse templates' }).click()
  for (const width of isMobile ? [390, 320] : [1440, 800, 700]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await gallery.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true)
    expect(
      await gallery
        .locator('.gallery-browser')
        .evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBe(true)
  }
  for (const option of await gallery.locator('.template-option').all()) {
    await option.scrollIntoViewIfNeeded()
    await expectThumbnailInk(option.locator('canvas'))
  }
  await page.setViewportSize({ width: isMobile ? 390 : 1440, height: 900 })
  await expectThumbnailInk(
    gallery
      .getByRole('button', { name: 'Inspect 001', exact: true })
      .locator('canvas'),
  )
  await expectThumbnailInk(
    gallery
      .getByRole('button', { name: 'Inspect 002', exact: true })
      .locator('canvas'),
  )
  await gallery.screenshot({
    path: test.info().outputPath('template-gallery.png'),
  })
  const galleryResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(
    galleryResults.violations.map((issue) => ({
      id: issue.id,
      targets: issue.nodes.map((node) => node.target),
    })),
  ).toEqual([])
  await gallery
    .getByRole('button', { name: 'Inspect 001', exact: true })
    .click()
  await expect(
    gallery.getByRole('button', { name: 'Inspect 001', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  expect(
    (await gallery.locator('.gallery-header').boundingBox())!.y,
  ).toBeGreaterThanOrEqual((await gallery.boundingBox())!.y)
  await expect(
    gallery.getByRole('region', { name: 'CV preview text' }),
  ).toHaveCount(0)
  await expect(
    gallery.getByRole('region', { name: 'Template CV preview' }),
  ).toHaveCount(0)
  await expect(gallery.locator('.pdf-paper')).toHaveCount(0)
  await expect(gallery.locator('.gallery-browser')).toBeVisible()
  await expect(
    gallery.getByRole('button', { name: 'Use template' }),
  ).toBeInViewport()
  await gallery.screenshot({
    path: test.info().outputPath('template-inspection.png'),
  })
  const inspectionResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(
    inspectionResults.violations.map((issue) => ({
      id: issue.id,
      targets: issue.nodes.map((node) => node.target),
    })),
  ).toEqual([])
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      storageKey,
    ),
  ).toEqual(before)
  await gallery
    .getByRole('button', { name: 'Inspect 003', exact: true })
    .click()
  await gallery.getByRole('button', { name: 'Close template gallery' }).click()
  await page.getByRole('button', { name: 'Browse templates' }).click()
  await expect(gallery.getByRole('button', { name: /^Inspect / })).toHaveCount(
    6,
  )
  await expect(
    gallery.getByRole('button', { name: 'Inspect 002', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await gallery
    .getByRole('button', { name: 'Inspect 003', exact: true })
    .click()
  await gallery.getByRole('button', { name: 'Use template' }).click()
  await expect(gallery).toHaveCount(0)
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!).appearance.templateId,
        storageKey,
      ),
    )
    .toBe('sidebar')
  const after = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    storageKey,
  )
  expect(after.cv).toEqual(before.cv)
  expect(after.appearance).toEqual({
    ...before.appearance,
    templateId: 'sidebar',
  })
  await page.reload()
  await page.getByRole('button', { name: /06 Template & style/ }).click()
  await expect(page.locator('.selected-template-details')).toHaveText(
    'Browse templates',
  )
  await page.getByRole('button', { name: 'Browse templates' }).click()
  await expect(
    page
      .getByRole('dialog')
      .getByRole('button', { name: 'Inspect 003', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
})
