import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string
  children: ReactNode
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const bodyId = useId()
  useEffect(() => {
    ref.current?.showModal()
  }, [])
  return (
    <dialog
      className="confirm-dialog"
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      onCancel={onCancel}
    >
      <button
        type="button"
        className="icon-button dialog-close"
        aria-label="Close dialog"
        onClick={onCancel}
      >
        <X size={18} />
      </button>
      <h2 id={titleId}>{title}</h2>
      <div id={bodyId}>{children}</div>
      <div className="dialog-actions">
        <button
          type="button"
          className="button button-secondary"
          autoFocus
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="button button-primary"
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
