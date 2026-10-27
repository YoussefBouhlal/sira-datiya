// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { STORAGE_KEY, type StoragePort } from '../lib/storage/cv-storage'
import { createDocument } from '../domain/cv/defaults'
import { useCvDocument } from './use-cv-document'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  localStorage.clear()
})

describe('document orchestration', () => {
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
    act(() => vi.advanceTimersByTime(500))
    expect(result.current.saveStatus).toBe('error')
    expect(result.current.message).toContain('backup')
  })
})
