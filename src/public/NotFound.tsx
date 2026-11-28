import { ArrowRight, FileText } from 'lucide-react'
import { languageNames, overviewCopy, publicLanguages } from './content.ts'

const messages = {
  en: {
    heading: 'Page not found',
    description: 'This page may have moved, or the address may be incorrect.',
  },
  fr: {
    heading: 'Page introuvable',
    description:
      'Cette page a peut-être été déplacée, ou l’adresse est incorrecte.',
  },
  ar: {
    heading: 'الصفحة غير موجودة',
    description: 'ربما نُقلت هذه الصفحة، أو أن العنوان غير صحيح.',
  },
}

export function NotFound({ base }: { base: string }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <title>404 - Page not found | Siravuno</title>
        <link rel="stylesheet" href={`${base}en/overview.css`} />
      </head>
      <body>
        <a className="skip-link" href="#not-found">
          {overviewCopy.en.skip}
        </a>
        <header className="site-header">
          <a className="wordmark" href={`${base}en/`}>
            <FileText size={24} aria-hidden="true" />
            <bdi>Siravuno</bdi>
          </a>
        </header>
        <main id="not-found" className="not-found">
          <h1>
            404 <span>Page not found</span>
          </h1>
          <div className="not-found-languages">
            {publicLanguages.map((language) => (
              <section
                key={language}
                lang={language}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
                aria-labelledby={`missing-${language}`}
              >
                <h2 id={`missing-${language}`}>{messages[language].heading}</h2>
                <p>{messages[language].description}</p>
                <a className="builder-link" href={base}>
                  {overviewCopy[language].builder}
                  <ArrowRight size={17} aria-hidden="true" />
                </a>
                <a className="not-found-overview" href={`${base}${language}/`}>
                  <span lang="en">Siravuno</span> · {languageNames[language]}
                </a>
              </section>
            ))}
          </div>
        </main>
      </body>
    </html>
  )
}
