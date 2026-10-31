import { ArrowDown, ArrowUp, Plus } from 'lucide-react'
import { Field, TextArea } from '../../components/ui/Field'
import {
  createProject,
  createReference,
  createSkill,
  proficiencyLevels,
} from '../../domain/cv/defaults'
import type {
  Appearance,
  CvData,
  Project,
  SectionHeadingKey,
} from '../../domain/cv/types'
import {
  resolveSkillProficiencyDisplay,
  type TemplateOption,
} from '../../templates/types'
import { EntryGroup } from './EntryGroup'
import { useTranslation } from '../../i18n/context'
import { SectionHeadingField } from './SectionHeadingField'

export function ExtrasForm({
  cv,
  onChange,
  appearance,
  template,
  onAppearanceChange,
}: {
  cv: CvData
  onChange: (cv: CvData) => void
  appearance: Appearance
  template: TemplateOption
  onAppearanceChange: (appearance: Appearance) => void
}) {
  const { t, language } = useTranslation()
  const heading = (section: SectionHeadingKey) => (
    <SectionHeadingField
      key={`${template.id}-${language}-${section}`}
      cv={cv}
      onChange={onChange}
      template={template}
      section={section}
    />
  )
  const displayModes = template.skillProficiencyDisplay?.modes ?? ['text']
  const displayLabels = {
    bar: 'Bar only',
    text: 'Text only',
    both: 'Both',
  }
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
      <h2 className="subsection-title">{t('Skills')}</h2>
      {heading('skills')}
      {displayModes.length > 1 && (
        <div className="form-field">
          <label htmlFor="proficiency-display">
            {t('Proficiency display')}
          </label>
          <select
            id="proficiency-display"
            value={resolveSkillProficiencyDisplay(
              template,
              appearance.skillProficiencyDisplay,
            )}
            onChange={(event) => {
              const mode = template.skillProficiencyDisplay?.modes.find(
                (value) => value === event.target.value,
              )
              if (mode)
                onAppearanceChange({
                  ...appearance,
                  skillProficiencyDisplay: mode,
                })
            }}
          >
            {template.skillProficiencyDisplay?.modes.map((mode) => (
              <option key={mode} value={mode}>
                {t(displayLabels[mode])}
              </option>
            ))}
          </select>
        </div>
      )}
      {cv.skills.map((skill, index) => (
        <EntryGroup
          key={skill.id}
          title="Skill"
          index={index}
          onRemove={() =>
            onChange({
              ...cv,
              skills: cv.skills.filter((entry) => entry.id !== skill.id),
            })
          }
        >
          <Field
            label="Skill name"
            value={skill.name}
            onChange={(event) =>
              onChange({
                ...cv,
                skills: cv.skills.map((entry) =>
                  entry.id === skill.id
                    ? { ...entry, name: event.target.value }
                    : entry,
                ),
              })
            }
          />
          <div className="form-field">
            <label htmlFor={`level-${skill.id}`}>{t('Proficiency')}</label>
            <select
              id={`level-${skill.id}`}
              value={skill.level ?? ''}
              onChange={(event) =>
                onChange({
                  ...cv,
                  skills: cv.skills.map((entry) =>
                    entry.id === skill.id
                      ? {
                          ...entry,
                          level: event.target.value
                            ? Number(event.target.value)
                            : null,
                        }
                      : entry,
                  ),
                })
              }
            >
              <option value="">{t('Unrated')}</option>
              {proficiencyLevels.map((label, position) => (
                <option key={label} value={position + 1}>
                  {t(label)}
                </option>
              ))}
            </select>
          </div>
        </EntryGroup>
      ))}
      <button
        type="button"
        className="add-button"
        disabled={cv.skills.length >= 200}
        onClick={() =>
          onChange({
            ...cv,
            skills: [...cv.skills, createSkill(crypto.randomUUID())],
          })
        }
      >
        <Plus size={17} />
        {t('Add skill')}
      </button>
      {heading('additionalInformation')}
      {heading('languages')}
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
      {heading('certifications')}
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
      <h2 className="subsection-title">{t('Projects')}</h2>
      {heading('projects')}
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
        {t('Add project')}
      </button>
      <h2 className="subsection-title">{t('References')}</h2>
      {heading('references')}
      {cv.references.map((reference, index) => (
        <EntryGroup
          key={reference.id}
          title="Reference"
          index={index}
          onRemove={() =>
            onChange({
              ...cv,
              references: cv.references.filter(
                (entry) => entry.id !== reference.id,
              ),
            })
          }
        >
          {(
            ['name', 'jobTitle', 'organization', 'email', 'phone'] as const
          ).map((field) => (
            <Field
              key={field}
              label={
                {
                  name: 'Reference name',
                  jobTitle: 'Reference job title',
                  organization: 'Reference organization',
                  email: 'Reference email',
                  phone: 'Reference phone',
                }[field]
              }
              className={field === 'name' ? 'full-width' : ''}
              type={
                field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'
              }
              value={reference[field]}
              onChange={(event) =>
                onChange({
                  ...cv,
                  references: cv.references.map((entry) =>
                    entry.id === reference.id
                      ? { ...entry, [field]: event.target.value }
                      : entry,
                  ),
                })
              }
            />
          ))}
          <div className="entry-order full-width">
            {([-1, 1] as const).map((direction) => (
              <button
                key={direction}
                type="button"
                className="icon-button"
                title={t(
                  direction === -1
                    ? 'Move reference up'
                    : 'Move reference down',
                )}
                aria-label={t(
                  direction === -1
                    ? 'Move reference {count} up'
                    : 'Move reference {count} down',
                  { count: index + 1 },
                )}
                disabled={
                  index + direction < 0 ||
                  index + direction >= cv.references.length
                }
                onClick={() => {
                  const references = [...cv.references]
                  const target = index + direction
                  const neighbor = references[target]
                  if (!neighbor) return
                  references[index] = neighbor
                  references[target] = reference
                  onChange({ ...cv, references })
                }}
              >
                {direction === -1 ? (
                  <ArrowUp size={16} />
                ) : (
                  <ArrowDown size={16} />
                )}
              </button>
            ))}
          </div>
        </EntryGroup>
      ))}
      <button
        type="button"
        className="add-button"
        disabled={cv.references.length >= 100}
        onClick={() =>
          onChange({
            ...cv,
            references: [
              ...cv.references,
              createReference(crypto.randomUUID()),
            ],
          })
        }
      >
        <Plus size={17} />
        {t('Add reference')}
      </button>
    </div>
  )
}
