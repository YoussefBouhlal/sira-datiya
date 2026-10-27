import type { ReactNode } from 'react'
import { Trash2 } from 'lucide-react'
import { useTranslation } from '../../i18n/context'

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
  const { t } = useTranslation()
  return (
    <fieldset className="entry-group">
      <legend>
        {t(title)} <span>{String(index + 1).padStart(2, '0')}</span>
      </legend>
      <button
        type="button"
        className="icon-button remove-entry"
        aria-label={t('Remove {title} {count}', {
          title: t(title).toLowerCase(),
          count: index + 1,
        })}
        title={t('Remove {title}', { title: t(title).toLowerCase() })}
        onClick={onRemove}
      >
        <Trash2 size={16} />
      </button>
      <div className="field-grid">{children}</div>
    </fieldset>
  )
}
