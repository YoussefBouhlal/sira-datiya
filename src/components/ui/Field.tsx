import { useId, type ComponentProps, type ReactNode } from 'react'
import { useTranslation } from '../../i18n/context'

export function Field({
  label,
  className = '',
  labelAction,
  children,
  ...props
}: ComponentProps<'input'> & {
  label: string
  labelAction?: ReactNode
  children?: ReactNode
}) {
  const generatedId = useId()
  const { t } = useTranslation()
  const id = props.id ?? generatedId
  return (
    <div className={`form-field ${className}`}>
      {labelAction ? (
        <div className="field-label-row">
          <label htmlFor={id}>{t(label)}</label>
          {labelAction}
        </div>
      ) : (
        <label htmlFor={id}>{t(label)}</label>
      )}
      <input
        dir={
          ['email', 'tel', 'url', 'month'].includes(props.type ?? '')
            ? 'ltr'
            : 'auto'
        }
        {...props}
        placeholder={props.placeholder ? t(props.placeholder) : undefined}
        id={id}
        maxLength={props.maxLength ?? 500}
      />
      {children}
    </div>
  )
}

export function TextArea({
  label,
  className = '',
  ...props
}: ComponentProps<'textarea'> & { label: string }) {
  const generatedId = useId()
  const { t } = useTranslation()
  const id = props.id ?? generatedId
  return (
    <div className={`form-field ${className}`}>
      <label htmlFor={id}>{t(label)}</label>
      <textarea
        dir="auto"
        {...props}
        placeholder={props.placeholder ? t(props.placeholder) : undefined}
        id={id}
        maxLength={props.maxLength ?? 20_000}
      />
    </div>
  )
}
