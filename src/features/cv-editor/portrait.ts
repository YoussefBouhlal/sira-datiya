import type { CvData } from '../../domain/cv/types'

export type PortraitFraming = NonNullable<CvData['personal']['portraitFraming']>
export type PortraitPosition = Pick<PortraitFraming, 'x' | 'y' | 'zoom'>

export const centeredPortrait: PortraitPosition = { x: 0.5, y: 0.5, zoom: 1 }

export function portraitCrop(
  width: number,
  height: number,
  position: PortraitPosition,
) {
  const size = Math.min(width, height) / position.zoom
  return {
    left: (width - size) * position.x,
    top: (height - size) * position.y,
    size,
  }
}

export function movePortrait(
  width: number,
  height: number,
  position: PortraitPosition,
  deltaX: number,
  deltaY: number,
): PortraitPosition {
  const { size } = portraitCrop(width, height, position)
  const clamp = (value: number) => Math.max(0, Math.min(1, value))
  return {
    ...position,
    x: width > size ? clamp(position.x - deltaX / (width - size)) : position.x,
    y:
      height > size ? clamp(position.y - deltaY / (height - size)) : position.y,
  }
}

function encodePortrait(canvas: HTMLCanvasElement, limit: number): string {
  for (const quality of [0.85, 0.7, 0.55, 0.4]) {
    const result = canvas.toDataURL('image/jpeg', quality)
    if (result.startsWith('data:image/jpeg;base64,') && result.length <= limit)
      return result
  }
  throw new Error(
    'This portrait is too detailed to save. Choose a smaller image.',
  )
}

export async function preparePortrait(file: File): Promise<string> {
  if (!['image/png', 'image/jpeg'].includes(file.type))
    throw new Error('Choose a PNG or JPEG portrait.')
  if (file.size > 10 * 1024 * 1024)
    throw new Error('Choose a portrait smaller than 10 MB.')
  const image = await createImageBitmap(file)
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context)
      throw new Error('This browser could not prepare the portrait.')
    for (const longestSide of [1536, 1024, 768, 512]) {
      const scale = Math.min(
        1,
        longestSide / Math.max(image.width, image.height),
      )
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      try {
        return encodePortrait(canvas, 600_000)
      } catch {
        if (longestSide === 512)
          throw new Error(
            'This portrait is too detailed to save. Choose a smaller image.',
          )
      }
    }
    throw new Error('This browser could not prepare the portrait.')
  } finally {
    image.close()
  }
}

export function renderPortrait(
  image: HTMLImageElement,
  position: PortraitPosition,
): string {
  const { left, top, size } = portraitCrop(
    image.naturalWidth,
    image.naturalHeight,
    position,
  )
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const context = canvas.getContext('2d')
  if (!context) throw new Error('This browser could not prepare the portrait.')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, 512, 512)
  context.drawImage(image, left, top, size, size, 0, 0, 512, 512)
  return encodePortrait(canvas, 270_000)
}
