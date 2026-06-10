import type { NormalizedOutputOptions, OutputBundle, PluginContext } from 'rolldown'

import type { PluginState } from './state'

function rewritePlaceholders(
  context: PluginContext,
  source: string,
  assetRefIds: PluginState['assetRefIds'],
): string {
  for (const [filename, refId] of Object.entries(assetRefIds)) {
    const placeholder = `__VITE_ASSET__${refId}__`
    if (!source.includes(placeholder)) continue
    try {
      source = source.replaceAll(placeholder, context.getFileName(refId))
      delete assetRefIds[filename]
    } catch {
      // refId not resolved yet — Vite will handle it
    }
  }
  return source
}

export function handleGenerateBundle(
  this: PluginContext,
  _options: NormalizedOutputOptions,
  bundle: OutputBundle,
  state: PluginState,
): void {
  if (state.command !== 'build') return

  for (const chunk of Object.values(bundle)) {
    if (chunk.type !== 'asset') continue
    if (typeof chunk.source !== 'string') continue
    if (!chunk.source.includes('__VITE_ASSET__')) continue
    chunk.source = rewritePlaceholders(this, chunk.source, state.assetRefIds)
  }
}
