import { ArrowUpRight, Check, CheckCheck } from 'lucide-react'
import type { CvData } from '../../domain/cv/types'
import { editorSteps, type EditorStep } from './steps'

export function StepNavigation({
  step,
  cv,
  onSelect,
}: {
  step: EditorStep
  cv: CvData
  onSelect: (step: EditorStep) => void
}) {
  const completed = [
    Boolean(cv.personal.fullName.trim() && cv.personal.jobTitle.trim()),
    Boolean(cv.summary.trim()),
    cv.experience.some((entry) => entry.role.trim() && entry.employer.trim()),
    cv.education.some((entry) => entry.degree.trim() && entry.school.trim()),
    cv.skills.some((skill) => skill.trim()),
  ]
  const count = completed.filter(Boolean).length
  return (
    <>
      <div className="sidebar-section-label">
        YOUR DOCUMENT <span>{count}/5</span>
      </div>
      <nav aria-label="CV sections">
        <ol className="step-list">
          {editorSteps.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                className={`step-button ${step === item.id ? 'is-active' : ''}`}
                aria-current={step === item.id ? 'step' : undefined}
                onClick={() => onSelect(item.id)}
              >
                <span
                  className={`step-number ${completed[index] ? 'is-complete' : ''}`}
                >
                  {completed[index] ? (
                    <Check size={13} aria-label="Filled in" />
                  ) : (
                    String(index + 1).padStart(2, '0')
                  )}
                </span>
                <span>{item.shortLabel}</span>
                {step === item.id && (
                  <ArrowUpRight
                    size={15}
                    className="step-arrow"
                    aria-hidden="true"
                  />
                )}
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <div className="completion">
        <CheckCheck size={15} aria-hidden="true" />
        <span>
          {count === 5
            ? 'All sections filled in'
            : `${count} of 5 sections filled in`}
        </span>
      </div>
    </>
  )
}
