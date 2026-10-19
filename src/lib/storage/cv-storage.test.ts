import { describe, expect, it } from 'vitest'
import { createDocument } from '../../domain/cv/defaults'
import {
  clearDocument,
  loadDocument,
  parseBackup,
  saveDocument,
  serializeBackup,
  STORAGE_KEY,
  type StoragePort,
} from './cv-storage'

function memoryStorage(): StoragePort {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
    removeItem: (key) => {
      values.delete(key)
    },
  }
}

describe('CV persistence', () => {
  it('round trips incomplete drafts without requiring a valid email', () => {
    const storage = memoryStorage()
    const document = createDocument('classic')
    document.cv.personal.email = 'still typing@'
    expect(loadDocument(storage)).toEqual({ status: 'empty' })
    expect(saveDocument(storage, document)).toEqual({ ok: true })
    expect(loadDocument(storage)).toEqual({ status: 'ready', document })
    expect(parseBackup(serializeBackup(document))).toEqual(document)
    expect(clearDocument(storage)).toEqual({ ok: true })
    expect(loadDocument(storage)).toEqual({ status: 'empty' })
  })

  it.each(['not json', '{"version":2}', '{"version":1,"cv":{}}'])(
    'leaves unreadable saved data untouched: %s',
    (raw) => {
      const storage = memoryStorage()
      storage.setItem(STORAGE_KEY, raw)
      expect(loadDocument(storage).status).toBe('blocked')
      expect(storage.getItem(STORAGE_KEY)).toBe(raw)
    },
  )

  it('reports unavailable storage and quota failures', () => {
    const fail = () => {
      throw new Error('denied')
    }
    const storage = { getItem: fail, setItem: fail, removeItem: fail }
    expect(loadDocument(storage).status).toBe('blocked')
    expect(saveDocument(storage, createDocument('classic')).ok).toBe(false)
    expect(clearDocument(storage).ok).toBe(false)
  })

  it('rejects invalid imports and retains unknown template IDs for app-level resolution', () => {
    expect(() => parseBackup('{}')).toThrow()
    const document = createDocument('removed-template')
    expect(parseBackup(serializeBackup(document)).appearance.templateId).toBe(
      'removed-template',
    )
  })
})
