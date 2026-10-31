import { Pencil, RotateCcw } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { sectionHeadingSchema } from '../../domain/cv/schema'
import type { CvData, SectionHeadingKey } from '../../domain/cv/types'
import type { TemplateOption } from '../../templates/types'
import { useTranslation } from '../../i18n/context'

export function SectionHeadingField({
  cv,
  onChange,
  template,
  section,
}: {
  cv: CvData
  onChange: (cv: CvData) => void
  template: TemplateOption
  section: SectionHeadingKey
}) {
  const { t } = useTranslation()
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const saved = cv.headings?.[section] ?? ''
  const [draft, setDraft] = useState(saved)
  const defaultHeading = template.headings?.[section]
  useEffect(() => {
    if (document.activeElement !== input.current) setDraft(saved)
  }, [saved, template.id])
  if (!defaultHeading) return null
  const label = t(defaultHeading)
  const valid = sectionHeadingSchema.safeParse(draft).success
  function commit(value: string) {
    const result = sectionHeadingSchema.safeParse(value)
    if (!result.success) return
    const headings = { ...cv.headings }
    if (result.data) headings[section] = result.data
    else delete headings[section]
    onChange({
      ...cv,
      headings: Object.keys(headings).length ? headings : undefined,
    })
  }
  return (
    <details className="section-heading-editor full-width">
      <summary title={t('Edit heading: {section}', { section: label })}>
        <Pencil size={14} aria-hidden="true" />
        {t('Edit heading: {section}', { section: label })}
      </summary>
      <div className="heading-input-row">
        <div className="form-field">
          <label htmlFor={id}>
            {t('{section} heading', { section: label })}
          </label>
          <input
            ref={input}
            id={id}
            dir="auto"
            value={draft}
            placeholder={label}
            aria-invalid={!valid}
            aria-describedby={!valid ? `${id}-error` : undefined}
            onChange={(event) => {
              setDraft(event.target.value)
              commit(event.target.value)
            }}
            onBlur={() => {
              const result = sectionHeadingSchema.safeParse(draft)
              if (result.success) setDraft(result.data)
            }}
          />
        </div>
        <button
          type="button"
          className="icon-button"
          title={t('Use default heading')}
          aria-label={t('Use default heading: {section}', { section: label })}
          disabled={!saved && !draft}
          onClick={() => {
            setDraft('')
            commit('')
          }}
        >
          <RotateCcw size={17} aria-hidden="true" />
        </button>
      </div>
      {!valid && (
        <p className="field-error" id={`${id}-error`} role="alert">
          {t('Use a single line of up to 80 characters.')}
        </p>
      )}
    </details>
  )
}
