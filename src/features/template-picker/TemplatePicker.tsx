import { Check } from 'lucide-react'
import { useId } from 'react'
import type { Appearance } from '../../domain/cv/types'
import type { TemplateOption } from '../../templates/types'

const accents = [
  { value: '#177568', label: 'Forest' },
  { value: '#3456a0', label: 'Cobalt' },
  { value: '#8c4255', label: 'Rose' },
  { value: '#292929', label: 'Ink' },
] as const

export function TemplatePicker({
  options,
  appearance,
  onChange,
}: {
  options: readonly TemplateOption[]
  appearance: Appearance
  onChange: (appearance: Appearance) => void
}) {
  const groupId = useId()
  return (
    <div className="design-settings">
      <fieldset className="plain-fieldset">
        <legend className="setting-label">
          Template <span>{String(options.length).padStart(2, '0')}</span>
        </legend>
        <div className="template-options">
          {options.map((template) => (
            <label
              className={`template-option ${appearance.templateId === template.id ? 'is-selected' : ''}`}
              key={template.id}
            >
              <input
                type="radio"
                className="sr-only"
                name={`${groupId}-template`}
                checked={appearance.templateId === template.id}
                onChange={() =>
                  onChange({ ...appearance, templateId: template.id })
                }
                value={template.id}
              />
              <span
                className={`template-miniature miniature-${template.typography}`}
                aria-hidden="true"
              >
                <span
                  className="miniature-heading"
                  style={{ color: appearance.accent }}
                >
                  Alex Morgan
                </span>
                <span className="miniature-subtitle">PRODUCT DESIGNER</span>
                <span
                  className="miniature-rule"
                  style={{ background: appearance.accent }}
                />
                <span className="miniature-lines" />
                <span className="miniature-lines short" />
                <span
                  className="miniature-rule"
                  style={{ background: appearance.accent }}
                />
                <span className="miniature-lines" />
                <span className="miniature-lines" />
                <span className="miniature-lines short" />
              </span>
              <span className="template-option-label">
                {template.name}
                <span className="selection-indicator">
                  {appearance.templateId === template.id && <Check size={12} />}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="plain-fieldset">
        <legend className="setting-label">Accent color</legend>
        <div className="color-options">
          {accents.map((accent) => (
            <label
              key={accent.value}
              className="color-option"
              title={accent.label}
            >
              <input
                className="sr-only"
                type="radio"
                name={`${groupId}-accent`}
                aria-label={accent.label}
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
        <legend className="setting-label">Text size</legend>
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
              <span>{['Small', 'Medium', 'Large'][index]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="form-field">
        <label htmlFor={`${groupId}-paper`}>Paper size</label>
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
          <option value="A4">A4 (210 x 297 mm)</option>
          <option value="LETTER">US Letter (8.5 x 11 in)</option>
        </select>
      </div>
    </div>
  )
}
