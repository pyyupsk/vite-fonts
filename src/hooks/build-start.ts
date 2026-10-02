import { ensureFonts } from '@/cache/manager'
import { generateDts } from '@/dts/generate'
import { stateNotInitializedError } from '@/errors/messages'
import { extractMetrics } from '@/metrics/extract'

import type { PluginState } from './state'

export async function handleBuildStart(state: PluginState): Promise<Error | null> {
  if (!state.config || !state.cacheDir || !state.root) {
    return stateNotInitializedError()
  }

  let result: Awaited<ReturnType<typeof ensureFonts>>
  try {
    result = await ensureFonts(state.config.families, state.config.source, state.cacheDir)
  } catch (e) {
    return e instanceof Error ? e : new Error(String(e))
  }

  const [err, manifest] = result
  if (err) return err

  state.filesMap = {}
  for (const family of state.config.families) {
    state.filesMap[family.key] = manifest.families[family.key]?.fontFiles ?? []
  }

  await Promise.all(
    state.config.families.map(async (family) => {
      const files = state.filesMap[family.key] ?? []
      const metrics = await extractMetrics(files, state.cacheDir!)
      if (metrics) state.metricsMap[family.family] = metrics
    }),
  )

  const dtsErr = await generateDts(state.config.families, state.root)
  if (dtsErr) return dtsErr

  return null
}
