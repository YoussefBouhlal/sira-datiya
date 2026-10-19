import { Plus } from 'lucide-react'
import { Field, TextArea } from '../../components/ui/Field'
import { createProject } from '../../domain/cv/defaults'
import type { CvData, Project } from '../../domain/cv/types'
import { EntryGroup } from './EntryGroup'

export function ExtrasForm({
  cv,
  onChange,
}: {
  cv: CvData
  onChange: (cv: CvData) => void
}) {
  function updateProject(id: string, patch: Partial<Project>) {
    onChange({
      ...cv,
      projects: cv.projects.map((entry) =>
        entry.id === id ? { ...entry, ...patch } : entry,
      ),
    })
  }
  return (
    <div className="extras-form">
      <TextArea
        label="Skills"
        rows={5}
        value={cv.skills.join('\n')}
        maxLength={10_000}
        onChange={(event) =>
          onChange({
            ...cv,
            skills: event.target.value.split('\n').slice(0, 200),
          })
        }
        placeholder={'Product strategy\nUser research\nInteraction design'}
      />
      <TextArea
        label="Languages"
        rows={3}
        value={cv.languages.join('\n')}
        maxLength={5_000}
        onChange={(event) =>
          onChange({
            ...cv,
            languages: event.target.value.split('\n').slice(0, 100),
          })
        }
        placeholder={'English (native)\nFrench (conversational)'}
      />
      <TextArea
        label="Certifications"
        rows={3}
        value={cv.certifications.join('\n')}
        maxLength={5_000}
        onChange={(event) =>
          onChange({
            ...cv,
            certifications: event.target.value.split('\n').slice(0, 100),
          })
        }
      />
      <h2 className="subsection-title">Projects</h2>
      {cv.projects.map((entry, index) => (
        <EntryGroup
          key={entry.id}
          title="Project"
          index={index}
          onRemove={() =>
            onChange({
              ...cv,
              projects: cv.projects.filter((item) => item.id !== entry.id),
            })
          }
        >
          <Field
            className="full-width"
            label="Project name"
            value={entry.name}
            onChange={(event) =>
              updateProject(entry.id, { name: event.target.value })
            }
          />
          <Field
            className="full-width"
            label="Project URL"
            value={entry.url}
            onChange={(event) =>
              updateProject(entry.id, { url: event.target.value })
            }
          />
          <TextArea
            className="full-width"
            label="Project details"
            rows={3}
            value={entry.description}
            onChange={(event) =>
              updateProject(entry.id, { description: event.target.value })
            }
          />
        </EntryGroup>
      ))}
      <button
        type="button"
        className="add-button"
        disabled={cv.projects.length >= 100}
        onClick={() =>
          onChange({
            ...cv,
            projects: [...cv.projects, createProject(crypto.randomUUID())],
          })
        }
      >
        <Plus size={17} />
        Add project
      </button>
    </div>
  )
}
