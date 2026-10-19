import { useId, type ComponentProps } from 'react'

export function Field({
  label,
  className = '',
  ...props
}: ComponentProps<'input'> & { label: string }) {
  const generatedId = useId()
  const id = props.id ?? generatedId
  return (
    <div className={`form-field ${className}`}>
      <label htmlFor={id}>{label}</label>
      <input {...props} id={id} maxLength={props.maxLength ?? 500} />
    </div>
  )
}

export function TextArea({
  label,
  className = '',
  ...props
}: ComponentProps<'textarea'> & { label: string }) {
  const generatedId = useId()
  const id = props.id ?? generatedId
  return (
    <div className={`form-field ${className}`}>
      <label htmlFor={id}>{label}</label>
      <textarea {...props} id={id} maxLength={props.maxLength ?? 20_000} />
    </div>
  )
}
