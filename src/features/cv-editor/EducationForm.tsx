import { Plus } from 'lucide-react'
import { Field, TextArea } from '../../components/ui/Field'
import { createEducation } from '../../domain/cv/defaults'
import type { Education } from '../../domain/cv/types'
import { EntryGroup } from './EntryGroup'
import { useTranslation } from '../../i18n/context'

export function EducationForm({
  entries,
  onChange,
}: {
  entries: Education[]
  onChange: (entries: Education[]) => void
}) {
  const { t } = useTranslation()
  function update(id: string, patch: Partial<Education>) {
    onChange(
      entries.map((entry) =>
        entry.id === id ? { ...entry, ...patch } : entry,
      ),
    )
  }
  return (
    <div className="entries">
      {entries.length === 0 && (
        <p className="empty-section">{t('Your education')}</p>
      )}
      {entries.map((entry, index) => (
        <EntryGroup
          key={entry.id}
          title="Qualification"
          index={index}
          onRemove={() =>
            onChange(entries.filter((item) => item.id !== entry.id))
          }
        >
          <Field
            className="full-width"
            label="Degree or qualification"
            value={entry.degree}
            onChange={(event) =>
              update(entry.id, { degree: event.target.value })
            }
            placeholder="BFA, Communication Design"
          />
          <Field
            className="full-width"
            label="School or university"
            value={entry.school}
            onChange={(event) =>
              update(entry.id, { school: event.target.value })
            }
          />
          <Field
            label="Start date"
            type="month"
            value={entry.startDate}
            onChange={(event) =>
              update(entry.id, { startDate: event.target.value })
            }
          />
          <Field
            label="End date"
            type="month"
            min={entry.startDate || undefined}
            value={entry.endDate}
            onChange={(event) =>
              update(entry.id, { endDate: event.target.value })
            }
          />
          <TextArea
            className="full-width"
            label="Additional details"
            rows={3}
            value={entry.description}
            onChange={(event) =>
              update(entry.id, { description: event.target.value })
            }
          />
        </EntryGroup>
      ))}
      <button
        type="button"
        className="add-button"
        disabled={entries.length >= 100}
        onClick={() =>
          onChange([...entries, createEducation(crypto.randomUUID())])
        }
      >
        <Plus size={17} />
        {t('Add education')}
      </button>
    </div>
  )
}
