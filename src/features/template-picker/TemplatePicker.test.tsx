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
import { TemplatePicker, TemplateStart } from './TemplatePicker'

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
  }
})

afterEach(cleanup)

it('offers the default immediately and keeps opening inspection tentative', () => {
  const onApply = vi.fn()
  render(
    <TemplateStart
      options={[
        { id: 'classic', name: 'Classic', typography: 'serif' },
        { id: 'modern', name: 'Studio', typography: 'sans' },
      ]}
      selectedId="classic"
      onApply={onApply}
      renderThumbnail={(template) => <span>{template.name} sample</span>}
      renderPreview={(template) => <p>{template.name} sample inspection</p>}
    />,
  )
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.queryByText('Accent color')).not.toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Inspect Classic' }),
  ).toHaveAttribute('aria-pressed', 'true')
  fireEvent.click(screen.getByRole('button', { name: 'Use this template' }))
  expect(onApply).toHaveBeenCalledExactlyOnceWith('classic')
  onApply.mockClear()
  screen.getByRole('button', { name: 'Inspect Studio' }).focus()
  fireEvent.click(screen.getByRole('button', { name: 'Inspect Studio' }))
  let gallery = screen.getByRole('dialog')
  expect(
    within(gallery).getByText('Studio sample inspection'),
  ).toBeInTheDocument()
  expect(onApply).not.toHaveBeenCalled()
  fireEvent(gallery, new Event('cancel', { bubbles: true }))
  expect(screen.getByRole('button', { name: 'Inspect Studio' })).toHaveFocus()
  fireEvent.click(screen.getByRole('button', { name: 'Inspect Studio' }))
  gallery = screen.getByRole('dialog')
  fireEvent.click(within(gallery).getByRole('button', { name: 'Use template' }))
  expect(onApply).toHaveBeenCalledExactlyOnceWith('modern')
})

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
