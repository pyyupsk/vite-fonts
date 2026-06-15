import type { FontMetrics } from '@/metrics/lookup'
import type { FontFile } from '@/sources/google'
import type { FontsConfig } from '@/types'

/** Mutable state shared across all Vite plugin hooks within a single build. */
export interface PluginState {
  config: FontsConfig | null
  cacheDir: string | null
  root: string | null
  outDir: string | null
  command: 'serve' | 'build'
  filesMap: Record<string, FontFile[]>
  metricsMap: Record<string, FontMetrics>
  assetRefIds: Record<string, string>
  htmlInject: string | null
}

export function createPluginState(): PluginState {
  return {
    config: null,
    cacheDir: null,
    root: null,
    outDir: null,
    command: 'serve',
    filesMap: {},
    metricsMap: {},
    assetRefIds: {},
    htmlInject: null,
  }
}
