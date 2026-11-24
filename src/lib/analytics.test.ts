// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { initializeAnalytics } from './analytics'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  document.getElementById('google-analytics')?.remove()
})

it.each([undefined, '', 'not-an-id', 'G-123<script>'])(
  'does not load an invalid or absent ID: %s',
  (id) => {
    vi.stubEnv('PROD', true)
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', id)
    initializeAnalytics()
    expect(document.querySelector('script')).toBeNull()
  },
)

it('does not load analytics in development even with an ID', () => {
  vi.stubEnv('PROD', false)
  vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TEST123')
  initializeAnalytics()
  expect(document.querySelector('script')).toBeNull()
})

it('loads once and queues only a sanitized visit configuration', () => {
  vi.stubEnv('PROD', true)
  vi.stubEnv('VITE_GA_MEASUREMENT_ID', ' G-TEST123 ')
  const dataLayer: IArguments[] = []
  vi.stubGlobal('dataLayer', dataLayer)
  vi.stubGlobal('gtag', undefined)
  window.history.replaceState(
    {},
    '',
    '/resume/?email=private@example.com#secret',
  )
  initializeAnalytics()
  initializeAnalytics()
  const script = document.querySelector<HTMLScriptElement>('#google-analytics')!
  expect(script.src).toBe(
    'https://www.googletagmanager.com/gtag/js?id=G-TEST123',
  )
  expect(script.async).toBe(true)
  expect(script.referrerPolicy).toBe('no-referrer')
  expect(dataLayer.map((entry) => Array.from(entry))).toEqual([
    ['js', expect.any(Date)],
    [
      'config',
      'G-TEST123',
      {
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: `${window.location.origin}/resume/`,
        page_referrer: '',
        page_title: 'Siravuno',
      },
    ],
  ])
})
