import { classicTemplate } from './classic'
import { modernTemplate } from './modern'
import { sidebarTemplate } from './sidebar'
import { traditionalTemplate } from './traditional'
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
  return {
    templates: definitions,
    defaultId,
    resolve: (id: string): TemplateDefinition =>
      definitions.find((template) => template.id === id) ?? defaultTemplate,
  }
}

export const templateRegistry = createTemplateRegistry(
  [classicTemplate, modernTemplate, sidebarTemplate, traditionalTemplate],
  'modern',
)
