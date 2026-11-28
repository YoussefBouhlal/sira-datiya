import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Plugin, ViteDevServer } from 'vite'
import { Overview } from './Overview.tsx'
import { TemplatePages } from './TemplatePages.tsx'
import { Help } from './Help.tsx'
import { NotFound } from './NotFound.tsx'
import { publicLanguages, type PublicLanguage } from './content.ts'
import { publicPagePaths, publicTemplateNumbers } from './template-content.ts'

export function publicOverview(base: string): Plugin {
  const pages = publicLanguages.flatMap((language: PublicLanguage) => [
    {
      path: `${language}/`,
      element: createElement(Overview, { base, language }),
    },
    {
      path: `${language}/templates/`,
      element: createElement(TemplatePages, { base, language }),
    },
    {
      path: `${language}/help/`,
      element: createElement(Help, { base, language }),
    },
    {
      path: `${language}/privacy/`,
      element: createElement(Help, { base, language, page: 'privacy' }),
    },
    ...publicTemplateNumbers.map((number) => ({
      path: `${language}/templates/${number}/`,
      element: createElement(TemplatePages, { base, language, number }),
    })),
  ])
  const html = (element: (typeof pages)[number]['element']) =>
    `<!doctype html>${renderToStaticMarkup(element)}`
  const notFoundHtml = html(createElement(NotFound, { base }))
  const htmlPaths = new Set([
    '/index.html',
    '/404.html',
    ...pages.map((page) => `/${page.path}index.html`),
  ])
  const installNotFound =
    (server: Pick<ViteDevServer, 'middlewares'>) => () => {
      server.middlewares.use((request, response, next) => {
        const path = new URL(request.url || '/', 'http://localhost').pathname
        if (
          htmlPaths.has(path) ||
          !['GET', 'HEAD'].includes(request.method || '') ||
          !request.headers.accept?.includes('text/html')
        )
          return next()
        response.statusCode = 404
        response.setHeader('Content-Type', 'text/html; charset=utf-8')
        response.end(request.method === 'HEAD' ? undefined : notFoundHtml)
      })
    }
  const resources = [
    {
      fileName: '404.html',
      contentType: 'text/html; charset=utf-8',
      source: notFoundHtml,
    },
    ...publicLanguages.map((language) => ({
      fileName: `${language}/overview.css`,
      contentType: 'text/css; charset=utf-8',
      source: readFileSync(new URL('./overview.css', import.meta.url)),
    })),
    ...publicLanguages.flatMap((language) =>
      [
        ['dm-sans', 'dm-sans-latin-400-normal.woff2'],
        ['newsreader', 'newsreader-latin-400-normal.woff2'],
      ].map(([family, filename]) => ({
        fileName: `${language}/${family}.woff2`,
        contentType: 'font/woff2',
        source: readFileSync(
          new URL(
            `../../node_modules/@fontsource/${family}/files/${filename}`,
            import.meta.url,
          ),
        ),
      })),
    ),
    {
      fileName: 'robots.txt',
      contentType: 'text/plain; charset=utf-8',
      source: `User-agent: *\nAllow: /\n\nSitemap: https://siravuno.com${base}sitemap.xml\n`,
    },
    {
      fileName: 'sitemap.xml',
      contentType: 'application/xml; charset=utf-8',
      source: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${publicLanguages.flatMap((language) => publicPagePaths.map((path) => `<url><loc>https://siravuno.com${base}${language}/${path}</loc></url>`)).join('')}</urlset>`,
    },
  ]
  return {
    name: 'siravuno-public-overview',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const path = new URL(request.url || '/', 'http://localhost').pathname
        const resource = resources.find(
          (entry) => path === `${base}${entry.fileName}`,
        )
        if (resource) {
          response.setHeader('Content-Type', resource.contentType)
          response.end(resource.source)
          return
        }
        const page = pages.find(
          (candidate) =>
            path === `${base}${candidate.path}` ||
            path === `${base}${candidate.path.slice(0, -1)}`,
        )
        if (!page) return next()
        response.setHeader('Content-Type', 'text/html; charset=utf-8')
        response.end(html(page.element))
      })
      return installNotFound(server)
    },
    configurePreviewServer: installNotFound,
    generateBundle() {
      for (const page of pages)
        this.emitFile({
          type: 'asset',
          fileName: `${page.path}index.html`,
          source: html(page.element),
        })
      for (const resource of resources) {
        this.emitFile({
          type: 'asset',
          fileName: resource.fileName,
          source: resource.source,
        })
      }
    },
  }
}
