import { ensureFonts } from '@/cache/manager'

import type { PluginState } from './state'

export async function handleBuildStart(state: PluginState): Promise<Error | null> {
  if (!state.config || !state.cacheDir) {
    return new Error('[vite-fonts] Plugin state not initialized — configResolved must run first')
  }

  let result: Awaited<ReturnType<typeof ensureFonts>>
  try {
    result = await ensureFonts(state.config.families, state.config.source, state.cacheDir)
  } catch (e) {
    return e instanceof Error ? e : new Error(String(e))
  }

  const [err, manifest] = result
  if (err) return err

  for (const [key, entry] of Object.entries(manifest.families)) {
    state.filesMap[key] = entry.fontFiles ?? []
  }

  return null
}
