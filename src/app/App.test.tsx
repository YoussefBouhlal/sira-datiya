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

it('opens empty CVs with samples and applies appearance without inserting sample content', async () => {
  render(<App />)
  expect(
    screen.getByRole('heading', { name: 'Choose a template' }),
  ).toHaveFocus()
  expect(screen.queryByLabelText('Full name')).not.toBeInTheDocument()
  expect(
    screen.queryByRole('group', { name: 'Workspace view' }),
  ).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Inspect Classic' }))
  const gallery = screen.getByRole('dialog')
  expect(
    await within(gallery).findByText(createExampleCv().personal.fullName),
  ).toBeInTheDocument()
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

it('reopens the gallery for appearance-only drafts and preserves their selection', () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: 2, ...createDocument('classic') }),
  )
  render(<App />)
  expect(
    screen.getByRole('heading', { name: 'Choose a template' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Inspect Classic' }),
  ).toHaveAttribute('aria-pressed', 'true')
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
