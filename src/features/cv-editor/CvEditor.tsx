import { Field, TextArea } from '../../components/ui/Field'
import type { CvData } from '../../domain/cv/types'
import { EducationForm } from './EducationForm'
import { ExperienceForm } from './ExperienceForm'
import { ExtrasForm } from './ExtrasForm'
import { PortraitField } from './PortraitField'
import type { EditorStep } from './steps'
import { useTranslation } from '../../i18n/context'

export function CvEditor({
  cv,
  step,
  onChange,
}: {
  cv: CvData
  step: Exclude<EditorStep, 'design'>
  onChange: (cv: CvData) => void
}) {
  const { t, language } = useTranslation()
  if (step === 'experience')
    return (
      <ExperienceForm
        entries={cv.experience}
        onChange={(experience) => onChange({ ...cv, experience })}
      />
    )
  if (step === 'education')
    return (
      <EducationForm
        entries={cv.education}
        onChange={(education) => onChange({ ...cv, education })}
      />
    )
  if (step === 'skills') return <ExtrasForm cv={cv} onChange={onChange} />
  if (step === 'summary')
    return (
      <div className="summary-form">
        <TextArea
          label="Professional summary"
          rows={12}
          value={cv.summary}
          onChange={(event) => onChange({ ...cv, summary: event.target.value })}
          placeholder="Product designer turning complex problems into thoughtful, useful digital experiences..."
        />
        <span className="character-count">
          {t('{count} characters', {
            count: cv.summary.length.toLocaleString(`${language}-u-nu-latn`),
          })}
        </span>
      </div>
    )
  const update = (field: keyof CvData['personal'], value: string) =>
    onChange({ ...cv, personal: { ...cv.personal, [field]: value } })
  return (
    <div className="field-grid">
      <Field
        label="Full name"
        autoComplete="name"
        placeholder="Alex Morgan"
        value={cv.personal.fullName}
        onChange={(event) => update('fullName', event.target.value)}
      />
      <PortraitField
        value={cv.personal.portrait}
        onChange={(value) => update('portrait', value)}
      />
      <Field
        className="full-width"
        label="Professional title"
        autoComplete="organization-title"
        placeholder="Product Designer"
        value={cv.personal.jobTitle}
        onChange={(event) => update('jobTitle', event.target.value)}
      />
      <Field
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="alex@example.com"
        value={cv.personal.email}
        onChange={(event) => update('email', event.target.value)}
      />
      <Field
        label="Phone number"
        type="tel"
        autoComplete="tel"
        placeholder="+1 415 555 0142"
        value={cv.personal.phone}
        onChange={(event) => update('phone', event.target.value)}
      />
      <Field
        className="full-width"
        label="Location"
        autoComplete="address-level2"
        placeholder="San Francisco, CA"
        value={cv.personal.location}
        onChange={(event) => update('location', event.target.value)}
      />
      <div className="form-divider full-width">
        <span>{t('ON THE WEB')}</span>
      </div>
      <Field
        className="full-width"
        label="Website or portfolio"
        autoComplete="url"
        placeholder="alexmorgan.example"
        value={cv.personal.website}
        onChange={(event) => update('website', event.target.value)}
      />
      <Field
        className="full-width"
        label="LinkedIn"
        placeholder="linkedin.com/in/alex-example"
        value={cv.personal.linkedin}
        onChange={(event) => update('linkedin', event.target.value)}
      />
    </div>
  )
}
