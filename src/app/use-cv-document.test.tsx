// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  LANGUAGE_PREFERENCE_KEY,
  STORAGE_KEY,
  type StoragePort,
} from '../lib/storage/cv-storage'
import { createDocument, selectTemplateAppearance } from '../domain/cv/defaults'
import { useCvDocument } from './use-cv-document'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  localStorage.clear()
  window.history.replaceState(null, '', '/')
})

describe('document orchestration', () => {
  it('preserves colors when the public template is already active', () => {
    const document = createDocument('classic', 'ar')
    document.appearance.colors = { headings: '#234567' }
    document.appearance.accent = '#3456a0'
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 2, ...document }),
    )
    window.history.replaceState(null, '', '/?template=001')
    const { result } = renderHook(() => useCvDocument())
    expect(result.current.document).toEqual(document)
    expect(result.current.enteredWithTemplate).toBe(true)
  })

  it('uses a saved language preference for public entry without a draft', () => {
    localStorage.setItem(LANGUAGE_PREFERENCE_KEY, 'ar')
    window.history.replaceState(null, '', '/?template=005')
    const { result } = renderHook(() => useCvDocument())
    expect(result.current.choosingLanguage).toBe(false)
    expect(result.current.document.appearance.language).toBe('ar')
    expect(result.current.document.appearance.templateId).toBe('prime-ats')
  })

  it('retains an applied entry in memory when saving fails without leaving a replayable URL', () => {
    vi.useFakeTimers()
    const document = createDocument('modern', 'ar')
    document.cv.summary = 'Fictional private summary'
    const storage: StoragePort = {
      getItem: (key) =>
        key === STORAGE_KEY
          ? JSON.stringify({ version: 2, ...document })
          : null,
      setItem: () => {
        throw new Error('quota')
      },
      removeItem: () => {},
    }
    window.history.replaceState(null, '', '/?template=001')
    const { result } = renderHook(() => useCvDocument(storage))
    act(() => vi.advanceTimersByTime(500))
    expect(result.current.document.cv).toEqual(document.cv)
    expect(result.current.document.appearance.templateId).toBe('classic')
    expect(result.current.saveStatus).toBe('error')
    expect(result.current.message).toContain('backup')
    expect(window.location.search).toBe('')
  })

  it('applies a public template once while preserving content, language and other preferences', () => {
    vi.useFakeTimers()
    const document = createDocument('modern', 'ar')
    document.cv.personal.fullName = 'Fictional person'
    document.appearance.pageSize = 'LETTER'
    document.appearance.accent = '#3456a0'
    document.appearance.fontSize = 12
    document.appearance.colors = { headings: '#234567' }
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 2, ...document }),
    )
    window.history.replaceState(
      { source: 'test' },
      '',
      '/?keep=1&template=001#editor',
    )
    const { result, unmount } = renderHook(() => useCvDocument())
    expect(result.current.document.cv).toEqual(document.cv)
    expect(result.current.document.appearance).toEqual(
      selectTemplateAppearance(document.appearance, 'classic'),
    )
    expect(result.current.enteredWithTemplate).toBe(true)
    expect(window.location.search).toBe('?keep=1')
    expect(window.location.hash).toBe('#editor')
    expect(window.history.state).toEqual({ source: 'test' })
    act(() =>
      result.current.update({
        ...result.current.document,
        appearance: {
          ...result.current.document.appearance,
          templateId: 'sidebar',
        },
      }),
    )
    act(() => vi.advanceTimersByTime(500))
    unmount()
    const reloaded = renderHook(() => useCvDocument())
    expect(reloaded.result.current.document.appearance.templateId).toBe(
      'sidebar',
    )
    expect(reloaded.result.current.enteredWithTemplate).toBe(false)
  })

  it('retains a fresh template entry through reload until explicit language choice', () => {
    window.history.replaceState(null, '', '/?template=003')
    const { result, unmount } = renderHook(() => useCvDocument())
    expect(result.current.choosingLanguage).toBe(true)
    expect(result.current.document.appearance.templateId).toBe('modern')
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(window.location.search).toBe('?template=003')
    unmount()
    const reloaded = renderHook(() => useCvDocument())
    act(() => reloaded.result.current.chooseLanguage('fr'))
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(saved.appearance.templateId).toBe('sidebar')
    expect(saved.appearance.language).toBe('fr')
    expect(saved.cv).toEqual(createDocument('modern').cv)
    expect(window.location.search).toBe('')
  })

  it.each(['999', '', 'classic', '1', '001&template=003'])(
    'ignores invalid or ambiguous template entry %s',
    (number) => {
      window.history.replaceState(null, '', `/?template=${number}`)
      const { result } = renderHook(() => useCvDocument())
      expect(result.current.templateUnavailable).toBe(true)
      expect(result.current.enteredWithTemplate).toBe(false)
      expect(result.current.document.appearance.templateId).toBe('modern')
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
      expect(window.location.search).toBe('')
    },
  )

  it('never applies an entry over unreadable saved data, even after recovery', () => {
    vi.useFakeTimers()
    localStorage.setItem(STORAGE_KEY, '{"version":99}')
    window.history.replaceState(null, '', '/?template=001')
    const { result } = renderHook(() => useCvDocument())
    expect(result.current.blocked).toBe(true)
    expect(result.current.enteredWithTemplate).toBe(false)
    act(() => vi.advanceTimersByTime(500))
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{"version":99}')
    act(() => result.current.reset())
    expect(result.current.document.appearance.templateId).toBe('modern')
    expect(window.location.search).toBe('')
  })

  it('ignores previous-brand drafts and language preferences without migrating them', () => {
    vi.stubGlobal('navigator', { languages: ['en-US'] })
    const previousDraft = JSON.stringify({
      version: 2,
      ...createDocument('classic', 'ar'),
    })
    localStorage.setItem('sira-datiya.cv.v1', previousDraft)
    localStorage.setItem('sira-datiya.language.v1', 'ar')
    const { result } = renderHook(() => useCvDocument())
    expect(result.current.choosingLanguage).toBe(true)
    expect(result.current.document.appearance.language).toBe('en')
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(localStorage.getItem(LANGUAGE_PREFERENCE_KEY)).toBeNull()
    act(() => result.current.chooseLanguage('fr'))
    expect(localStorage.getItem(LANGUAGE_PREFERENCE_KEY)).toBe('fr')
    expect(
      JSON.parse(localStorage.getItem(STORAGE_KEY)!).appearance.language,
    ).toBe('fr')
    expect(localStorage.getItem('sira-datiya.cv.v1')).toBe(previousDraft)
    expect(localStorage.getItem('sira-datiya.language.v1')).toBe('ar')
  })

  it('does not save an untouched visit before the initial language choice', () => {
    vi.useFakeTimers()
    const { result, unmount } = renderHook(() => useCvDocument())
    expect(result.current.choosingLanguage).toBe(true)
    act(() => {
      vi.advanceTimersByTime(500)
      window.dispatchEvent(new Event('pagehide'))
    })
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(localStorage.getItem(LANGUAGE_PREFERENCE_KEY)).toBeNull()
    unmount()
    const reloaded = renderHook(() => useCvDocument())
    expect(reloaded.result.current.choosingLanguage).toBe(true)
  })

  it('remembers the initial choice through an immediate reset and reload without a draft', () => {
    const { result, unmount } = renderHook(() => useCvDocument())
    act(() => result.current.chooseLanguage('ar'))
    expect(localStorage.getItem(LANGUAGE_PREFERENCE_KEY)).toBe('ar')
    expect(
      JSON.parse(localStorage.getItem(STORAGE_KEY)!).appearance.language,
    ).toBe('ar')
    act(() => {
      result.current.reset()
    })
    unmount()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    const reloaded = renderHook(() => useCvDocument())
    expect(reloaded.result.current.choosingLanguage).toBe(false)
    expect(reloaded.result.current.document.appearance.language).toBe('ar')
  })

  it('keeps a failed language choice usable and reports that it was not saved', () => {
    const storage: StoragePort = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota')
      },
      removeItem: () => {},
    }
    const { result } = renderHook(() => useCvDocument(storage))
    act(() => result.current.chooseLanguage('fr'))
    expect(result.current.choosingLanguage).toBe(false)
    expect(result.current.document.appearance.language).toBe('fr')
    expect(result.current.saveStatus).toBe('error')
    expect(result.current.message).toContain('backup')
  })

  it('keeps legacy drafts English despite a French browser preference', () => {
    vi.stubGlobal('navigator', { languages: ['fr-FR'] })
    const document = createDocument('classic')
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 2,
        ...document,
        appearance: { ...document.appearance, language: undefined },
      }),
    )
    const { result } = renderHook(() => useCvDocument())
    expect(result.current.document.appearance.language).toBe('en')
  })

  it('falls back to English when no browser language is supported', () => {
    vi.stubGlobal('navigator', { languages: ['de-DE', 'es'] })
    const { result } = renderHook(() => useCvDocument())
    expect(result.current.document.appearance.language).toBe('en')
  })

  it('detects language only for new drafts and keeps it on reset', () => {
    vi.stubGlobal('navigator', { languages: ['de-DE', 'fr-CA', 'ar'] })
    const { result } = renderHook(() => useCvDocument())
    expect(result.current.document.appearance.language).toBe('fr')
    act(() =>
      result.current.update({
        ...result.current.document,
        appearance: {
          ...result.current.document.appearance,
          language: 'ar',
        },
      }),
    )
    act(() => {
      result.current.reset()
    })
    expect(result.current.document.appearance.language).toBe('ar')
  })

  it('saves edits and flushes the newest draft on pagehide', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useCvDocument())
    act(() => result.current.chooseLanguage('en'))
    act(() =>
      result.current.update({
        ...result.current.document,
        cv: { ...result.current.document.cv, summary: 'Newest draft' },
      }),
    )
    act(() => window.dispatchEvent(new Event('pagehide')))
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).cv.summary).toBe(
      'Newest draft',
    )
    expect(result.current.saveStatus).toBe('saved')
  })

  it('saves the latest edit before navigation without waiting for autosave', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useCvDocument())
    act(() => result.current.chooseLanguage('ar'))
    act(() =>
      result.current.update({
        ...result.current.document,
        cv: { ...result.current.document.cv, summary: 'Immediate edit' },
      }),
    )
    act(() => expect(result.current.saveBeforeNavigation()).toBe(true))
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(saved.cv.summary).toBe('Immediate edit')
    expect(saved.appearance.language).toBe('ar')
  })

  it('allows an untouched visitor to leave without creating a draft or preference', () => {
    const { result } = renderHook(() => useCvDocument())
    act(() => expect(result.current.saveBeforeNavigation()).toBe(true))
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(localStorage.getItem(LANGUAGE_PREFERENCE_KEY)).toBeNull()
  })

  it('blocks navigation over unreadable storage without replacing it', () => {
    localStorage.setItem(STORAGE_KEY, '{"version":99}')
    const { result } = renderHook(() => useCvDocument())
    act(() => expect(result.current.saveBeforeNavigation()).toBe(false))
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{"version":99}')
    expect(result.current.message).toContain('backup before leaving')
  })

  it('blocks navigation after a failed save and retains the edited draft', () => {
    const storage: StoragePort = {
      getItem: (key) => (key === LANGUAGE_PREFERENCE_KEY ? 'en' : null),
      setItem: () => {
        throw new Error('quota')
      },
      removeItem: () => {},
    }
    const { result } = renderHook(() => useCvDocument(storage))
    act(() =>
      result.current.update({
        ...result.current.document,
        cv: { ...result.current.document.cv, summary: 'Keep this edit' },
      }),
    )
    act(() => expect(result.current.saveBeforeNavigation()).toBe(false))
    expect(result.current.document.cv.summary).toBe('Keep this edit')
    expect(result.current.saveStatus).toBe('error')
    expect(result.current.message).toContain('backup')
  })

  it('never autosaves over unreadable data and allows an explicit reset', () => {
    vi.useFakeTimers()
    localStorage.setItem(STORAGE_KEY, '{"version":99}')
    const { result } = renderHook(() => useCvDocument())
    act(() =>
      result.current.update({
        ...result.current.document,
        cv: { ...result.current.document.cv, summary: 'New work' },
      }),
    )
    act(() => {
      vi.advanceTimersByTime(500)
      window.dispatchEvent(new Event('pagehide'))
    })
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{"version":99}')
    expect(result.current.blocked).toBe(true)
    act(() => {
      result.current.reset()
    })
    act(() => vi.advanceTimersByTime(500))
    expect(result.current.blocked).toBe(false)
    expect(result.current.document.cv.summary).toBe('')
  })

  it('exposes a failed save without losing the in-memory draft', () => {
    vi.useFakeTimers()
    const storage: StoragePort = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota')
      },
      removeItem: () => {},
    }
    const { result } = renderHook(() => useCvDocument(storage))
    act(() => result.current.chooseLanguage('en'))
    act(() => vi.advanceTimersByTime(500))
    expect(result.current.saveStatus).toBe('error')
    expect(result.current.message).toContain('backup')
  })
})
