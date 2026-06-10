import type { FontFile } from '@/sources/google'
import type { FontsConfig } from '@/types'

export interface PluginState {
  config: FontsConfig | null
  cacheDir: string | null
  root: string | null
  command: 'serve' | 'build'
  filesMap: Record<string, FontFile[]>
}

export function createPluginState(): PluginState {
  return {
    config: null,
    cacheDir: null,
    root: null,
    command: 'serve',
    filesMap: {},
  }
}
