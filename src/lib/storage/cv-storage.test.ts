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
  it('round trips custom headings and normalizes surrounding whitespace', () => {
    const storage = memoryStorage()
    const document = createDocument('sidebar', 'ar')
    document.cv.headings = {
      summary: '  My profile  ',
      experience: '\u062e\u0628\u0631\u0627\u062a\u064a / Career',
      additionalInformation: 'More about me',
    }
    const normalized = {
      ...document,
      cv: {
        ...document.cv,
        headings: { ...document.cv.headings, summary: 'My profile' },
      },
    }
    expect(parseBackup(serializeBackup(document))).toEqual(normalized)
    expect(saveDocument(storage, document)).toEqual({ ok: true })
    expect(loadDocument(storage)).toEqual({
      status: 'ready',
      document: normalized,
    })
    document.cv.headings = { summary: '\u{1f600}'.repeat(80) }
    expect(parseBackup(serializeBackup(document))).toEqual(document)
  })

  it.each([
    'x'.repeat(81),
    'First\nSecond',
    'First\rSecond',
    'First\u2028Second',
  ])(
    'preserves unreadable saved data with an invalid heading: %s',
    (heading) => {
      const storage = memoryStorage()
      const document = createDocument('modern')
      const raw = JSON.stringify({
        version: 2,
        ...document,
        cv: { ...document.cv, headings: { summary: heading } },
      })
      storage.setItem(STORAGE_KEY, raw)
      expect(loadDocument(storage).status).toBe('blocked')
      expect(storage.getItem(STORAGE_KEY)).toBe(raw)
      expect(() => parseBackup(raw)).toThrow()
    },
  )

  it.each(['bar', 'text', 'both'] as const)(
    'round trips proficiency display %s without changing skill ratings',
    (mode) => {
      const storage = memoryStorage()
      const document = createDocument('sidebar')
      document.cv.skills = [{ id: 'skill-1', name: 'Research', level: 3 }]
      expect(parseBackup(serializeBackup(document))).toEqual(document)
      expect(document.appearance.skillProficiencyDisplay).toBeUndefined()
      document.appearance.skillProficiencyDisplay = mode
      expect(saveDocument(storage, document)).toEqual({ ok: true })
      expect(loadDocument(storage)).toEqual({ status: 'ready', document })
      expect(parseBackup(serializeBackup(document))).toEqual(document)
      expect(document.cv.skills[0]?.level).toBe(3)
    },
  )

  it('preserves unreadable data with an invalid proficiency display', () => {
    const storage = memoryStorage()
    const document = createDocument('sidebar')
    const raw = JSON.stringify({
      version: 2,
      ...document,
      appearance: { ...document.appearance, skillProficiencyDisplay: 'hidden' },
    })
    storage.setItem(STORAGE_KEY, raw)
    expect(loadDocument(storage).status).toBe('blocked')
    expect(storage.getItem(STORAGE_KEY)).toBe(raw)
    expect(() => parseBackup(raw)).toThrow()
  })

  it('preserves legacy colors and round trips independent color overrides', () => {
    const storage = memoryStorage()
    const document = createDocument('sidebar')
    document.appearance.accent = '#8c4255'
    expect(parseBackup(serializeBackup(document))).toEqual(document)
    expect(document.appearance.colors).toBeUndefined()
    document.appearance.colors = { body: '#123456' }
    expect(saveDocument(storage, document)).toEqual({ ok: true })
    expect(loadDocument(storage)).toEqual({ status: 'ready', document })
    expect(parseBackup(serializeBackup(document))).toEqual(document)
    expect(document.appearance.accent).toBe('#8c4255')
    document.appearance.colors = {
      headings: '#ABCDEF',
      details: '#456789',
      body: '#222222',
      accent: '#987654',
      surface: '#eeeeee',
    }
    expect(parseBackup(serializeBackup(document))).toEqual(document)
  })

  it.each(['red', '#fff', '#12345g', 'url(example)', '', '#12345678'])(
    'preserves unreadable saved data with an invalid color: %s',
    (color) => {
      const storage = memoryStorage()
      const document = createDocument('modern')
      document.appearance.colors = { headings: color }
      const raw = JSON.stringify({ version: 2, ...document })
      storage.setItem(STORAGE_KEY, raw)
      expect(loadDocument(storage).status).toBe('blocked')
      expect(storage.getItem(STORAGE_KEY)).toBe(raw)
      expect(() => parseBackup(raw)).toThrow()
    },
  )

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
