import { useEffect, useState } from 'react'
import { createDocument } from '../domain/cv/defaults'
import type { CvDocument } from '../domain/cv/types'
import type { Language } from '../i18n/messages'
import {
  clearDocument,
  LANGUAGE_PREFERENCE_KEY,
  loadDocument,
  saveDocument,
  type StoragePort,
  type WriteResult,
} from '../lib/storage/cv-storage'
import { templateRegistry } from '../templates/registry'

function initialize(storage?: StoragePort) {
  const preferred = typeof navigator === 'undefined' ? [] : navigator.languages
  const language =
    preferred
      .map((value) => value.toLowerCase().split('-')[0])
      .find((value) => value === 'en' || value === 'fr' || value === 'ar') ??
    'en'
  const fallback = createDocument(templateRegistry.defaultId, language)
  try {
    const port = storage ?? window.localStorage
    const loaded = loadDocument(port)
    if (loaded.status === 'blocked') {
      return {
        document: fallback,
        blocked: true,
        message: loaded.message,
        choosingLanguage: false,
      }
    }
    const preference =
      loaded.status === 'empty' ? port.getItem(LANGUAGE_PREFERENCE_KEY) : null
    const hasPreference =
      preference === 'en' || preference === 'fr' || preference === 'ar'
    if (hasPreference) fallback.appearance.language = preference
    const document = loaded.status === 'ready' ? loaded.document : fallback
    document.appearance.templateId = templateRegistry.resolve(
      document.appearance.templateId,
    ).id
    return {
      document,
      blocked: false,
      message: '',
      choosingLanguage: loaded.status === 'empty' && !hasPreference,
    }
  } catch {
    return {
      document: fallback,
      blocked: true,
      choosingLanguage: false,
      message:
        'Browser storage is unavailable. You can still edit and download your CV, but changes will not be saved.',
    }
  }
}

function persistDocument(
  storage: StoragePort | undefined,
  document: CvDocument,
): WriteResult {
  try {
    const port = storage ?? window.localStorage
    const result = saveDocument(port, document)
    if (result.ok) {
      port.setItem(LANGUAGE_PREFERENCE_KEY, document.appearance.language)
    }
    return result
  } catch {
    return {
      ok: false,
      message:
        'Browser storage is unavailable. Download a backup before closing this tab.',
    }
  }
}

export function useCvDocument(storage?: StoragePort) {
  const [initial] = useState(() => initialize(storage))
  const [document, setDocument] = useState(initial.document)
  const [blocked, setBlocked] = useState(initial.blocked)
  const [message, setMessage] = useState(initial.message)
  const [choosingLanguage, setChoosingLanguage] = useState(
    initial.choosingLanguage,
  )
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error'>(
    initial.blocked ? 'error' : 'saving',
  )

  useEffect(() => {
    if (blocked || choosingLanguage) return
    const save = () => {
      const result = persistDocument(storage, document)
      setSaveStatus(result.ok ? 'saved' : 'error')
      setMessage(result.ok ? '' : result.message)
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
  }, [document, blocked, choosingLanguage, storage])

  function chooseLanguage(language: Language) {
    const next = {
      ...document,
      appearance: { ...document.appearance, language },
    }
    setDocument(next)
    setChoosingLanguage(false)
    const result = persistDocument(storage, next)
    setSaveStatus(result.ok ? 'saved' : 'error')
    setMessage(result.ok ? '' : result.message)
  }

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
      const port = storage ?? window.localStorage
      port.setItem(LANGUAGE_PREFERENCE_KEY, document.appearance.language)
      const result = clearDocument(port)
      if (!result.ok) {
        setMessage(result.message)
        return false
      }
      setBlocked(false)
      setChoosingLanguage(false)
      setMessage('')
      setSaveStatus('saving')
      setDocument(
        createDocument(
          templateRegistry.defaultId,
          document.appearance.language,
        ),
      )
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
    setChoosingLanguage(false)
    setMessage('')
    setSaveStatus('saving')
    update(next)
  }

  return {
    document,
    update,
    replace,
    reset,
    saveStatus,
    message,
    blocked,
    choosingLanguage,
    chooseLanguage,
  }
}
