// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, beforeAll, expect, it, vi } from 'vitest'
import { createDocument, createEmptyCv } from '../domain/cv/defaults'
import { createExampleCv } from '../domain/cv/example'
import type { CvData } from '../domain/cv/types'
import { STORAGE_KEY } from '../lib/storage/cv-storage'
import App from './App'

vi.mock('../features/pdf-export', () => ({
  default: ({ cv }: { cv: CvData }) => (
    <p>{cv.personal.fullName || 'Empty CV preview'}</p>
  ),
  TemplateThumbnail: () => <span>Fictional template thumbnail</span>,
}))

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
  }
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.unstubAllGlobals()
})

it('asks first-time visitors for a language before templates and remembers the choice', () => {
  const { unmount } = render(<App />)
  expect(
    screen.getByRole('heading', { name: 'Choose your language' }),
  ).toHaveFocus()
  expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute(
    'lang',
    'en',
  )
  expect(screen.getByRole('button', { name: 'Français' })).toHaveAttribute(
    'lang',
    'fr',
  )
  expect(screen.getByRole('button', { name: 'العربية' })).toHaveAttribute(
    'lang',
    'ar',
  )
  expect(
    screen.queryByRole('heading', { name: 'Choose a template' }),
  ).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Français' }))
  expect(
    screen.getByRole('heading', { name: 'Choisir un modèle' }),
  ).toHaveFocus()
  expect(screen.getByLabelText('Langue')).toHaveValue('fr')
  unmount()
  render(<App />)
  expect(
    screen.getByRole('heading', { name: 'Choisir un modèle' }),
  ).toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Français' }),
  ).not.toBeInTheDocument()
})

it('opens empty CVs with samples and applies appearance without inserting sample content', async () => {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'English' }))
  expect(
    screen.getByRole('heading', { name: 'Choose a template' }),
  ).toHaveFocus()
  expect(screen.queryByLabelText('Full name')).not.toBeInTheDocument()
  expect(
    screen.queryByRole('group', { name: 'Workspace view' }),
  ).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Inspect 001' }))
  const gallery = screen.getByRole('dialog')
  expect(
    within(gallery).queryByText(createExampleCv().personal.fullName),
  ).not.toBeInTheDocument()
  expect(
    within(gallery).getByRole('button', { name: 'Inspect 001' }),
  ).toHaveAttribute('aria-pressed', 'true')
  fireEvent.click(within(gallery).getByRole('button', { name: 'Use template' }))
  expect(
    screen.getByRole('heading', { name: 'Personal details' }),
  ).toHaveFocus()
  expect(screen.getByLabelText('Full name', { exact: true })).toHaveValue('')
  window.dispatchEvent(new Event('pagehide'))
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
  expect(saved.cv).toEqual(createEmptyCv())
  expect(saved.appearance.templateId).toBe('classic')
})

it.each([
  ['English', 'en', 'Choose a template', 'ltr', 'Inspect'],
  ['Français', 'fr', 'Choisir un modèle', 'ltr', 'Examiner'],
  ['العربية', 'ar', 'اختر قالبًا', 'rtl', 'معاينة'],
])(
  'opens translated templates after choosing %s',
  (label, language, heading, direction, inspect) => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: label }))
    expect(screen.getByRole('heading', { name: heading })).toHaveFocus()
    expect(window.document.documentElement).toHaveAttribute('lang', language)
    expect(window.document.documentElement).toHaveAttribute('dir', direction)
    for (const number of ['001', '002', '003', '004', '005', '006']) {
      expect(
        screen.getByRole('button', { name: `${inspect} ${number}` }),
      ).not.toHaveTextContent(number)
    }
    expect(
      screen.getByRole('button', { name: `${inspect} 002` }),
    ).toHaveAttribute('aria-pressed', 'true')
  },
)

it('reopens the gallery for appearance-only drafts and preserves their selection', () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: 2, ...createDocument('classic') }),
  )
  render(<App />)
  expect(
    screen.getByRole('heading', { name: 'Choose a template' }),
  ).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Inspect 001' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  fireEvent.click(screen.getByRole('button', { name: 'Use this template' }))
  expect(screen.getByLabelText('Full name', { exact: true })).toHaveValue('')
})

it('opens returning content directly in the editor', () => {
  const document = createDocument('classic')
  document.cv.summary = 'A returning draft with no name yet.'
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, ...document }))
  render(<App />)
  expect(
    screen.queryByRole('heading', { name: 'Choose a template' }),
  ).not.toBeInTheDocument()
  expect(
    screen.getByLabelText('Full name', { exact: true }),
  ).toBeInTheDocument()
})

it('keeps unreadable storage in the editor recovery flow without overwriting it', () => {
  localStorage.setItem(STORAGE_KEY, '{unreadable')
  render(<App />)
  expect(screen.getByRole('alert')).toBeInTheDocument()
  expect(
    screen.queryByRole('heading', { name: 'Choose a template' }),
  ).not.toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('Full name', { exact: true }), {
    target: { value: 'Local draft' },
  })
  window.dispatchEvent(new Event('pagehide'))
  expect(localStorage.getItem(STORAGE_KEY)).toBe('{unreadable')
})

it('switches the whole interface without changing content and keeps language on reset', () => {
  const document = createDocument('classic')
  document.cv.personal.fullName = 'ليلى Example'
  document.cv.summary = 'Keep exactly this text.'
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, ...document }))
  render(<App />)
  fireEvent.change(screen.getByLabelText('Language'), {
    target: { value: 'fr' },
  })
  expect(screen.getByLabelText('Nom complet', { exact: true })).toHaveValue(
    'ليلى Example',
  )
  expect(window.document.documentElement).toHaveAttribute('lang', 'fr')
  fireEvent.change(screen.getByLabelText('Langue'), { target: { value: 'ar' } })
  expect(screen.getByLabelText('الاسم الكامل', { exact: true })).toHaveValue(
    'ليلى Example',
  )
  expect(window.document.documentElement).toHaveAttribute('dir', 'rtl')
  window.dispatchEvent(new Event('pagehide'))
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
  expect(saved.cv).toEqual(document.cv)
  expect(saved.appearance.language).toBe('ar')
  fireEvent.click(screen.getByLabelText('إجراءات المستند'))
  fireEvent.click(screen.getByRole('button', { name: 'البدء من جديد' }))
  fireEvent.click(
    within(screen.getByRole('dialog')).getByRole('button', {
      name: 'البدء من جديد',
    }),
  )
  expect(
    screen.getByRole('heading', { name: 'اختر قالبًا' }),
  ).toBeInTheDocument()
  expect(screen.getByLabelText('اللغة')).toHaveValue('ar')
})
