import { ArrowLeft, Check, LayoutGrid, Search, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import type { Appearance } from '../../domain/cv/types'
import type { TemplateOption } from '../../templates/types'
import { useTranslation } from '../../i18n/context'

const accents = [
  { value: '#177568', label: 'Forest' },
  { value: '#3456a0', label: 'Cobalt' },
  { value: '#8c4255', label: 'Rose' },
  { value: '#292929', label: 'Ink' },
] as const

type TemplateGalleryProps = {
  options: readonly TemplateOption[]
  selectedId: string
  renderThumbnail: (template: TemplateOption) => ReactNode
  renderPreview: (template: TemplateOption) => ReactNode
  onClose: () => void
  onApply: (id: string) => void
  inspectionId?: string
}

export function TemplateStart({
  options,
  selectedId,
  renderThumbnail,
  renderPreview,
  onApply,
}: Omit<TemplateGalleryProps, 'onClose' | 'inspectionId'>) {
  const { t } = useTranslation()
  const [inspectionId, setInspectionId] = useState<string | null>(null)
  return (
    <div className="template-start">
      <TemplateChoices
        options={options}
        selectedId={selectedId}
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
          renderPreview={renderPreview}
          onClose={() => setInspectionId(null)}
          onApply={onApply}
        />
      )}
    </div>
  )
}

function TemplateChoices({
  options,
  selectedId,
  candidateId,
  renderThumbnail,
  onInspect,
}: Pick<TemplateGalleryProps, 'options' | 'selectedId' | 'renderThumbnail'> & {
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
          <span className="template-option-label">
            <span>
              {option.name}
              {selectedId === option.id && <small>{t('Current')}</small>}
            </span>
            <span className="selection-indicator">
              {candidateId === option.id && <Check size={12} />}
            </span>
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
  renderPreview,
}: {
  options: readonly TemplateOption[]
  appearance: Appearance
  onChange: (appearance: Appearance) => void
  renderThumbnail: (template: TemplateOption) => ReactNode
  renderPreview: (template: TemplateOption) => ReactNode
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
            <strong>{selected.name}</strong>
            <span>
              {t(
                selected.layout === 'two-column'
                  ? 'Two columns'
                  : 'Single column',
              )}
            </span>
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
      <fieldset className="plain-fieldset">
        <legend className="setting-label">{t('Accent color')}</legend>
        <div className="color-options">
          {accents.map((accent) => (
            <label
              key={accent.value}
              className="color-option"
              title={t(accent.label)}
            >
              <input
                className="sr-only"
                type="radio"
                name={`${groupId}-accent`}
                aria-label={t(accent.label)}
                checked={appearance.accent === accent.value}
                onChange={() =>
                  onChange({ ...appearance, accent: accent.value })
                }
              />
              <span
                className="color-swatch"
                style={{ background: accent.value }}
              >
                {appearance.accent === accent.value && <Check size={17} />}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
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
          renderPreview={renderPreview}
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
  renderPreview,
  onClose,
  onApply,
  inspectionId,
}: TemplateGalleryProps) {
  const { t } = useTranslation()
  const dialog = useRef<HTMLDialogElement>(null)
  const searchInput = useRef<HTMLInputElement>(null)
  const previewHeading = useRef<HTMLHeadingElement>(null)
  const titleId = useId()
  const searchId = useId()
  const layoutId = useId()
  const [query, setQuery] = useState('')
  const [layout, setLayout] = useState('all')
  const [candidateId, setCandidateId] = useState(inspectionId ?? selectedId)
  const [inspecting, setInspecting] = useState(Boolean(inspectionId))
  const candidate = options.find((option) => option.id === candidateId)!
  const filtered = options.filter(
    (option) =>
      option.name.toLowerCase().includes(query.trim().toLowerCase()) &&
      (layout === 'all' || (option.layout ?? 'single-column') === layout),
  )

  useEffect(() => {
    const element = dialog.current
    const opener = document.activeElement
    element?.showModal()
    searchInput.current?.focus()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      element?.close()
      document.body.style.overflow = previous
      if (opener instanceof HTMLElement) opener.focus({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    if (inspecting && window.innerWidth < 700)
      previewHeading.current?.focus({ preventScroll: true })
  }, [inspecting, candidateId])

  return (
    <dialog
      ref={dialog}
      className={`template-gallery ${inspecting ? 'is-inspecting' : ''}`}
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
        <h2 id={titleId}>
          {t('Templates')} <span>{options.length}</span>
        </h2>
        <button
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
          <div className="gallery-filters">
            <div className="form-field">
              <label htmlFor={searchId}>{t('Search templates')}</label>
              <div className="gallery-search">
                <Search size={16} aria-hidden="true" />
                <input
                  ref={searchInput}
                  autoFocus
                  id={searchId}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor={layoutId}>{t('Layout')}</label>
              <select
                id={layoutId}
                value={layout}
                onChange={(event) => setLayout(event.target.value)}
              >
                <option value="all">{t('All layouts')}</option>
                <option value="single-column">{t('Single column')}</option>
                <option value="two-column">{t('Two columns')}</option>
              </select>
            </div>
          </div>
          <p className="gallery-count" role="status">
            {t(
              filtered.length === 1 ? '{count} template' : '{count} templates',
              { count: filtered.length },
            )}
          </p>
          <TemplateChoices
            options={filtered}
            selectedId={selectedId}
            candidateId={candidateId}
            renderThumbnail={renderThumbnail}
            onInspect={(templateId) => {
              setCandidateId(templateId)
              setInspecting(true)
            }}
          />
          {filtered.length === 0 && (
            <div className="gallery-empty">
              <p>{t('No templates found.')}</p>
              <button
                type="button"
                className="button button-quiet"
                onClick={() => {
                  setQuery('')
                  setLayout('all')
                }}
              >
                {t('Clear filters')}
              </button>
            </div>
          )}
        </section>
        <section
          className="gallery-inspection"
          aria-labelledby={`${titleId}-preview`}
        >
          <div className="gallery-preview-heading">
            <button
              type="button"
              className="icon-button gallery-back"
              aria-label={t('Back to templates')}
              title={t('Back to templates')}
              onClick={() => {
                setInspecting(false)
                window.requestAnimationFrame(() =>
                  dialog.current
                    ?.querySelector<HTMLButtonElement>(
                      `button[aria-pressed="true"]`,
                    )
                    ?.focus(),
                )
              }}
            >
              <ArrowLeft size={18} />
            </button>
            <h3 id={`${titleId}-preview`} ref={previewHeading} tabIndex={-1}>
              {candidate.name}
            </h3>
          </div>
          <div
            className="gallery-document"
            key={candidate.id}
            tabIndex={0}
            role="region"
            aria-label={t('Template CV preview')}
          >
            {renderPreview(candidate)}
          </div>
          <footer className="gallery-apply">
            <button
              type="button"
              className="button button-primary"
              onClick={() => onApply(candidate.id)}
            >
              <Check size={16} />
              {t('Use template')}
            </button>
          </footer>
        </section>
      </div>
    </dialog>
  )
}
