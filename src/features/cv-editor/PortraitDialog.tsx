import { useEffect, useId, useRef, useState } from 'react'
import { Check, RotateCcw, X } from 'lucide-react'
import { useTranslation } from '../../i18n/context'
import { messages } from '../../i18n/messages'
import {
  centeredPortrait,
  movePortrait,
  portraitCrop,
  renderPortrait,
  type PortraitFraming,
  type PortraitPosition,
} from './portrait'

export function PortraitDialog({
  framing,
  shape,
  onApply,
  onCancel,
}: {
  framing: PortraitFraming
  shape: 'circle' | 'square'
  onApply: (portrait: string, framing: PortraitFraming) => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  const titleId = useId()
  const controlsId = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const image = useRef<HTMLImageElement>(null)
  const drag = useRef<{
    pointerId: number
    clientX: number
    clientY: number
    position: PortraitPosition
  } | null>(null)
  const [position, setPosition] = useState<PortraitPosition>(framing)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [error, setError] = useState('')

  useEffect(() => {
    const element = dialog.current
    const opener = document.activeElement
    const overflow = document.body.style.overflow
    element?.showModal()
    closeButton.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      element?.close()
      document.body.style.overflow = overflow
      if (opener instanceof HTMLElement) opener.focus({ preventScroll: true })
    }
  }, [])

  const crop = portraitCrop(dimensions.width, dimensions.height, position)
  const ready = crop.size > 0

  return (
    <dialog
      ref={dialog}
      className="portrait-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input:not(:disabled)',
          ),
        )
        const first = controls[0]
        const last = controls.at(-1)
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }}
    >
      <header className="portrait-dialog-header">
        <h2 id={titleId}>{t('Adjust portrait')}</h2>
        <button
          ref={closeButton}
          type="button"
          className="icon-button"
          aria-label={t('Close dialog')}
          title={t('Close dialog')}
          onClick={onCancel}
        >
          <X size={20} aria-hidden="true" />
        </button>
      </header>
      <div className="portrait-dialog-body">
        <div
          className="portrait-crop"
          data-shape={shape}
          onPointerDown={(event) => {
            if (!ready || !event.isPrimary || event.button !== 0) return
            event.preventDefault()
            event.currentTarget.setPointerCapture(event.pointerId)
            drag.current = {
              pointerId: event.pointerId,
              clientX: event.clientX,
              clientY: event.clientY,
              position,
            }
          }}
          onPointerMove={(event) => {
            const active = drag.current
            if (!active || active.pointerId !== event.pointerId) return
            const scale =
              crop.size / event.currentTarget.getBoundingClientRect().width
            setPosition(
              movePortrait(
                dimensions.width,
                dimensions.height,
                active.position,
                (event.clientX - active.clientX) * scale,
                (event.clientY - active.clientY) * scale,
              ),
            )
          }}
          onPointerUp={() => {
            drag.current = null
          }}
          onPointerCancel={() => {
            drag.current = null
          }}
          onLostPointerCapture={() => {
            drag.current = null
          }}
        >
          <img
            ref={image}
            src={framing.source}
            alt={t('Portrait framing preview')}
            draggable={false}
            onLoad={(event) =>
              setDimensions({
                width: event.currentTarget.naturalWidth,
                height: event.currentTarget.naturalHeight,
              })
            }
            onError={() =>
              setError(
                'The portrait could not be opened. Choose another PNG or JPEG.',
              )
            }
            style={
              ready
                ? {
                    width: `${(dimensions.width / crop.size) * 100}%`,
                    height: `${(dimensions.height / crop.size) * 100}%`,
                    left: `${(-crop.left / crop.size) * 100}%`,
                    top: `${(-crop.top / crop.size) * 100}%`,
                  }
                : { visibility: 'hidden' }
            }
          />
        </div>
        <div className="portrait-sliders" dir="ltr">
          {(
            [
              ['x', 'Horizontal position', 0, 1],
              ['y', 'Vertical position', 0, 1],
              ['zoom', 'Portrait zoom', 1, 4],
            ] as const
          ).map(([key, label, min, max]) => (
            <div className="portrait-slider" key={key}>
              <label dir="auto" htmlFor={`${controlsId}-${key}`}>
                {t(label)}
              </label>
              <input
                id={`${controlsId}-${key}`}
                type="range"
                min={min}
                max={max}
                step={0.01}
                value={position[key]}
                disabled={
                  !ready ||
                  (key === 'x'
                    ? dimensions.width === crop.size
                    : key === 'y'
                      ? dimensions.height === crop.size
                      : false)
                }
                onChange={(event) =>
                  setPosition({
                    ...position,
                    [key]: event.currentTarget.valueAsNumber,
                  })
                }
              />
            </div>
          ))}
        </div>
        {error && (
          <p className="field-error" role="alert">
            {t(error)}
          </p>
        )}
      </div>
      <footer className="portrait-dialog-actions">
        <button
          type="button"
          className="icon-button"
          aria-label={t('Reset portrait framing')}
          title={t('Reset portrait framing')}
          disabled={!ready}
          onClick={() => setPosition({ ...centeredPortrait })}
        >
          <RotateCcw size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="button button-secondary"
          onClick={onCancel}
        >
          {t('Cancel')}
        </button>
        <button
          type="button"
          className="button button-primary"
          disabled={!ready}
          onClick={() => {
            if (!image.current || !ready) return
            setError('')
            try {
              const portrait = renderPortrait(image.current, position)
              onApply(portrait, { source: framing.source, ...position })
            } catch (failure) {
              setError(
                failure instanceof Error &&
                  Object.hasOwn(messages, failure.message)
                  ? failure.message
                  : 'This browser could not prepare the portrait.',
              )
            }
          }}
        >
          <Check size={16} aria-hidden="true" />
          {t('Apply')}
        </button>
      </footer>
    </dialog>
  )
}
