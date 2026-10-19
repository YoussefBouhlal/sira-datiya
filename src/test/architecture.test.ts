import { readdirSync, readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import ts from 'typescript'
import { expect, it } from 'vitest'

const sourceRoot = resolve(import.meta.dirname, '..')

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory()
      ? sourceFiles(path)
      : /\.(ts|tsx)$/.test(entry.name) && !entry.name.includes('.test.')
        ? [path]
        : []
  })
}

it('keeps domain, feature and template ownership boundaries intact', () => {
  const violations: string[] = []
  for (const path of sourceFiles(sourceRoot)) {
    const source = ts.createSourceFile(
      path,
      readFileSync(path, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    )
    const from = relative(sourceRoot, path).split('/')
    function visit(node: ts.Node) {
      let specifier: string | undefined
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        specifier = node.moduleSpecifier.text
      } else if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments[0] &&
        ts.isStringLiteral(node.arguments[0])
      ) {
        specifier = node.arguments[0].text
      }
      if (specifier) {
        const target = specifier.startsWith('.')
          ? relative(sourceRoot, resolve(dirname(path), specifier)).split('/')
          : [specifier]
        const fail = () =>
          violations.push(`${relative(sourceRoot, path)} -> ${specifier}`)
        if (
          from[0] === 'domain' &&
          [
            'app',
            'features',
            'templates',
            'lib',
            'components',
            'react',
            'react-dom',
            '@react-pdf/renderer',
          ].includes(target[0] ?? '')
        )
          fail()
        if (
          from[0] === 'features' &&
          target[0] === 'features' &&
          from[1] !== target[1]
        )
          fail()
        if (
          from[0] === 'features' &&
          ['app', 'lib'].includes(target[0] ?? '') &&
          target[1] !== 'download'
        )
          fail()
        if (
          from[0] === 'features' &&
          target[0] === 'templates' &&
          target[1] !== 'types'
        )
          fail()
        if (
          from[0] === 'templates' &&
          ['app', 'features', 'lib', 'components'].includes(target[0] ?? '')
        )
          fail()
        if (
          from[0] === 'templates' &&
          from.length > 2 &&
          target[0] === 'templates' &&
          target[1] !== from[1] &&
          target[1] !== 'shared' &&
          target[1] !== 'types'
        )
          fail()
        if (
          from[0] === 'lib' &&
          from[1] === 'storage' &&
          ['app', 'features', 'templates'].includes(target[0] ?? '')
        )
          fail()
        if (
          from[0] === 'components' &&
          ['app', 'domain', 'features', 'templates', 'lib'].includes(
            target[0] ?? '',
          )
        )
          fail()
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
  }
  expect(violations).toEqual([])
})
