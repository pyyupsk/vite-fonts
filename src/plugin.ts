import { createReadStream, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import type { Plugin } from 'vite'

import { generateCss } from '@/css/generate'
import type { FontsInput } from '@/types'

import { handleBuildStart } from './hooks/build-start'
import { handleConfigResolved } from './hooks/config-resolved'
import { handleGenerateBundle } from './hooks/generate-bundle'
import { handleLoad, handleLoadMeta } from './hooks/load'
import { handleResolveId } from './hooks/resolve-id'
import { createPluginState } from './hooks/state'
import { handleTransformIndexHtml } from './hooks/transform-html'

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

    async load(id) {
      return (await handleLoad(id, state, this)) ?? handleLoadMeta(id, state)
    },

    generateBundle(options, bundle) {
      handleGenerateBundle.call(this, options, bundle, state)
    },

    closeBundle() {
      if (state.command !== 'build' || !state.htmlInject || !state.outDir) return
      const inject = state.htmlInject
      let htmlFiles: string[]
      try {
        htmlFiles = readdirSync(state.outDir).filter((f) => f.endsWith('.html'))
      } catch {
        return
      }
      for (const file of htmlFiles) {
        const path = join(state.outDir, file)
        const html = readFileSync(path, 'utf8').replace('</head>', `${inject}\n  </head>`)
        writeFileSync(path, html)
      }
    },

    transformIndexHtml() {
      return handleTransformIndexHtml(state)
    },

    configureServer(server) {
      if (!state.cacheDir) return
      const fontsDir = state.cacheDir

      server.middlewares.use('/@pyyupsk/fonts', (_req, res, next) => {
        if (!state.config) return next()
        const assetMap: Record<string, string> = {}
        for (const files of Object.values(state.filesMap)) {
          for (const file of files) {
            assetMap[file.filename] = `/__fonts/${file.filename}`
          }
        }
        const css = generateCss(state.config.families, state.filesMap, assetMap, state.metricsMap)
        res.setHeader('Content-Type', 'text/css')
        res.end(css)
      })

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
