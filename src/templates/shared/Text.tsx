import { Text as PdfText } from '@react-pdf/renderer'
import type { ComponentProps } from 'react'

function breakLongWords(word: string): string[] {
  return word.length > 16 ? Array.from(word) : [word]
}

export function Text(props: ComponentProps<typeof PdfText>) {
  return <PdfText {...props} hyphenationCallback={breakLongWords} />
}
