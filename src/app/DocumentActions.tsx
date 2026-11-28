import {
  CircleHelp,
  Download,
  Ellipsis,
  FileUp,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react'
import { useRef, useState } from 'react'
import type { CvDocument } from '../domain/cv/types'
import { documentFilename, downloadBlob } from '../lib/download'
import { parseBackup, serializeBackup } from '../lib/storage/cv-storage'
import { useTranslation } from '../i18n/context'

export function DocumentActions({
  document,
  onBeforeNavigate,
  onRestore,
  onReset,
}: {
  document: CvDocument
  onBeforeNavigate: () => boolean
  onRestore: (document: CvDocument) => void
  onReset: () => void
}) {
  const { t } = useTranslation()
  const fileInput = useRef<HTMLInputElement>(null)
  const menu = useRef<HTMLDetailsElement>(null)
  const [error, setError] = useState('')
  function closeMenu() {
    if (menu.current) menu.current.open = false
  }
  return (
    <div className="document-actions">
      <details className="document-menu" ref={menu}>
        <summary
          className="icon-button"
          aria-label={t('Document actions')}
          title={t('Document actions')}
        >
          <Ellipsis size={20} />
        </summary>
        <div className="document-menu-items">
          <button
            type="button"
            onClick={() => {
              downloadBlob(
                new Blob([serializeBackup(document)], {
                  type: 'application/json',
                }),
                documentFilename(document.cv.personal.fullName, 'json'),
              )
              closeMenu()
            }}
          >
            <Download size={16} />
            {t('Download backup')}
          </button>
          <button
            type="button"
            onClick={() => {
              fileInput.current?.click()
              closeMenu()
            }}
          >
            <FileUp size={16} />
            {t('Restore backup')}
          </button>
          <button
            type="button"
            onClick={() => {
              onReset()
              closeMenu()
            }}
          >
            <RotateCcw size={16} />
            {t('Start over')}
          </button>
          <div className="document-menu-links">
            <a
              href={`${import.meta.env.BASE_URL}en/`}
              onClick={(event) => {
                if (!onBeforeNavigate()) event.preventDefault()
                closeMenu()
              }}
            >
              <CircleHelp size={16} aria-hidden="true" />
              {t('About Siravuno')}
            </a>
            <a
              href={`${import.meta.env.BASE_URL}${document.appearance.language}/privacy/`}
              onClick={(event) => {
                if (!onBeforeNavigate()) event.preventDefault()
                closeMenu()
              }}
            >
              <ShieldCheck size={16} aria-hidden="true" />
              {t('Privacy and analytics')}
            </a>
          </div>
        </div>
      </details>
      <input
        type="file"
        accept="application/json,.json"
        className="sr-only"
        ref={fileInput}
        aria-label={t('CV backup file')}
        tabIndex={-1}
        onChange={async (event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (!file) return
          setError('')
          try {
            if (file.size > 2_000_000) throw new Error('Too large')
            onRestore(parseBackup(await file.text()))
          } catch {
            setError(
              'This backup could not be opened. Choose a valid Siravuno JSON backup smaller than 2 MB.',
            )
          }
        }}
      />
      {error && (
        <div className="import-error" role="alert">
          {t(error)}
          <button type="button" onClick={() => setError('')}>
            {t('Dismiss')}
          </button>
        </div>
      )}
    </div>
  )
}
