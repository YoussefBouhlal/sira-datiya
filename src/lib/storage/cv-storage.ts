import { z } from 'zod'
import { appearanceSchema, cvSchema } from '../../domain/cv/schema'
import type { CvDocument } from '../../domain/cv/types'

export const STORAGE_KEY = 'sira-datiya.cv.v1'
const savedDocumentSchema = z.object({
  version: z.literal(1),
  cv: cvSchema,
  appearance: appearanceSchema,
})

export type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
export type LoadResult =
  | { status: 'empty' }
  | { status: 'ready'; document: CvDocument }
  | { status: 'blocked'; message: string }
export type WriteResult = { ok: true } | { ok: false; message: string }

export function loadDocument(storage: StoragePort): LoadResult {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (raw === null) return { status: 'empty' }
    const parsed = savedDocumentSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) {
      return {
        status: 'blocked',
        message:
          'The saved CV could not be opened. It may belong to a newer version. Your saved data has not been changed.',
      }
    }
    return {
      status: 'ready',
      document: { cv: parsed.data.cv, appearance: parsed.data.appearance },
    }
  } catch {
    return {
      status: 'blocked',
      message:
        'Browser storage could not be read. Your existing saved data has not been changed.',
    }
  }
}

export function saveDocument(
  storage: StoragePort,
  document: CvDocument,
): WriteResult {
  try {
    const value = savedDocumentSchema.parse({ version: 1, ...document })
    storage.setItem(STORAGE_KEY, JSON.stringify(value))
    return { ok: true }
  } catch {
    return {
      ok: false,
      message:
        'Your changes could not be saved in this browser. Keep this tab open and download a backup.',
    }
  }
}

export function clearDocument(storage: StoragePort): WriteResult {
  try {
    storage.removeItem(STORAGE_KEY)
    return { ok: true }
  } catch {
    return {
      ok: false,
      message:
        'Browser storage could not be cleared. Check your browser privacy settings.',
    }
  }
}

export function serializeBackup(document: CvDocument): string {
  return JSON.stringify(
    savedDocumentSchema.parse({ version: 1, ...document }),
    null,
    2,
  )
}

export function parseBackup(raw: string): CvDocument {
  const parsed = savedDocumentSchema.parse(JSON.parse(raw))
  return { cv: parsed.cv, appearance: parsed.appearance }
}
