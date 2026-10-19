import { useEffect, useState } from 'react'
import { createDocument } from '../domain/cv/defaults'
import type { CvDocument } from '../domain/cv/types'
import {
  clearDocument,
  loadDocument,
  saveDocument,
  type StoragePort,
} from '../lib/storage/cv-storage'
import { templateRegistry } from '../templates/registry'

function initialize(storage?: StoragePort) {
  const fallback = createDocument(templateRegistry.defaultId)
  try {
    const port = storage ?? window.localStorage
    const loaded = loadDocument(port)
    if (loaded.status === 'blocked') {
      return { document: fallback, blocked: true, message: loaded.message }
    }
    const document = loaded.status === 'ready' ? loaded.document : fallback
    document.appearance.templateId = templateRegistry.resolve(
      document.appearance.templateId,
    ).id
    return { document, blocked: false, message: '' }
  } catch {
    return {
      document: fallback,
      blocked: true,
      message:
        'Browser storage is unavailable. You can still edit and download your CV, but changes will not be saved.',
    }
  }
}

export function useCvDocument(storage?: StoragePort) {
  const [initial] = useState(() => initialize(storage))
  const [document, setDocument] = useState(initial.document)
  const [blocked, setBlocked] = useState(initial.blocked)
  const [message, setMessage] = useState(initial.message)
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error'>(
    initial.blocked ? 'error' : 'saving',
  )

  useEffect(() => {
    if (blocked) return
    const save = () => {
      try {
        const result = saveDocument(storage ?? window.localStorage, document)
        setSaveStatus(result.ok ? 'saved' : 'error')
        setMessage(result.ok ? '' : result.message)
      } catch {
        setSaveStatus('error')
        setMessage(
          'Browser storage is unavailable. Download a backup before closing this tab.',
        )
      }
    }
    const timer = window.setTimeout(save, 350)
    const onVisibility = () => {
      if (window.document.visibilityState === 'hidden') save()
    }
    window.addEventListener('pagehide', save)
    window.document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('pagehide', save)
      window.document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [document, blocked, storage])

  function update(next: CvDocument) {
    setDocument({
      ...next,
      appearance: {
        ...next.appearance,
        templateId: templateRegistry.resolve(next.appearance.templateId).id,
      },
    })
    if (!blocked) setSaveStatus('saving')
  }

  function reset(): boolean {
    try {
      const result = clearDocument(storage ?? window.localStorage)
      if (!result.ok) {
        setMessage(result.message)
        return false
      }
      setBlocked(false)
      setMessage('')
      setSaveStatus('saving')
      setDocument(createDocument(templateRegistry.defaultId))
      return true
    } catch {
      setMessage(
        'Browser storage could not be cleared. Your current CV has not been changed.',
      )
      return false
    }
  }

  function replace(next: CvDocument) {
    setBlocked(false)
    setMessage('')
    setSaveStatus('saving')
    update(next)
  }

  return { document, update, replace, reset, saveStatus, message, blocked }
}
