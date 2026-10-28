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
import type { CvData, CvDocument } from '../domain/cv/types'
import {
  CvEditor,
  StepNavigation,
  editorSteps,
  type EditorStep,
} from '../features/cv-editor'
import { TemplatePicker, TemplateStart } from '../features/template-picker'
import { templateRegistry } from '../templates/registry'
import type { TemplateOption } from '../templates/types'
import { DocumentActions } from './DocumentActions'
import { useCvDocument } from './use-cv-document'
import { LanguageProvider } from '../i18n/react'
import { translate, type Language } from '../i18n/messages'

const PdfWorkspace = lazy(() => import('../features/pdf-export'))
const TemplateThumbnail = lazy(() =>
  import('../features/pdf-export').then((module) => ({
    default: module.TemplateThumbnail,
  })),
)
type Confirmation =
  { kind: 'example' | 'reset' } | { kind: 'restore'; document: CvDocument }

function hasCvContent(cv: CvData) {
  return Boolean(
    Object.values(cv.personal).some(Boolean) ||
    cv.summary ||
    cv.experience.length ||
    cv.education.length ||
    cv.skills.length ||
    cv.languages.length ||
    cv.certifications.length ||
    cv.projects.length ||
    cv.references.length,
  )
}

export default function App() {
  const {
    document,
    update,
    replace,
    reset,
    saveStatus,
    message,
    blocked,
    choosingLanguage,
    chooseLanguage,
  } = useCvDocument()
  const language = document.appearance.language
  const t = (text: string) => translate(language, text)
  const templateSample = createExampleCv(language)
  useEffect(() => {
    window.document.documentElement.lang = language
    window.document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    window.document.title = `Sira Datiya | ${translate(language, 'SIRA DATIYA / CV BUILDER')}`
  }, [language])
  const [step, setStep] = useState<EditorStep>('personal')
  const [view, setView] = useState<'edit' | 'preview'>('edit')
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const stepIndex = editorSteps.findIndex((item) => item.id === step)
  const currentStep = editorSteps[stepIndex]!
  const template = templateRegistry.resolve(document.appearance.templateId)
  const hasContent = hasCvContent(document.cv)
  const [choosingTemplate, setChoosingTemplate] = useState(
    !hasContent && !blocked,
  )

  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
  }, [step, choosingTemplate, choosingLanguage])

  function chooseStep(next: EditorStep) {
    setChoosingTemplate(false)
    setStep(next)
    setView('edit')
  }

  function loadExample() {
    replace({ ...document, cv: createExampleCv(language) })
    chooseStep('personal')
  }

  function confirmAction() {
    if (confirmation?.kind === 'reset') {
      if (reset()) {
        chooseStep('personal')
        setChoosingTemplate(true)
      }
    } else if (confirmation?.kind === 'example') {
      loadExample()
    } else if (confirmation?.kind === 'restore') {
      replace(confirmation.document)
      chooseStep('personal')
      setChoosingTemplate(!hasCvContent(confirmation.document.cv))
    }
    setConfirmation(null)
  }

  function renderThumbnail(option: TemplateOption) {
    return (
      <Suspense
        fallback={
          <span className="thumbnail-placeholder">
            <LoaderCircle size={18} className="spin" />
          </span>
        }
      >
        <TemplateThumbnail template={templateRegistry.resolve(option.id)} />
      </Suspense>
    )
  }

  function renderTemplatePreview(option: TemplateOption) {
    return (
      <Suspense
        fallback={
          <div className="preview-placeholder">
            <LoaderCircle size={24} className="spin" />
          </div>
        }
      >
        <PdfWorkspace
          cv={choosingTemplate ? templateSample : document.cv}
          appearance={document.appearance}
          template={templateRegistry.resolve(option.id)}
          downloadable={false}
        />
      </Suspense>
    )
  }

  return (
    <LanguageProvider language={language}>
      <div
        className={`app-shell view-${view}${choosingTemplate ? ' is-choosing-template' : ''}`}
      >
        <a className="skip-link" href="#editor-heading">
          {t(
            choosingLanguage
              ? 'Skip to languages'
              : choosingTemplate
                ? 'Skip to templates'
                : 'Skip to editor',
          )}
        </a>
        <header className="app-header">
          <a className="brand" href="./" aria-label={t('Sira Datiya home')}>
            <span className="brand-symbol">
              <FileText size={21} strokeWidth={1.7} />
            </span>
            Sira Datiya
          </a>
          <div className="header-actions">
            <label className="language-control">
              <span className="sr-only">{t('Language')}</span>
              <select
                value={language}
                onChange={(event) =>
                  update({
                    ...document,
                    appearance: {
                      ...document.appearance,
                      language: event.target.value as Language,
                    },
                  })
                }
              >
                <option value="en" lang="en">
                  English
                </option>
                <option value="fr" lang="fr">
                  Français
                </option>
                <option value="ar" lang="ar">
                  العربية
                </option>
              </select>
            </label>
            <span
              className={`save-status ${saveStatus === 'error' ? 'has-error' : ''}`}
              role="status"
            >
              {choosingLanguage ? (
                <CircleHelp size={14} />
              ) : saveStatus === 'saved' ? (
                <Check size={14} />
              ) : saveStatus === 'saving' ? (
                <LoaderCircle size={14} className="spin" />
              ) : (
                <CircleHelp size={14} />
              )}
              <span>
                {t(
                  choosingLanguage
                    ? 'Not saved'
                    : saveStatus === 'saved'
                      ? 'Saved on this device'
                      : saveStatus === 'saving'
                        ? 'Saving...'
                        : 'Not saved',
                )}
              </span>
            </span>
            <button
              type="button"
              className="button button-quiet example-button"
              aria-label={t('Load example')}
              title={t('Load example')}
              onClick={() => {
                if (hasContent || blocked) setConfirmation({ kind: 'example' })
                else loadExample()
              }}
            >
              <Sparkles size={15} />
              <span className="example-label">{t('Load example')}</span>
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
        {!choosingTemplate && (
          <aside className="sidebar">
            <StepNavigation
              step={step}
              cv={document.cv}
              onSelect={chooseStep}
            />
            <div className="sidebar-footer">
              <ShieldCheck size={21} strokeWidth={1.5} aria-hidden="true" />
              <strong>{t('Just you and your next chapter.')}</strong>
              <button
                type="button"
                className="privacy-button"
                onClick={() => setShowPrivacy(true)}
              >
                {t('Your data stays here')} <ArrowRight size={13} />
              </button>
              <div className="sidebar-footer-bottom">
                <span>{t('SIRA DATIYA / CV BUILDER')}</span>
                <span className="tiny-dot" />
              </div>
            </div>
          </aside>
        )}
        <main className="workspace">
          {message && (
            <div className="storage-warning" role="alert">
              <LockKeyhole size={17} />
              <span>{t(message)}</span>
            </div>
          )}
          {choosingLanguage ? (
            <section
              className="language-entry template-entry"
              aria-labelledby="editor-heading"
            >
              <div className="section-heading">
                <h1 id="editor-heading" ref={heading} tabIndex={-1}>
                  {t('Choose your language')}
                </h1>
                <span className="section-rule" />
              </div>
              <div className="language-choices">
                {(
                  [
                    { language: 'en', label: 'English', flag: '🇬🇧' },
                    { language: 'fr', label: 'Français', flag: '🇫🇷' },
                    { language: 'ar', label: 'العربية', flag: '🇲🇦' },
                  ] as const
                ).map((option) => (
                  <button
                    type="button"
                    key={option.language}
                    className="language-choice"
                    lang={option.language}
                    dir={option.language === 'ar' ? 'rtl' : 'ltr'}
                    onClick={() => chooseLanguage(option.language)}
                  >
                    <span className="language-flag" aria-hidden="true">
                      {option.flag}
                    </span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </section>
          ) : choosingTemplate ? (
            <section
              className="template-entry"
              aria-labelledby="editor-heading"
            >
              <div className="section-heading">
                <h1 id="editor-heading" ref={heading} tabIndex={-1}>
                  {t('Choose a template')}
                </h1>
                <span className="section-rule" />
              </div>
              <TemplateStart
                options={templateRegistry.templates}
                selectedId={template.id}
                onApply={(templateId) => {
                  update({
                    ...document,
                    appearance: { ...document.appearance, templateId },
                  })
                  chooseStep('personal')
                  window.scrollTo({ top: 0 })
                }}
                renderThumbnail={renderThumbnail}
                renderPreview={renderTemplatePreview}
              />
            </section>
          ) : (
            <>
              <div
                className="mobile-view-switch"
                role="group"
                aria-label={t('Workspace view')}
              >
                <button
                  type="button"
                  aria-pressed={view === 'edit'}
                  onClick={() => setView('edit')}
                >
                  <PencilLine size={15} />
                  {t('Edit')}
                </button>
                <button
                  type="button"
                  aria-pressed={view === 'preview'}
                  onClick={() => setView('preview')}
                >
                  <Eye size={15} />
                  {t('Preview')}
                </button>
              </div>
              <div className="builder-grid">
                <section
                  className="editor-pane"
                  aria-labelledby="editor-heading"
                >
                  <div className="section-heading">
                    <span className="section-number">
                      {t('SECTION')} {String(stepIndex + 1).padStart(2, '0')}{' '}
                      <span>/ 06</span>
                    </span>
                    <h1 id="editor-heading" ref={heading} tabIndex={-1}>
                      {t(currentStep.label)}
                    </h1>
                    <span className="section-rule" />
                  </div>
                  <div className="editor-content" key={step}>
                    {step === 'design' ? (
                      <TemplatePicker
                        options={templateRegistry.templates}
                        appearance={document.appearance}
                        onChange={(appearance) =>
                          update({ ...document, appearance })
                        }
                        renderThumbnail={renderThumbnail}
                        renderPreview={renderTemplatePreview}
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
                      {t('Back')}
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
                        {t('Continue')}
                        <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="button button-primary"
                        onClick={() => setView('preview')}
                      >
                        <Eye size={16} />
                        {t('Review CV')}
                      </button>
                    )}
                  </footer>
                </section>
                <section
                  className="preview-pane"
                  aria-label={t('Document preview')}
                  tabIndex={0}
                >
                  <Suspense
                    fallback={
                      <div className="preview-placeholder">
                        <LoaderCircle className="spin" size={24} />
                        <span>{t('Loading preview...')}</span>
                      </div>
                    }
                  >
                    <PdfWorkspace
                      cv={document.cv}
                      appearance={document.appearance}
                      template={template}
                    />
                  </Suspense>
                </section>
              </div>
            </>
          )}
        </main>
        {confirmation && (
          <ConfirmDialog
            title={t(
              confirmation.kind === 'reset'
                ? 'Start with a blank page?'
                : confirmation.kind === 'example'
                  ? 'Load the example CV?'
                  : 'Restore this backup?',
            )}
            confirmLabel={t(
              confirmation.kind === 'reset'
                ? 'Start over'
                : confirmation.kind === 'example'
                  ? 'Use example'
                  : 'Restore backup',
            )}
            onCancel={() => setConfirmation(null)}
            onConfirm={confirmAction}
          >
            <p>
              {t(
                'This will replace your current CV on this device. Download a JSON backup first to keep a copy.',
              )}
            </p>
          </ConfirmDialog>
        )}
        {showPrivacy && (
          <ConfirmDialog
            title={t('Only on this device')}
            confirmLabel={t('Got it')}
            onCancel={() => setShowPrivacy(false)}
            onConfirm={() => setShowPrivacy(false)}
          >
            <p>
              {t(
                'Your CV is saved in this browser, not uploaded to a server. There are no accounts, analytics, or remote font requests.',
              )}
            </p>
            <p>
              {t(
                'Browser storage is not encrypted. Clearing site data or using private browsing can remove your CV. Download a JSON backup to keep a copy.',
              )}
            </p>
          </ConfirmDialog>
        )}
      </div>
    </LanguageProvider>
  )
}
