import { classicTemplate } from './001'
import { modernTemplate } from './002'
import { primeAtsTemplate } from './005'
import { pureAtsTemplate } from './006'
import { sidebarTemplate } from './003'
import { traditionalTemplate } from './004'
import type { TemplateDefinition } from './types'

export function createTemplateRegistry(
  definitions: readonly TemplateDefinition[],
  defaultId: string,
) {
  const defaultTemplate = definitions.find(
    (template) => template.id === defaultId,
  )
  if (!defaultTemplate)
    throw new Error('The default template must be registered.')
  if (
    new Set(definitions.map((template) => template.id)).size !==
    definitions.length
  ) {
    throw new Error('Template IDs must be unique.')
  }
  if (definitions.some((template) => !/^\d{3,}$/.test(template.name))) {
    throw new Error('Template numbers must contain at least three digits.')
  }
  if (
    new Set(definitions.map((template) => template.name)).size !==
    definitions.length
  ) {
    throw new Error('Template numbers must be unique.')
  }
  return {
    templates: definitions,
    defaultId,
    resolve: (id: string): TemplateDefinition =>
      definitions.find((template) => template.id === id) ?? defaultTemplate,
  }
}

export const templateRegistry = createTemplateRegistry(
  [
    classicTemplate,
    modernTemplate,
    sidebarTemplate,
    traditionalTemplate,
    primeAtsTemplate,
    pureAtsTemplate,
  ],
  'modern',
)
