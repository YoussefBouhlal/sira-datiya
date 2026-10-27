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
  it('defaults old drafts to English without writing and preserves language in backups', () => {
    const storage = memoryStorage()
    const document = createDocument('classic', 'ar')
    expect(parseBackup(serializeBackup(document))).toEqual(document)
    const raw = JSON.stringify({
      version: 2,
      ...document,
      appearance: {
        ...document.appearance,
        language: undefined,
      },
    })
    storage.setItem(STORAGE_KEY, raw)
    expect(loadDocument(storage)).toEqual({
      status: 'ready',
      document: {
        ...document,
        appearance: { ...document.appearance, language: 'en' },
      },
    })
    expect(storage.getItem(STORAGE_KEY)).toBe(raw)
    expect(() =>
      parseBackup(
        JSON.stringify({
          version: 2,
          ...document,
          appearance: {
            ...document.appearance,
            language: 'unknown',
          },
        }),
      ),
    ).toThrow()
  })

  it('migrates legacy skills without overwriting the original saved data', () => {
    const storage = memoryStorage()
    const document = createDocument('classic')
    const raw = JSON.stringify({
      version: 1,
      ...document,
      cv: {
        ...document.cv,
        personal: { ...document.cv.personal, portrait: undefined },
        references: undefined,
        skills: ['Communication', 'Communication'],
      },
    })
    storage.setItem(STORAGE_KEY, raw)
    const loaded = loadDocument(storage)
    expect(loaded.status).toBe('ready')
    expect(storage.getItem(STORAGE_KEY)).toBe(raw)
    const migrated = parseBackup(raw)
    expect(migrated.cv.skills).toEqual([
      { id: 'legacy-skill-0', name: 'Communication', level: null },
      { id: 'legacy-skill-1', name: 'Communication', level: null },
    ])
    expect(migrated.cv.personal.portrait).toBe('')
    expect(migrated.cv.references).toEqual([])
    expect(saveDocument(storage, migrated)).toEqual({ ok: true })
    expect(JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}').version).toBe(2)
  })

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

  it('round trips new content and rejects unsafe portrait sources and invalid skill levels', () => {
    const document = createDocument('sidebar')
    document.cv.skills = [{ id: 'skill-1', name: 'Communication', level: 4 }]
    document.cv.references = [
      {
        id: 'reference-1',
        name: 'Jordan Example',
        jobTitle: '',
        organization: '',
        email: 'jordan@example.com',
        phone: '',
      },
    ]
    expect(parseBackup(serializeBackup(document))).toEqual(document)
    const raw = (portrait: string) =>
      JSON.stringify({
        version: 2,
        ...document,
        cv: { ...document.cv, personal: { ...document.cv.personal, portrait } },
      })
    expect(() => parseBackup(raw('https://example.com/portrait.png'))).toThrow()
    expect(() =>
      parseBackup(raw('data:image/svg+xml;base64,PHN2Zz4=')),
    ).toThrow()
    document.cv.skills[0]!.level = 6
    expect(() => serializeBackup(document)).toThrow()
    expect(() =>
      parseBackup(JSON.stringify({ version: 3, ...createDocument('sidebar') })),
    ).toThrow()
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
