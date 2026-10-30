import { Check, LayoutGrid, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import type { Appearance } from '../../domain/cv/types'
import type { TemplateOption } from '../../templates/types'
import { useTranslation } from '../../i18n/context'
import { ColorSettings } from './ColorSettings'

type TemplateGalleryProps = {
  options: readonly TemplateOption[]
  selectedId: string
  renderThumbnail: (template: TemplateOption) => ReactNode
  onClose: () => void
  onApply: (id: string) => void
  inspectionId?: string
}

export function TemplateStart({
  options,
  selectedId,
  renderThumbnail,
  onApply,
}: Omit<TemplateGalleryProps, 'onClose' | 'inspectionId'>) {
  const { t } = useTranslation()
  const [inspectionId, setInspectionId] = useState<string | null>(null)
  return (
    <div className="template-start">
      <TemplateChoices
        options={options}
        candidateId={selectedId}
        renderThumbnail={renderThumbnail}
        onInspect={setInspectionId}
      />
      <footer className="template-start-footer">
        <button
          type="button"
          className="button button-primary"
          onClick={() => onApply(selectedId)}
        >
          <Check size={16} />
          {t('Use this template')}
        </button>
      </footer>
      {inspectionId && (
        <TemplateGallery
          options={options}
          selectedId={selectedId}
          inspectionId={inspectionId}
          renderThumbnail={renderThumbnail}
          onClose={() => setInspectionId(null)}
          onApply={onApply}
        />
      )}
    </div>
  )
}

function TemplateChoices({
  options,
  candidateId,
  renderThumbnail,
  onInspect,
}: Pick<TemplateGalleryProps, 'options' | 'renderThumbnail'> & {
  candidateId: string
  onInspect: (id: string) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="template-options">
      {options.map((option) => (
        <button
          type="button"
          key={option.id}
          className={`template-option ${candidateId === option.id ? 'is-selected' : ''}`}
          aria-label={t('Inspect {name}', { name: option.name })}
          aria-pressed={candidateId === option.id}
          onClick={() => onInspect(option.id)}
        >
          <span className="template-miniature" aria-hidden="true">
            {renderThumbnail(option)}
          </span>
        </button>
      ))}
    </div>
  )
}

export function TemplatePicker({
  options,
  appearance,
  onChange,
  renderThumbnail,
}: {
  options: readonly TemplateOption[]
  appearance: Appearance
  onChange: (appearance: Appearance) => void
  renderThumbnail: (template: TemplateOption) => ReactNode
}) {
  const { t } = useTranslation()
  const groupId = useId()
  const [galleryOpen, setGalleryOpen] = useState(false)
  const selected = options.find(
    (option) => option.id === appearance.templateId,
  )!
  return (
    <div className="design-settings">
      <fieldset className="plain-fieldset">
        <legend className="setting-label">
          {t('Template')} <span>{String(options.length).padStart(2, '0')}</span>
        </legend>
        <div className="selected-template">
          <div className="selected-template-thumbnail" aria-hidden="true">
            {renderThumbnail(selected)}
          </div>
          <div className="selected-template-details">
            <button
              type="button"
              className="button button-quiet"
              onClick={() => setGalleryOpen(true)}
            >
              <LayoutGrid size={15} /> {t('Browse templates')}
            </button>
          </div>
        </div>
      </fieldset>
      <ColorSettings
        appearance={appearance}
        template={selected}
        onChange={onChange}
      />
      <fieldset className="plain-fieldset">
        <legend className="setting-label">{t('Text size')}</legend>
        <div className="segmented-control">
          {([10, 11, 12] as const).map((size, index) => (
            <label key={size}>
              <input
                className="sr-only"
                type="radio"
                name={`${groupId}-size`}
                checked={appearance.fontSize === size}
                onChange={() => onChange({ ...appearance, fontSize: size })}
              />
              <span>{t(['Small', 'Medium', 'Large'][index]!)}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="form-field">
        <label htmlFor={`${groupId}-paper`}>{t('Paper size')}</label>
        <select
          id={`${groupId}-paper`}
          value={appearance.pageSize}
          onChange={(event) =>
            onChange({
              ...appearance,
              pageSize: event.target.value === 'LETTER' ? 'LETTER' : 'A4',
            })
          }
        >
          <option value="A4">{t('A4 (210 x 297 mm)')}</option>
          <option value="LETTER">{t('US Letter (8.5 x 11 in)')}</option>
        </select>
      </div>
      {galleryOpen && (
        <TemplateGallery
          options={options}
          selectedId={selected.id}
          renderThumbnail={renderThumbnail}
          onClose={() => setGalleryOpen(false)}
          onApply={(templateId) => {
            onChange({ ...appearance, templateId })
            setGalleryOpen(false)
          }}
        />
      )}
    </div>
  )
}

function TemplateGallery({
  options,
  selectedId,
  renderThumbnail,
  onClose,
  onApply,
  inspectionId,
}: TemplateGalleryProps) {
  const { t } = useTranslation()
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const [candidateId, setCandidateId] = useState(inspectionId ?? selectedId)

  useEffect(() => {
    const element = dialog.current
    const opener = document.activeElement
    element?.showModal()
    closeButton.current?.focus()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      element?.close()
      document.body.style.overflow = previous
      if (opener instanceof HTMLElement) opener.focus({ preventScroll: true })
    }
  }, [])

  return (
    <dialog
      ref={dialog}
      className="template-gallery"
      aria-labelledby={titleId}
      onCancel={onClose}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input, select, [tabindex="0"]',
          ),
        ).filter((control) => control.getClientRects().length > 0)
        const first = controls[0]
        const last = controls.at(-1)
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }}
    >
      <header className="gallery-header">
        <h2 id={titleId}>{t('Templates')}</h2>
        <button
          ref={closeButton}
          type="button"
          className="icon-button"
          aria-label={t('Close template gallery')}
          title={t('Close template gallery')}
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </header>
      <div className="gallery-body">
        <section
          className="gallery-browser"
          aria-label={t('Template collection')}
        >
          <TemplateChoices
            options={options}
            candidateId={candidateId}
            renderThumbnail={renderThumbnail}
            onInspect={setCandidateId}
          />
        </section>
      </div>
      <footer className="gallery-apply">
        <button
          type="button"
          className="button button-primary"
          onClick={() => onApply(candidateId)}
        >
          <Check size={16} />
          {t('Use template')}
        </button>
      </footer>
    </dialog>
  )
}
