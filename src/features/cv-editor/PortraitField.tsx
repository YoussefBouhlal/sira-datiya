import { useEffect, useId, useRef, useState } from 'react'
import { Trash2, Upload } from 'lucide-react'
import { useTranslation } from '../../i18n/context'
import { messages } from '../../i18n/messages'
import { PortraitDialog } from './PortraitDialog'
import {
  centeredPortrait,
  preparePortrait,
  type PortraitFraming,
} from './portrait'

export function PortraitField({
  value,
  framing,
  shape = 'circle',
  onChange,
}: {
  value: string
  framing?: PortraitFraming
  shape?: 'circle' | 'square'
  onChange: (value: string, framing?: PortraitFraming) => void
}) {
  const { t } = useTranslation()
  const inputId = useId()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [candidate, setCandidate] = useState<PortraitFraming | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const request = useRef(0)
  const latestChange = useRef(onChange)
  useEffect(() => {
    latestChange.current = onChange
  }, [onChange])
  useEffect(
    () => () => {
      request.current++
    },
    [],
  )
  return (
    <div className="form-field portrait-field">
      <label htmlFor={inputId}>{t('Portrait')}</label>
      <div className="portrait-controls">
        <div className="portrait-upload" data-shape={shape}>
          <input
            ref={input}
            id={inputId}
            className="portrait-input"
            type="file"
            accept="image/png,image/jpeg"
            title={t(value ? 'Replace portrait' : 'Upload portrait')}
            disabled={busy}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error
                ? `${inputId}-error`
                : busy
                  ? `${inputId}-status`
                  : undefined
            }
            onChange={async (event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (!file) return
              const current = ++request.current
              setError('')
              setBusy(true)
              try {
                const source = await preparePortrait(file)
                if (request.current === current)
                  setCandidate({ source, ...centeredPortrait })
              } catch (failure) {
                if (request.current === current)
                  setError(
                    failure instanceof Error &&
                      Object.hasOwn(messages, failure.message)
                      ? failure.message
                      : 'The portrait could not be opened. Choose another PNG or JPEG.',
                  )
              } finally {
                if (request.current === current) setBusy(false)
              }
            }}
          />
          {value ? (
            <button
              type="button"
              className="portrait-adjust"
              aria-label={t('Adjust portrait')}
              title={t('Adjust portrait')}
              disabled={busy}
              onClick={() => {
                setError('')
                setCandidate(framing ?? { source: value, ...centeredPortrait })
              }}
            >
              <img
                className="portrait-preview"
                src={value}
                alt={t('Your portrait')}
                width={42}
                height={42}
              />
            </button>
          ) : (
            <Upload size={18} aria-hidden="true" />
          )}
        </div>
        {value && (
          <button
            type="button"
            className="icon-button"
            title={t('Replace portrait')}
            aria-label={t('Replace portrait')}
            disabled={busy}
            onClick={() => input.current?.click()}
          >
            <Upload size={16} aria-hidden="true" />
          </button>
        )}
        {value && (
          <button
            type="button"
            className="icon-button"
            title={t('Remove portrait')}
            aria-label={t('Remove portrait')}
            disabled={busy}
            onClick={() => {
              setError('')
              onChange('')
            }}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      {busy && (
        <span id={`${inputId}-status`} role="status">
          {t('Preparing portrait...')}
        </span>
      )}
      {error && (
        <p id={`${inputId}-error`} className="field-error" role="alert">
          {t(error)}
        </p>
      )}
      {candidate && (
        <PortraitDialog
          framing={candidate}
          shape={shape}
          onCancel={() => setCandidate(null)}
          onApply={(portrait, nextFraming) => {
            latestChange.current(portrait, nextFraming)
            setCandidate(null)
          }}
        />
      )}
    </div>
  )
}
