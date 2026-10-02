import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { generateCss } from '@/css/generate'
import type { FontFile } from '@/sources/google'

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
  files: FontFile[] = Object.values(state.filesMap).flat(),
): Record<string, string> {
  const refIds = (state.assetRefIds[env] ??= {})
  if (!state.cacheDir) return refIds
  for (const file of files) {
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

function fontUrls(
  state: PluginState,
  context: EmitContext,
  env: string,
  files: FontFile[],
): Record<string, string> {
  const refIds = state.command === 'build' ? emitFontAssets(state, context, env, files) : {}
  const urls: Record<string, string> = {}
  for (const { filename } of files) {
    if (state.command !== 'build') urls[filename] = `/__fonts/${filename}`
    else if (refIds[filename]) urls[filename] = `__VITE_ASSET__${refIds[filename]}__`
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

  const assetMap = fontUrls(state, context, env, Object.values(state.filesMap).flat())
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

  const { families } = state.config
  const selected = families.map((f) => selectPreloadFiles(f, state.filesMap[f.key] ?? []))
  // Emit only preloaded files, so server bundles do not get every font.
  const urls = fontUrls(state, context, env, selected.flat())

  const entries = families
    .map((f, i) => {
      const cssVar = JSON.stringify('var(' + f.variable + ')')
      const preloads = selected[i]!.filter((file) => urls[file.filename])
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
