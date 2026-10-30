import type { Appearance } from './types'

export type ColorScheme = NonNullable<Appearance['colors']>
export type ColorRole = keyof ColorScheme
export type TextColorRole = Exclude<ColorRole, 'accent' | 'surface'>

export type TemplateColorDefaults = {
  headings: string
  details: string
  body: string
  surface?: 'sidebar' | 'band'
}

export function effectiveColors(
  appearance: Readonly<Appearance>,
  defaults?: TemplateColorDefaults,
): Required<ColorScheme> {
  return {
    headings:
      defaults?.headings === 'accent' || !defaults
        ? appearance.accent
        : defaults.headings,
    details:
      defaults?.details === 'accent'
        ? appearance.accent
        : (defaults?.details ?? '#626b69'),
    body: defaults?.body ?? '#222222',
    accent: appearance.accent,
    surface:
      defaults?.surface === 'sidebar'
        ? darkenColor(appearance.accent)
        : '#dfdfdf',
    ...appearance.colors,
  }
}

export function darkenColor(color: string): string {
  return `#${color
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) =>
      Math.round(parseInt(channel, 16) * 0.7)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

function luminance(color: string): number {
  const channels = color
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) => {
      const value = parseInt(channel, 16) / 255
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    })
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722
}

export function contrastRatio(foreground: string, background: string): number {
  const first = luminance(foreground)
  const second = luminance(background)
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
}

export function surfaceForeground(background: string): string {
  return contrastRatio('#ffffff', background) >=
    contrastRatio('#000000', background)
    ? '#ffffff'
    : '#000000'
}

export const colorPalettes = [
  { label: 'Forest', accent: '#177568' },
  { label: 'Cobalt', accent: '#3456a0' },
  { label: 'Rose', accent: '#8c4255' },
  { label: 'Ink', accent: '#292929' },
].map(({ label, accent }) => ({
  label,
  colors: {
    headings: accent,
    details: '#50565a',
    body: '#222222',
    accent,
    surface: '#eeeeee',
  } satisfies Required<ColorScheme>,
}))
