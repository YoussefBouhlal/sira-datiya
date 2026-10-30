import { createContext } from 'react'
import type { ColorScheme } from '../../domain/cv/colors'

export const PdfColorContext = createContext<ColorScheme>({})
