import type { ReactNode } from 'react'
import { Trash2 } from 'lucide-react'

export function EntryGroup({
  title,
  index,
  onRemove,
  children,
}: {
  title: string
  index: number
  onRemove: () => void
  children: ReactNode
}) {
  return (
    <fieldset className="entry-group">
      <legend>
        {title} <span>{String(index + 1).padStart(2, '0')}</span>
      </legend>
      <button
        type="button"
        className="icon-button remove-entry"
        aria-label={`Remove ${title.toLowerCase()} ${index + 1}`}
        title={`Remove ${title.toLowerCase()}`}
        onClick={onRemove}
      >
        <Trash2 size={16} />
      </button>
      <div className="field-grid">{children}</div>
    </fieldset>
  )
}
