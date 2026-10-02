import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { generateCss } from '@/css/generate'

import { selectPreloadFiles } from './inject-html'
import { META_RESOLVED_ID, RESOLVED_ID } from './resolve-id'
import type { PluginState } from './state'

export interface EmitContext {
  emitFile(emittedFile: { type: 'asset'; name: string; source: Uint8Array }): string
}

// Idempotent per environment: meta, CSS and generateBundle share one emit per font.
export function emitFontAssets(
  state: PluginState,
  context: EmitContext,
  env: string,
): Record<string, string> {
  const refIds = (state.assetRefIds[env] ??= {})
  if (!state.cacheDir) return refIds
  for (const file of Object.values(state.filesMap).flat()) {
    if (refIds[file.filename]) continue
    try {
      const source = readFileSync(join(state.cacheDir, file.filename))
      refIds[file.filename] = context.emitFile({ type: 'asset', name: file.filename, source })
    } catch {
      // missing file — skip
    }
  }
  return refIds
}

function fontUrls(state: PluginState, context: EmitContext, env: string): Record<string, string> {
  const urls: Record<string, string> = {}
  if (state.command === 'build') {
    for (const [filename, refId] of Object.entries(emitFontAssets(state, context, env))) {
      urls[filename] = `__VITE_ASSET__${refId}__`
    }
  } else {
    for (const file of Object.values(state.filesMap).flat()) {
      urls[file.filename] = `/__fonts/${file.filename}`
    }
  }
  return urls
}

export function handleLoad(
  id: string,
  state: PluginState,
  context: EmitContext,
  env = 'client',
): string | null {
  if (id !== RESOLVED_ID) return null
  if (!state.config || !state.cacheDir) return null

  const assetMap = fontUrls(state, context, env)
  return generateCss(state.config.families, state.filesMap, assetMap, state.metricsMap)
}

export function handleLoadMeta(
  id: string,
  state: PluginState,
  context: EmitContext,
  env = 'client',
): string | null {
  if (id !== META_RESOLVED_ID) return null
  if (!state.config) return null

  const urls = fontUrls(state, context, env)

  const entries = state.config.families
    .map((f) => {
      const cssVar = JSON.stringify('var(' + f.variable + ')')
      const preloads = selectPreloadFiles(f, state.filesMap[f.key] ?? [])
        .filter((file) => urls[file.filename])
        .map((file) => `{ href: ${JSON.stringify(urls[file.filename])}, type: "font/woff2" }`)
        .join(', ')
      return `  ${JSON.stringify(f.key)}: { family: ${JSON.stringify(f.family)}, variable: ${JSON.stringify(f.variable)}, cssVar: ${cssVar}, weights: ${JSON.stringify(f.weights)}, preloads: uniq([${preloads}]) }`
    })
    .join(',\n')

  // Weights can share one variable-font file.
  const uniq =
    'const uniq = (list) => list.filter((p, i) => list.findIndex((q) => q.href === p.href) === i);'
  return `${uniq}\nexport const fonts = {\n${entries}\n};\nexport const preloads = uniq(Object.values(fonts).flatMap((f) => f.preloads));\n`
}
