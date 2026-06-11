import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

interface EmitContext {
  emitFile(emittedFile: { type: 'asset'; name: string; source: Uint8Array }): string
}

import { generateCss } from '@/css/generate'

import { META_RESOLVED_ID, RESOLVED_ID } from './resolve-id'
import type { PluginState } from './state'

export async function handleLoad(
  id: string,
  state: PluginState,
  context: EmitContext,
): Promise<string | null> {
  if (id !== RESOLVED_ID) return null
  if (!state.config || !state.cacheDir) return null

  const assetMap: Record<string, string> = {}

  const { cacheDir } = state

  if (state.command === 'build') {
    await Promise.all(
      Object.values(state.filesMap)
        .flat()
        .map(async (file) => {
          const bytes = await readFile(join(cacheDir, file.filename))
          const refId = context.emitFile({ type: 'asset', name: file.filename, source: bytes })
          state.assetRefIds[file.filename] = refId
          assetMap[file.filename] = `__VITE_ASSET__${refId}__`
        }),
    )
  } else {
    for (const files of Object.values(state.filesMap)) {
      for (const file of files) {
        assetMap[file.filename] = `/__fonts/${file.filename}`
      }
    }
  }

  return generateCss(state.config.families, state.filesMap, assetMap, state.metricsMap)
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
