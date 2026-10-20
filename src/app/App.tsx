import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  Eye,
  FileText,
  LoaderCircle,
  LockKeyhole,
  PencilLine,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { createExampleCv } from '../domain/cv/example'
import type { CvDocument } from '../domain/cv/types'
import {
  CvEditor,
  StepNavigation,
  editorSteps,
  type EditorStep,
} from '../features/cv-editor'
import { TemplatePicker } from '../features/template-picker'
import { templateRegistry } from '../templates/registry'
import { DocumentActions } from './DocumentActions'
import { useCvDocument } from './use-cv-document'

const PdfWorkspace = lazy(() => import('../features/pdf-export'))
type Confirmation =
  { kind: 'example' | 'reset' } | { kind: 'restore'; document: CvDocument }

export default function App() {
  const { document, update, replace, reset, saveStatus, message, blocked } =
    useCvDocument()
  const [step, setStep] = useState<EditorStep>('personal')
  const [view, setView] = useState<'edit' | 'preview'>('edit')
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const stepIndex = editorSteps.findIndex((item) => item.id === step)
  const currentStep = editorSteps[stepIndex]!
  const template = templateRegistry.resolve(document.appearance.templateId)
  const hasContent =
    Object.values(document.cv.personal).some(Boolean) ||
    document.cv.summary ||
    document.cv.experience.length ||
    document.cv.education.length ||
    document.cv.skills.length ||
    document.cv.languages.length ||
    document.cv.certifications.length ||
    document.cv.projects.length ||
    document.cv.references.length

  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
  }, [step])

  function chooseStep(next: EditorStep) {
    setStep(next)
    setView('edit')
  }

  function loadExample() {
    replace({ ...document, cv: createExampleCv() })
    chooseStep('personal')
  }

  function confirmAction() {
    if (confirmation?.kind === 'reset') {
      if (reset()) chooseStep('personal')
    } else if (confirmation?.kind === 'example') {
      loadExample()
    } else if (confirmation?.kind === 'restore') {
      replace(confirmation.document)
      chooseStep('personal')
    }
    setConfirmation(null)
  }

  return (
    <div className={`app-shell view-${view}`}>
      <a className="skip-link" href="#editor-heading">
        Skip to editor
      </a>
      <header className="app-header">
        <a className="brand" href="./" aria-label="Sira Datiya home">
          <span className="brand-symbol">
            <FileText size={21} strokeWidth={1.7} />
          </span>
          Sira Datiya
        </a>
        <div className="document-path">
          <span>Workspace</span>
          <span className="path-slash">/</span>
          <span className="document-name">
            {document.cv.personal.fullName
              ? `${document.cv.personal.fullName}'s CV`
              : 'Untitled CV'}
          </span>
        </div>
        <div className="header-actions">
          <span
            className={`save-status ${saveStatus === 'error' ? 'has-error' : ''}`}
            role="status"
          >
            {saveStatus === 'saved' ? (
              <Check size={14} />
            ) : saveStatus === 'saving' ? (
              <LoaderCircle size={14} className="spin" />
            ) : (
              <CircleHelp size={14} />
            )}
            <span>
              {saveStatus === 'saved'
                ? 'Saved on this device'
                : saveStatus === 'saving'
                  ? 'Saving...'
                  : 'Not saved'}
            </span>
          </span>
          <button
            type="button"
            className="button button-quiet example-button"
            onClick={() => {
              if (hasContent || blocked) setConfirmation({ kind: 'example' })
              else loadExample()
            }}
          >
            <Sparkles size={15} />
            Load example
          </button>
          <DocumentActions
            document={document}
            onRestore={(next) =>
              setConfirmation({ kind: 'restore', document: next })
            }
            onReset={() => setConfirmation({ kind: 'reset' })}
          />
        </div>
      </header>
      <aside className="sidebar">
        <div className="sidebar-top">
          <span className="workspace-icon">
            <PencilLine size={16} />
          </span>
          <span>CV builder</span>
          <span className="draft-badge">DRAFT</span>
        </div>
        <StepNavigation step={step} cv={document.cv} onSelect={chooseStep} />
        <div className="sidebar-footer">
          <ShieldCheck size={21} strokeWidth={1.5} aria-hidden="true" />
          <strong>Just you and your next chapter.</strong>
          <button
            type="button"
            className="privacy-button"
            onClick={() => setShowPrivacy(true)}
          >
            Your data stays here <ArrowRight size={13} />
          </button>
          <div className="sidebar-footer-bottom">
            <span>SIRA DATIYA / CV BUILDER</span>
            <span className="tiny-dot" />
          </div>
        </div>
      </aside>
      <main className="workspace">
        {message && (
          <div className="storage-warning" role="alert">
            <LockKeyhole size={17} />
            <span>{message}</span>
          </div>
        )}
        <div className="workspace-heading">
          <div>
            <span className="eyebrow">
              A LITTLE ABOUT YOU, A LOT OF POSSIBILITY
            </span>
            <p>Your story. Well presented.</p>
          </div>
          <span className="document-tag">
            <FileText size={14} />
            YOUR CV
          </span>
        </div>
        <div
          className="mobile-view-switch"
          role="group"
          aria-label="Workspace view"
        >
          <button
            type="button"
            aria-pressed={view === 'edit'}
            onClick={() => setView('edit')}
          >
            <PencilLine size={15} />
            Edit
          </button>
          <button
            type="button"
            aria-pressed={view === 'preview'}
            onClick={() => setView('preview')}
          >
            <Eye size={15} />
            Preview
          </button>
        </div>
        <div className="builder-grid">
          <section className="editor-pane" aria-labelledby="editor-heading">
            <div className="section-heading">
              <span className="section-number">
                SECTION {String(stepIndex + 1).padStart(2, '0')}{' '}
                <span>/ 06</span>
              </span>
              <h1 id="editor-heading" ref={heading} tabIndex={-1}>
                {currentStep.label}
              </h1>
              <span className="section-rule" />
            </div>
            <div className="editor-content" key={step}>
              {step === 'design' ? (
                <TemplatePicker
                  options={templateRegistry.templates}
                  appearance={document.appearance}
                  onChange={(appearance) => update({ ...document, appearance })}
                />
              ) : (
                <CvEditor
                  step={step}
                  cv={document.cv}
                  onChange={(cv) => update({ ...document, cv })}
                />
              )}
            </div>
            <footer className="editor-footer">
              <button
                type="button"
                className="button button-back"
                disabled={stepIndex === 0}
                onClick={() => {
                  const previous = editorSteps[stepIndex - 1]
                  if (previous) chooseStep(previous.id)
                }}
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <span className="step-counter">
                {stepIndex + 1} <span>/ {editorSteps.length}</span>
              </span>
              {stepIndex < editorSteps.length - 1 ? (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => {
                    const next = editorSteps[stepIndex + 1]
                    if (next) chooseStep(next.id)
                  }}
                >
                  Continue
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => setView('preview')}
                >
                  <Eye size={16} />
                  Review CV
                </button>
              )}
            </footer>
            <p className="editor-footnote">
              <LockKeyhole size={12} />
              Private by default. Saved in your browser.
            </p>
          </section>
          <section className="preview-pane" aria-label="Document preview">
            <Suspense
              fallback={
                <div className="preview-placeholder">
                  <LoaderCircle className="spin" size={24} />
                  <span>Loading preview...</span>
                </div>
              }
            >
              <PdfWorkspace
                cv={document.cv}
                appearance={document.appearance}
                template={template}
                options={templateRegistry.templates}
                onTemplateChange={(templateId) =>
                  update({
                    ...document,
                    appearance: { ...document.appearance, templateId },
                  })
                }
              />
            </Suspense>
          </section>
        </div>
      </main>
      {confirmation && (
        <ConfirmDialog
          title={
            confirmation.kind === 'reset'
              ? 'Start with a blank page?'
              : confirmation.kind === 'example'
                ? 'Load the example CV?'
                : 'Restore this backup?'
          }
          confirmLabel={
            confirmation.kind === 'reset'
              ? 'Start over'
              : confirmation.kind === 'example'
                ? 'Use example'
                : 'Restore backup'
          }
          onCancel={() => setConfirmation(null)}
          onConfirm={confirmAction}
        >
          <p>
            This will replace your current CV on this device. Download a JSON
            backup first to keep a copy.
          </p>
        </ConfirmDialog>
      )}
      {showPrivacy && (
        <ConfirmDialog
          title="Only on this device"
          confirmLabel="Got it"
          onCancel={() => setShowPrivacy(false)}
          onConfirm={() => setShowPrivacy(false)}
        >
          <p>
            Your CV is saved in this browser, not uploaded to a server. There
            are no accounts, analytics, or remote font requests.
          </p>
          <p>
            Browser storage is not encrypted. Clearing site data or using
            private browsing can remove your CV. Download a JSON backup to keep
            a copy.
          </p>
        </ConfirmDialog>
      )}
    </div>
  )
}
