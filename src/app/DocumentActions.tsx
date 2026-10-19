import { Download, Ellipsis, FileUp, RotateCcw } from 'lucide-react'
import { useRef, useState } from 'react'
import type { CvDocument } from '../domain/cv/types'
import { documentFilename, downloadBlob } from '../lib/download'
import { parseBackup, serializeBackup } from '../lib/storage/cv-storage'

export function DocumentActions({
  document,
  onRestore,
  onReset,
}: {
  document: CvDocument
  onRestore: (document: CvDocument) => void
  onReset: () => void
}) {
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
          aria-label="Document actions"
          title="Document actions"
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
            Download backup
          </button>
          <button
            type="button"
            onClick={() => {
              fileInput.current?.click()
              closeMenu()
            }}
          >
            <FileUp size={16} />
            Restore backup
          </button>
          <button
            type="button"
            onClick={() => {
              onReset()
              closeMenu()
            }}
          >
            <RotateCcw size={16} />
            Start over
          </button>
        </div>
      </details>
      <input
        type="file"
        accept="application/json,.json"
        className="sr-only"
        ref={fileInput}
        aria-label="CV backup file"
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
              'This backup could not be opened. Choose a valid Sira Datiya JSON backup smaller than 2 MB.',
            )
          }
        }}
      />
      {error && (
        <div className="import-error" role="alert">
          {error}
          <button type="button" onClick={() => setError('')}>
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}
