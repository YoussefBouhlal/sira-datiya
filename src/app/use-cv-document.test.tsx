// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { STORAGE_KEY, type StoragePort } from '../lib/storage/cv-storage'
import { useCvDocument } from './use-cv-document'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  localStorage.clear()
})

describe('document orchestration', () => {
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
