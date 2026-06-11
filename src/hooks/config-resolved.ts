import { join } from 'node:path'

import type { ResolvedConfig } from 'vite'

import { normalize } from '@/config/normalize'
import { setLogger } from '@/logger'
import type { FontsInput } from '@/types'

import type { PluginState } from './state'

export function handleConfigResolved(
  viteConfig: ResolvedConfig,
  input: FontsInput,
  state: PluginState,
): void {
  setLogger(viteConfig.logger)
  state.config = normalize(input)
  state.cacheDir = join(viteConfig.cacheDir, 'fonts')
  state.root = viteConfig.root
  state.command = viteConfig.command
  state.outDir = viteConfig.build.outDir
    ? join(viteConfig.root, viteConfig.build.outDir)
    : join(viteConfig.root, 'dist')
}
