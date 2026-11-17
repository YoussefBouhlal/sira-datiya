import { Pencil, RotateCcw } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ComponentProps } from 'react'
import { Field } from '../../components/ui/Field'
import { contactLabelSchema } from '../../domain/cv/schema'
import type { ContactLabelKey, CvData } from '../../domain/cv/types'
import { useTranslation } from '../../i18n/context'
import type { TemplateOption } from '../../templates/types'

export function ContactField({
  cv,
  onChange,
  template,
  field,
  ...props
}: Omit<
  ComponentProps<typeof Field>,
  'value' | 'onChange' | 'children' | 'labelAction'
> & {
  cv: CvData
  onChange: (cv: CvData) => void
  template: TemplateOption
  field: ContactLabelKey
}) {
  const { t } = useTranslation()
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const saved = cv.contactLabels?.[field] ?? ''
  const [draft, setDraft] = useState(saved)
  const [open, setOpen] = useState(false)
  const defaultLabel = template.contactLabels?.[field]
  const label = t(defaultLabel ?? props.label)
  const valid = contactLabelSchema.safeParse(draft).success
  useEffect(() => {
    if (document.activeElement !== input.current) setDraft(saved)
  }, [saved, template.id])
  function commit(value: string) {
    const result = contactLabelSchema.safeParse(value)
    if (!result.success) return
    const contactLabels = { ...cv.contactLabels }
    if (result.data) contactLabels[field] = result.data
    else delete contactLabels[field]
    onChange({
      ...cv,
      contactLabels: Object.keys(contactLabels).length
        ? contactLabels
        : undefined,
    })
  }
  return (
    <Field
      {...props}
      value={cv.personal[field]}
      onChange={(event) =>
        onChange({
          ...cv,
          personal: { ...cv.personal, [field]: event.target.value },
        })
      }
      labelAction={
        defaultLabel && (
          <button
            type="button"
            className="icon-button contact-label-toggle"
            title={t('Edit contact label: {label}', { label })}
            aria-label={t('Edit contact label: {label}', { label })}
            aria-expanded={open}
            aria-controls={open ? id : undefined}
            onClick={() => setOpen(!open)}
          >
            <Pencil size={14} aria-hidden="true" />
          </button>
        )
      }
    >
      {defaultLabel && open && (
        <div id={id} className="contact-label-editor">
          <div className="heading-input-row">
            <div className="form-field">
              <label htmlFor={`${id}-input`}>
                {t('Contact label: {label}', { label })}
              </label>
              <input
                ref={input}
                id={`${id}-input`}
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
                  const result = contactLabelSchema.safeParse(draft)
                  if (result.success) setDraft(result.data)
                }}
              />
            </div>
            <button
              type="button"
              className="icon-button"
              title={t('Use default contact label')}
              aria-label={t('Use default contact label: {label}', { label })}
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
        </div>
      )}
    </Field>
  )
}
