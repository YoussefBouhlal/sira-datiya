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
        { id: 'classic', name: '001', typography: 'serif' },
        { id: 'modern', name: '002', typography: 'sans' },
      ]}
      selectedId="classic"
      onApply={onApply}
      renderThumbnail={(template) => <span>{template.name} sample</span>}
    />,
  )
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.queryByText('Accent color')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Inspect 001' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  for (const number of ['001', '002']) {
    const choice = screen.getByRole('button', { name: `Inspect ${number}` })
    expect(choice.children).toHaveLength(1)
    expect(choice.firstElementChild).toHaveClass('template-miniature')
    expect(choice.querySelector('svg')).toBeNull()
    expect(within(choice).queryByText(number)).not.toBeInTheDocument()
  }
  expect(screen.queryByText('Current')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Use this template' }))
  expect(onApply).toHaveBeenCalledExactlyOnceWith('classic')
  onApply.mockClear()
  screen.getByRole('button', { name: 'Inspect 002' }).focus()
  fireEvent.click(screen.getByRole('button', { name: 'Inspect 002' }))
  let gallery = screen.getByRole('dialog')
  expect(
    within(gallery).getByRole('button', { name: 'Inspect 002' }),
  ).toHaveAttribute('aria-pressed', 'true')
  expect(
    within(gallery).queryByRole('region', { name: 'Template CV preview' }),
  ).not.toBeInTheDocument()
  expect(onApply).not.toHaveBeenCalled()
  fireEvent(gallery, new Event('cancel', { bubbles: true }))
  expect(screen.getByRole('button', { name: 'Inspect 002' })).toHaveFocus()
  fireEvent.click(screen.getByRole('button', { name: 'Inspect 002' }))
  gallery = screen.getByRole('dialog')
  fireEvent.click(within(gallery).getByRole('button', { name: 'Use template' }))
  expect(onApply).toHaveBeenCalledExactlyOnceWith('modern')
})

it('shows all templates without filters or counts and resets tentative selection on reopen', () => {
  const appearance = createDocument('classic').appearance
  const onChange = vi.fn()
  render(
    <TemplatePicker
      options={[
        { id: 'classic', name: '001', typography: 'serif' },
        {
          id: 'sidebar',
          name: '003',
          typography: 'serif',
          layout: 'two-column',
        },
      ]}
      appearance={appearance}
      onChange={onChange}
      renderThumbnail={(template) => <span>{template.name} sample</span>}
    />,
  )
  expect(screen.queryByText('001')).not.toBeInTheDocument()
  expect(screen.queryByText('Single column')).not.toBeInTheDocument()
  expect(screen.queryByText('Two columns')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Browse templates' }))
  let gallery = screen.getByRole('dialog')
  expect(within(gallery).queryByRole('searchbox')).not.toBeInTheDocument()
  expect(within(gallery).queryByRole('combobox')).not.toBeInTheDocument()
  expect(
    within(gallery).getByRole('heading', { name: 'Templates' }),
  ).toHaveTextContent(/^Templates$/)
  expect(within(gallery).queryByText(/templates$/)).not.toBeInTheDocument()
  expect(
    within(gallery).getByRole('button', { name: 'Close template gallery' }),
  ).toHaveFocus()
  expect(
    within(gallery).getAllByRole('button', { name: /^Inspect / }),
  ).toHaveLength(2)
  fireEvent.click(within(gallery).getByRole('button', { name: 'Inspect 003' }))
  expect(
    within(gallery).getByRole('button', { name: 'Inspect 003' }),
  ).toHaveAttribute('aria-pressed', 'true')
  expect(
    within(gallery).queryByRole('region', { name: 'Template CV preview' }),
  ).not.toBeInTheDocument()
  expect(onChange).not.toHaveBeenCalled()
  fireEvent(gallery, new Event('cancel', { bubbles: true }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Browse templates' }))
  gallery = screen.getByRole('dialog')
  expect(
    within(gallery).getByRole('button', { name: 'Inspect 001' }),
  ).toHaveAttribute('aria-pressed', 'true')
  fireEvent.click(within(gallery).getByRole('button', { name: 'Inspect 003' }))
  fireEvent.click(within(gallery).getByRole('button', { name: 'Use template' }))
  expect(onChange).toHaveBeenCalledExactlyOnceWith({
    ...appearance,
    templateId: 'sidebar',
  })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
