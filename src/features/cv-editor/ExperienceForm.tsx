import { Plus } from 'lucide-react'
import { Field, TextArea } from '../../components/ui/Field'
import { createExperience } from '../../domain/cv/defaults'
import type { Experience } from '../../domain/cv/types'
import { EntryGroup } from './EntryGroup'
import { useTranslation } from '../../i18n/context'

export function ExperienceForm({
  entries,
  onChange,
}: {
  entries: Experience[]
  onChange: (entries: Experience[]) => void
}) {
  const { t } = useTranslation()
  function update(id: string, patch: Partial<Experience>) {
    onChange(
      entries.map((entry) =>
        entry.id === id ? { ...entry, ...patch } : entry,
      ),
    )
  }
  return (
    <div className="entries">
      {entries.length === 0 && (
        <p className="empty-section">{t('Your work experience')}</p>
      )}
      {entries.map((entry, index) => (
        <EntryGroup
          key={entry.id}
          title="Position"
          index={index}
          onRemove={() =>
            onChange(entries.filter((item) => item.id !== entry.id))
          }
        >
          <Field
            className="full-width"
            label="Job title"
            value={entry.role}
            onChange={(event) => update(entry.id, { role: event.target.value })}
            placeholder="Senior Product Designer"
          />
          <Field
            label="Company"
            value={entry.employer}
            onChange={(event) =>
              update(entry.id, { employer: event.target.value })
            }
          />
          <Field
            label="Location"
            value={entry.location}
            onChange={(event) =>
              update(entry.id, { location: event.target.value })
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
            value={entry.endDate}
            disabled={entry.current}
            min={entry.startDate || undefined}
            onChange={(event) =>
              update(entry.id, { endDate: event.target.value })
            }
          />
          <label className="checkbox-label full-width">
            <input
              type="checkbox"
              checked={entry.current}
              onChange={(event) =>
                update(entry.id, { current: event.target.checked })
              }
            />
            {t('I currently work here')}
          </label>
          <TextArea
            className="full-width"
            label="Highlights"
            rows={5}
            value={entry.description}
            onChange={(event) =>
              update(entry.id, { description: event.target.value })
            }
            placeholder="Led the redesign of a product used by 20,000 teams."
          />
        </EntryGroup>
      ))}
      <button
        type="button"
        className="add-button"
        disabled={entries.length >= 100}
        onClick={() =>
          onChange([...entries, createExperience(crypto.randomUUID())])
        }
      >
        <Plus size={17} />
        {t('Add position')}
      </button>
    </div>
  )
}
