import { useEffect, useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Field } from '../../components/ui/Field'

async function preparePortrait(file: File): Promise<string> {
  if (!['image/png', 'image/jpeg'].includes(file.type))
    throw new Error('Choose a PNG or JPEG portrait.')
  if (file.size > 10 * 1024 * 1024)
    throw new Error('Choose a portrait smaller than 10 MB.')
  const image = await createImageBitmap(file)
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const context = canvas.getContext('2d')
    if (!context)
      throw new Error('This browser could not prepare the portrait.')
    const size = Math.min(image.width, image.height)
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, 512, 512)
    context.drawImage(
      image,
      (image.width - size) / 2,
      (image.height - size) / 2,
      size,
      size,
      0,
      0,
      512,
      512,
    )
    for (const quality of [0.85, 0.7, 0.55, 0.4]) {
      const result = canvas.toDataURL('image/jpeg', quality)
      if (
        result.startsWith('data:image/jpeg;base64,') &&
        result.length <= 270_000
      )
        return result
    }
    throw new Error(
      'This portrait is too detailed to save. Choose a smaller image.',
    )
  } finally {
    image.close()
  }
}

export function PortraitField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
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
    <div className="portrait-field full-width">
      {value && (
        <img
          className="portrait-preview"
          src={value}
          alt="Your portrait"
          width={64}
          height={64}
        />
      )}
      <Field
        label="Portrait"
        type="file"
        accept="image/png,image/jpeg"
        disabled={busy}
        onChange={async (event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (!file) return
          const current = ++request.current
          setError('')
          setBusy(true)
          try {
            const portrait = await preparePortrait(file)
            if (request.current === current) latestChange.current(portrait)
          } catch (failure) {
            if (request.current === current)
              setError(
                failure instanceof Error
                  ? failure.message
                  : 'The portrait could not be opened. Choose another PNG or JPEG.',
              )
          } finally {
            if (request.current === current) setBusy(false)
          }
        }}
      />
      {value && (
        <button
          type="button"
          className="icon-button"
          title="Remove portrait"
          aria-label="Remove portrait"
          disabled={busy}
          onClick={() => onChange('')}
        >
          <Trash2 size={16} />
        </button>
      )}
      {busy && <span role="status">Preparing portrait...</span>}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
