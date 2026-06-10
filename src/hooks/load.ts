import { generateCss } from '@/css/generate'

import { META_RESOLVED_ID, RESOLVED_ID } from './resolve-id'
import type { PluginState } from './state'

export function handleLoad(id: string, state: PluginState): string | null {
  if (id !== RESOLVED_ID) return null
  if (!state.config) return null

  const assetMap: Record<string, string> = {}

  for (const files of Object.values(state.filesMap)) {
    for (const file of files) {
      assetMap[file.filename] =
        state.command === 'serve' ? `/__fonts/${file.filename}` : file.filename
    }
  }

  return generateCss(state.config.families, state.filesMap, assetMap)
}

export function handleLoadMeta(id: string, state: PluginState): string | null {
  if (id !== META_RESOLVED_ID) return null
  if (!state.config) return null

  const entries = state.config.families
    .map((f) => {
      const cssVar = JSON.stringify('var(' + f.variable + ')')
      return `  ${JSON.stringify(f.key)}: { family: ${JSON.stringify(f.family)}, variable: ${JSON.stringify(f.variable)}, cssVar: ${cssVar}, weights: ${JSON.stringify(f.weights)} }`
    })
    .join(',\n')

  return `export const fonts = {\n${entries}\n};\n`
}
