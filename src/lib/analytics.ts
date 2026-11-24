type AnalyticsWindow = Window & {
  dataLayer?: unknown[]
  gtag?: (...parameters: unknown[]) => void
}

export function initializeAnalytics() {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim()
  if (
    !import.meta.env.PROD ||
    !measurementId ||
    !/^G-[A-Z0-9]+$/.test(measurementId) ||
    document.getElementById('google-analytics')
  )
    return

  const analyticsWindow = window as AnalyticsWindow
  const dataLayer = (analyticsWindow.dataLayer ??= [])
  const gtag: (...parameters: unknown[]) => void = function () {
    dataLayer.push(arguments)
  }
  analyticsWindow.gtag = gtag
  gtag('js', new Date())
  gtag('config', measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_location: `${window.location.origin}${window.location.pathname}`,
    page_referrer: '',
    page_title: 'Siravuno',
  })

  const script = document.createElement('script')
  script.id = 'google-analytics'
  script.async = true
  script.referrerPolicy = 'no-referrer'
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.append(script)
}
