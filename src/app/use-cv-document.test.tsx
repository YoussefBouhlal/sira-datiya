// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  LANGUAGE_PREFERENCE_KEY,
  STORAGE_KEY,
  type StoragePort,
} from '../lib/storage/cv-storage'
import { createDocument } from '../domain/cv/defaults'
import { useCvDocument } from './use-cv-document'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  localStorage.clear()
})

describe('document orchestration', () => {
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
