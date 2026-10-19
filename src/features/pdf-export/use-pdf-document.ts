import { useEffect, useRef, useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import type { Appearance, CvData } from '../../domain/cv/types'
import type { TemplateDefinition } from '../../templates/types'

export function usePdfDocument(
  cv: CvData,
  appearance: Appearance,
  template: TemplateDefinition,
) {
  const [result, setResult] = useState<{
    cv: CvData
    appearance: Appearance
    template: TemplateDefinition
    blob: Blob | null
    error: string
  } | null>(null)
  const queue = useRef(Promise.resolve())

  useEffect(() => {
    let cancelled = false
    const timer = window.setTimeout(() => {
      queue.current = queue.current.then(async () => {
        if (cancelled) return
        try {
          const render = await template.load()
          if (cancelled) return
          const next = await pdf(render({ cv, appearance })).toBlob()
          if (!cancelled)
            setResult({ cv, appearance, template, blob: next, error: '' })
        } catch {
          if (!cancelled)
            setResult({
              cv,
              appearance,
              template,
              blob: null,
              error:
                'The PDF could not be generated. Your CV content is still saved. Try another template or reload the page.',
            })
        }
      })
    }, 500)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [cv, appearance, template])

  const loading =
    result?.cv !== cv ||
    result?.appearance !== appearance ||
    result?.template !== template
  return {
    blob: result?.blob ?? null,
    loading,
    error: loading ? '' : (result?.error ?? ''),
  }
}
