import { ArrowRight, FileText } from 'lucide-react'
import { helpCopy } from './help-content.ts'
import { privacyCopy } from './privacy-content.ts'
import {
  languageNames,
  overviewCopy,
  previewFilename,
  publicLanguages,
  type PublicLanguage,
} from './content.ts'
import {
  galleryCopy,
  publicTemplateNumbers,
  type PublicTemplateNumber,
} from './template-content.ts'

export function TemplatePages({
  base,
  language,
  number,
}: {
  base: string
  language: PublicLanguage
  number?: PublicTemplateNumber
}) {
  const copy = galleryCopy[language]
  const common = overviewCopy[language]
  const template = number ? copy.templates[number] : undefined
  const path = number ? `templates/${number}/` : 'templates/'
  const title = template ? `${template.name} | ${copy.heading}` : copy.heading
  return (
    <html lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <meta
          name="description"
          content={template?.description ?? copy.description}
        />
        <link
          rel="canonical"
          href={`https://siravuno.com${base}${language}/${path}`}
        />
        {publicLanguages.map((alternative) => (
          <link
            key={alternative}
            rel="alternate"
            hrefLang={alternative}
            href={`https://siravuno.com${base}${alternative}/${path}`}
          />
        ))}
        <link rel="stylesheet" href={`${base}${language}/overview.css`} />
      </head>
      <body>
        <a className="skip-link" href="#templates">
          {common.skip}
        </a>
        <header className="site-header">
          <a
            className="wordmark"
            href={`${base}${language}/`}
            aria-label={common.heading}
          >
            <FileText size={24} aria-hidden="true" />
            <bdi>Siravuno</bdi>
          </a>
          <a className="builder-link" href={base}>
            {common.builder}
            <ArrowRight size={17} aria-hidden="true" />
          </a>
        </header>
        <nav className="language-navigation" aria-label={copy.navigation}>
          {publicLanguages.map((alternative) => (
            <a
              key={alternative}
              href={`${base}${alternative}/${path}`}
              lang={alternative}
              dir={alternative === 'ar' ? 'rtl' : 'ltr'}
              hrefLang={alternative}
              aria-current={alternative === language ? 'page' : undefined}
            >
              {languageNames[alternative]}
            </a>
          ))}
        </nav>
        <main id="templates">
          <div className="template-breadcrumb">
            <a href={`${base}${language}/`}>{copy.overview}</a>
            {number && (
              <a href={`${base}${language}/templates/`}>{copy.heading}</a>
            )}
          </div>
          <section className="introduction" aria-labelledby="page-title">
            <h1 id="page-title">{template?.name ?? copy.heading}</h1>
            <p className="lead">{template?.description ?? copy.description}</p>
          </section>
          {number && template ? (
            <>
              <figure className="template-example">
                <div className="sample-stage template-detail-stage">
                  <img
                    src={`${base}public-preview/${previewFilename(language, number)}`}
                    width="900"
                    height="1273"
                    alt={template.imageAlt}
                    fetchPriority="high"
                  />
                </div>
                <figcaption>
                  <span>{copy.previewHeading}</span>
                  <span>{common.fictional}</span>
                </figcaption>
              </figure>
              <section
                className="template-guidance"
                aria-labelledby="use-heading"
              >
                <h2 id="use-heading">{copy.useHeading}</h2>
                <p>{template.use}</p>
                <h2>{copy.limitationHeading}</h2>
                <p>{template.limitation}</p>
              </section>
            </>
          ) : (
            <section className="template-grid" aria-label={copy.heading}>
              {publicTemplateNumbers.map((candidate) => {
                const item = copy.templates[candidate]
                return (
                  <article key={candidate}>
                    <a
                      className="template-image-link"
                      href={`${base}${language}/templates/${candidate}/`}
                      aria-label={`${copy.detail}: ${item.name}`}
                    >
                      <img
                        src={`${base}public-preview/${previewFilename(language, candidate)}`}
                        width="900"
                        height="1273"
                        alt={item.imageAlt}
                        loading={candidate === '001' ? undefined : 'lazy'}
                      />
                    </a>
                    <h2>
                      <a href={`${base}${language}/templates/${candidate}/`}>
                        {item.name}
                      </a>
                    </h2>
                    <p>{item.description}</p>
                  </article>
                )
              })}
            </section>
          )}
          <section className="export-section" aria-labelledby="export-heading">
            <p>{copy.availability}</p>
            <h2 id="export-heading">{common.exportHeading}</h2>
            <p>{common.exportNote}</p>
            <p>{number ? copy.applyNote : copy.entryNote}</p>
            <a
              className="builder-link"
              href={number ? `${base}?template=${number}` : base}
            >
              {number ? copy.useTemplate : common.builder}
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          </section>
        </main>
        <footer className="site-footer">
          <bdi>Siravuno</bdi>
          <a href={`${base}${language}/templates/`}>{copy.heading}</a>
          <a href={`${base}${language}/help/`}>{helpCopy[language].heading}</a>
          <a href={`${base}${language}/privacy/`}>
            {privacyCopy[language].heading}
          </a>
        </footer>
      </body>
    </html>
  )
}
