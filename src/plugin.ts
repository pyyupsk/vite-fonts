import { createReadStream } from 'node:fs'
import { join } from 'node:path'

import type { Plugin } from 'vite'

import type { FontsInput } from '@/types'

import { handleBuildStart } from './hooks/build-start'
import { handleConfigResolved } from './hooks/config-resolved'
import { handleLoad, handleLoadMeta } from './hooks/load'
import { handleResolveId } from './hooks/resolve-id'
import { createPluginState } from './hooks/state'

export type { PluginState } from './hooks/state'

export function fonts(input: FontsInput): Plugin {
  const state = createPluginState()

  return {
    name: 'vite-fonts',
    enforce: 'pre',
    sharedDuringBuild: true,

    applyToEnvironment(env) {
      return env.name === 'client'
    },

    configResolved(config) {
      handleConfigResolved(config, input, state)
    },

    async buildStart() {
      const err = await handleBuildStart(state)
      if (err) throw err
    },

    resolveId: {
      filter: { id: /^@pyyupsk\/fonts/ },
      handler(id) {
        return handleResolveId(id)
      },
    },

    load(id) {
      return handleLoad(id, state) ?? handleLoadMeta(id, state)
    },

    configureServer(server) {
      if (!state.cacheDir) return
      const fontsDir = state.cacheDir
      server.middlewares.use('/__fonts', (req, res, next) => {
        const filename = req.url?.slice(1)
        if (!filename) return next()
        const filepath = join(fontsDir, filename)
        res.setHeader('Content-Type', 'font/woff2')
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        const stream = createReadStream(filepath)
        stream.on('error', () => next())
        stream.pipe(res)
      })
    },
  }
}
