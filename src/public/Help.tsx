import { ArrowRight, FileText } from 'lucide-react'
import {
  languageNames,
  overviewCopy,
  publicLanguages,
  type PublicLanguage,
} from './content.ts'
import { helpCopy } from './help-content.ts'
import { privacyCopy } from './privacy-content.ts'
import { galleryCopy } from './template-content.ts'

export function Help({
  base,
  language,
  page = 'help',
}: {
  base: string
  language: PublicLanguage
  page?: 'help' | 'privacy'
}) {
  const copy = page === 'privacy' ? privacyCopy[language] : helpCopy[language]
  const common = overviewCopy[language]
  return (
    <html lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{copy.heading}</title>
        <meta name="description" content={copy.description} />
        <link
          rel="canonical"
          href={`https://siravuno.com${base}${language}/${page}/`}
        />
        {publicLanguages.map((alternative) => (
          <link
            key={alternative}
            rel="alternate"
            hrefLang={alternative}
            href={`https://siravuno.com${base}${alternative}/${page}/`}
          />
        ))}
        <link rel="stylesheet" href={`${base}${language}/overview.css`} />
      </head>
      <body>
        <a className="skip-link" href="#help">
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
              href={`${base}${alternative}/${page}/`}
              lang={alternative}
              dir={alternative === 'ar' ? 'rtl' : 'ltr'}
              hrefLang={alternative}
              aria-current={alternative === language ? 'page' : undefined}
            >
              {languageNames[alternative]}
            </a>
          ))}
        </nav>
        <main id="help">
          <div className="template-breadcrumb">
            <a href={`${base}${language}/`}>{galleryCopy[language].overview}</a>
            <a href={`${base}${language}/templates/`}>
              {galleryCopy[language].heading}
            </a>
          </div>
          <section className="introduction" aria-labelledby="page-title">
            <h1 id="page-title">{copy.heading}</h1>
            <p className="lead">{copy.description}</p>
          </section>
          <nav className="help-contents" aria-label={copy.contents}>
            {copy.sections.map((section) => (
              <a key={section.id} href={`#${section.id}`}>
                {section.heading}
              </a>
            ))}
          </nav>
          <div className="help-sections">
            {copy.sections.map((section) => (
              <section key={section.id} aria-labelledby={section.id}>
                <h2 id={section.id}>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
          </div>
        </main>
        <footer className="site-footer">
          <bdi>Siravuno</bdi>
          <a
            href={`${base}${language}/${page === 'privacy' ? 'help' : 'privacy'}/`}
          >
            {page === 'privacy'
              ? helpCopy[language].heading
              : privacyCopy[language].heading}
          </a>
          <a className="builder-link" href={base}>
            {common.builder}
            <ArrowRight size={17} aria-hidden="true" />
          </a>
        </footer>
      </body>
    </html>
  )
}
