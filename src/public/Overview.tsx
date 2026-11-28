import { ArrowRight, FileText } from 'lucide-react'
import {
  languageNames,
  overviewCopy,
  previewFilename,
  publicLanguages,
  type PublicLanguage,
} from './content.ts'
import { galleryCopy } from './template-content.ts'
import { helpCopy } from './help-content.ts'
import { privacyCopy } from './privacy-content.ts'

export function Overview({
  base,
  language = 'en',
}: {
  base: string
  language?: PublicLanguage
}) {
  const copy = overviewCopy[language]
  return (
    <html lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{copy.title}</title>
        <meta name="description" content={copy.description} />
        <link
          rel="canonical"
          href={`https://siravuno.com${base}${language}/`}
        />
        {publicLanguages.map((alternative) => (
          <link
            key={alternative}
            rel="alternate"
            hrefLang={alternative}
            href={`https://siravuno.com${base}${alternative}/`}
          />
        ))}
        <link rel="stylesheet" href={`${base}${language}/overview.css`} />
      </head>
      <body>
        <a className="skip-link" href="#overview">
          {copy.skip}
        </a>
        <header className="site-header">
          <a className="wordmark" href={base} aria-label={copy.heading}>
            <FileText size={24} aria-hidden="true" />
            <bdi>Siravuno</bdi>
          </a>
          <a className="builder-link" href={base}>
            {copy.builder} <ArrowRight size={17} aria-hidden="true" />
          </a>
        </header>
        <nav className="language-navigation" aria-label={copy.navigation}>
          {publicLanguages.map((alternative) => (
            <a
              key={alternative}
              href={`${base}${alternative}/`}
              lang={alternative}
              dir={alternative === 'ar' ? 'rtl' : 'ltr'}
              hrefLang={alternative}
              aria-current={alternative === language ? 'page' : undefined}
            >
              {languageNames[alternative]}
            </a>
          ))}
        </nav>
        <main id="overview">
          <section className="introduction" aria-labelledby="page-title">
            <p className="eyebrow">{copy.languages}</p>
            <h1 id="page-title">{copy.heading}</h1>
            <p className="lead">{copy.lead}</p>
            <p className="language-note">{copy.languageNote}</p>
          </section>
          <figure className="template-example">
            <div className="sample-stage">
              <img
                src={`${base}public-preview/${previewFilename(language)}`}
                width="900"
                height="1273"
                alt={copy.imageAlt}
                fetchPriority="high"
              />
            </div>
            <figcaption>
              <span>{copy.template}</span>
              <span>{copy.fictional}</span>
            </figcaption>
          </figure>
          <section className="facts" aria-labelledby="cv-heading">
            <h2 id="cv-heading">{copy.factsHeading}</h2>
            <div className="facts-grid">
              {copy.facts.map((fact, index) => (
                <article key={fact.heading}>
                  <span className="fact-number" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3>{fact.heading}</h3>
                  <p>{fact.body}</p>
                </article>
              ))}
            </div>
          </section>
          <section
            className="storage-section"
            aria-labelledby="storage-heading"
          >
            <div>
              <p className="eyebrow">{copy.draft}</p>
              <h2 id="storage-heading">
                {copy.storageHeading[0]}
                <br />
                {copy.storageHeading[1]}
              </h2>
            </div>
            <div className="storage-copy">
              {copy.storage.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
          <section className="export-section" aria-labelledby="export-heading">
            <p>
              <a href={`${base}${language}/templates/`}>
                {galleryCopy[language].heading}
              </a>
            </p>
            <h2 id="export-heading">{copy.exportHeading}</h2>
            <p>{copy.exportNote}</p>
            <a className="builder-link" href={base}>
              {copy.builder} <ArrowRight size={17} aria-hidden="true" />
            </a>
          </section>
        </main>
        <footer className="site-footer">
          <bdi>Siravuno</bdi>
          <a href={`${base}${language}/help/`}>{helpCopy[language].heading}</a>
          <a href={`${base}${language}/privacy/`}>
            {privacyCopy[language].heading}
          </a>
          <span>{copy.footer}</span>
        </footer>
      </body>
    </html>
  )
}
