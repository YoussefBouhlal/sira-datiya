// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, beforeAll, expect, it, vi } from 'vitest'
import { createDocument } from '../../domain/cv/defaults'
import { TemplatePicker } from './TemplatePicker'

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
  }
})

afterEach(cleanup)

it('keeps inspection tentative, filters by layout and resets browsing on reopen', () => {
  const appearance = createDocument('classic').appearance
  const onChange = vi.fn()
  render(
    <TemplatePicker
      options={[
        { id: 'classic', name: 'Classic', typography: 'serif' },
        {
          id: 'sidebar',
          name: 'Sidebar',
          typography: 'serif',
          layout: 'two-column',
        },
      ]}
      appearance={appearance}
      onChange={onChange}
      renderThumbnail={(template) => <span>{template.name} sample</span>}
      renderPreview={(template) => <p>{template.name} personal preview</p>}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Browse templates' }))
  let gallery = screen.getByRole('dialog')
  fireEvent.change(within(gallery).getByLabelText('Layout'), {
    target: { value: 'two-column' },
  })
  expect(
    within(gallery).queryByRole('button', { name: 'Inspect Classic' }),
  ).not.toBeInTheDocument()
  fireEvent.click(
    within(gallery).getByRole('button', { name: 'Inspect Sidebar' }),
  )
  expect(
    within(gallery).getByText('Sidebar personal preview'),
  ).toBeInTheDocument()
  expect(onChange).not.toHaveBeenCalled()
  fireEvent(gallery, new Event('cancel', { bubbles: true }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Browse templates' }))
  gallery = screen.getByRole('dialog')
  expect(within(gallery).getByLabelText('Layout')).toHaveValue('all')
  expect(
    within(gallery).getByRole('button', { name: 'Inspect Classic' }),
  ).toHaveAttribute('aria-pressed', 'true')
  fireEvent.change(within(gallery).getByLabelText('Search templates'), {
    target: { value: 'missing' },
  })
  expect(within(gallery).getByText('No templates found.')).toBeInTheDocument()
  fireEvent.click(
    within(gallery).getByRole('button', { name: 'Clear filters' }),
  )
  fireEvent.click(
    within(gallery).getByRole('button', { name: 'Inspect Sidebar' }),
  )
  fireEvent.click(within(gallery).getByRole('button', { name: 'Use template' }))
  expect(onChange).toHaveBeenCalledExactlyOnceWith({
    ...appearance,
    templateId: 'sidebar',
  })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
