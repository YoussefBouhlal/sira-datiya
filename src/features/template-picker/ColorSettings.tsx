import { RotateCcw } from 'lucide-react'
import { useId, useState } from 'react'
import type { Appearance } from '../../domain/cv/types'
import {
  contrastRatio,
  effectiveColors,
  surfaceForeground,
  type ColorRole,
} from '../../domain/cv/colors'
import type { TemplateOption } from '../../templates/types'
import { useTranslation } from '../../i18n/context'

const roles = [
  { role: 'headings', label: 'Headings' },
  { role: 'details', label: 'Subtitles & details' },
  { role: 'body', label: 'Body text' },
  { role: 'accent', label: 'Accent' },
  { role: 'surface', label: 'Surface' },
] as const

function ColorField({
  role,
  label,
  value,
  warning,
  pageSurface = false,
  onChange,
}: {
  role: ColorRole
  label: string
  value: string
  warning: boolean
  pageSurface?: boolean
  onChange: (color: string) => void
}) {
  const { t } = useTranslation()
  const id = useId()
  const [input, setInput] = useState({ source: value, text: value })
  if (input.source !== value) setInput({ source: value, text: value })
  const draft = input.source === value ? input.text : value
  const invalid = !/^#[0-9a-fA-F]{6}$/.test(draft)
  return (
    <div className="color-field">
      <label htmlFor={`${id}-hex`}>{t(label)}</label>
      <div className="color-inputs">
        <input
          type="color"
          aria-label={t('{role} color picker', { role: t(label) })}
          value={value}
          onChange={(event) => {
            setInput({ source: event.target.value, text: event.target.value })
            onChange(event.target.value)
          }}
        />
        <input
          id={`${id}-hex`}
          type="text"
          dir="ltr"
          spellCheck={false}
          autoComplete="off"
          maxLength={7}
          value={draft}
          aria-invalid={invalid}
          aria-describedby={invalid || warning ? `${id}-message` : undefined}
          onChange={(event) => {
            const color = event.target.value
            const valid = /^#[0-9a-fA-F]{6}$/.test(color)
            setInput({
              source: valid ? color.toLowerCase() : value,
              text: color,
            })
            if (valid) onChange(color.toLowerCase())
          }}
        />
      </div>
      {(invalid || warning) && (
        <p id={`${id}-message`} className="color-warning" role="status">
          {t(
            invalid
              ? 'Enter a six-digit hex color, such as #177568.'
              : pageSurface
                ? 'Low contrast on the page background.'
                : role === 'surface'
                  ? 'Low contrast between headings and the section background.'
                  : 'Low contrast on white paper.',
          )}
        </p>
      )}
    </div>
  )
}

export function ColorSettings({
  appearance,
  template,
  onChange,
}: {
  appearance: Appearance
  template: TemplateOption
  onChange: (appearance: Appearance) => void
}) {
  const { t } = useTranslation()
  const colors = effectiveColors(appearance, template.colorDefaults)
  const pageSurface = template.colorDefaults?.surface === 'page'
  const [revision, setRevision] = useState(0)
  const bandWarning =
    template.colorDefaults?.surface === 'band' &&
    contrastRatio(
      template.colorDefaults.surfaceForeground === 'contrast'
        ? (appearance.colors?.headings ?? surfaceForeground(colors.surface))
        : colors.headings,
      colors.surface,
    ) < 4.5
  return (
    <fieldset className="plain-fieldset color-settings">
      <legend className="setting-label">{t('Colors')}</legend>
      <div className="color-fields">
        {roles
          .filter(
            ({ role }) => role !== 'surface' || template.colorDefaults?.surface,
          )
          .map(({ role, label }) => (
            <ColorField
              key={`${template.id}-${role}-${revision}`}
              role={role}
              label={label}
              value={colors[role]}
              pageSurface={pageSurface}
              warning={
                role === 'surface'
                  ? bandWarning ||
                    (pageSurface &&
                      [colors.headings, colors.details, colors.body].some(
                        (color) => contrastRatio(color, colors.surface) < 4.5,
                      ))
                  : ['headings', 'details', 'body'].includes(role) &&
                    contrastRatio(
                      colors[role],
                      pageSurface ? colors.surface : '#ffffff',
                    ) < 4.5
              }
              onChange={(color) =>
                onChange({
                  ...appearance,
                  colors: { ...appearance.colors, [role]: color },
                })
              }
            />
          ))}
      </div>
      <button
        type="button"
        className="button button-quiet"
        onClick={() => {
          setRevision(revision + 1)
          const { colors: previousColors, ...original } = appearance
          void previousColors
          onChange(original)
        }}
      >
        <RotateCcw size={15} />
        {t('Reset colors')}
      </button>
    </fieldset>
  )
}
