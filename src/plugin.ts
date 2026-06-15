import { createReadStream, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import type { PluginOption } from 'vite'

import { generateCss } from '@/css/generate'
import type { FontsInput } from '@/types'

import { handleBuildStart } from './hooks/build-start'
import { handleConfigResolved } from './hooks/config-resolved'
import { handleGenerateBundle } from './hooks/generate-bundle'
import { handleLoad, handleLoadMeta } from './hooks/load'
import { RESOLVED_ID, handleResolveId } from './hooks/resolve-id'
import { createPluginState } from './hooks/state'
import { handleTransformIndexHtml } from './hooks/transform-html'

export type { PluginState } from './hooks/state'

/**
 * Vite plugin that downloads and self-hosts web fonts at build time.
 *
 * @param input - Font families to load. Accepts a family name, array of names, or full options object.
 * @returns Vite plugin option to pass to `plugins` in your Vite config.
 */
export function fonts(input: FontsInput): PluginOption {
  const state = createPluginState()

  return {
    name: 'vite-fonts',
    enforce: 'pre',
    sharedDuringBuild: true,

    applyToEnvironment(env) {
      return env.name === 'client' || env.name === 'server' || env.name === 'ssr'
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
      if (this.environment?.name !== 'client') {
        if (id === RESOLVED_ID) return ''
        return handleLoadMeta(id, state)
      }
      return (await handleLoad(id, state, this)) ?? handleLoadMeta(id, state)
    },

    generateBundle(options, bundle) {
      const envName = this.environment?.name
      if (envName && envName !== 'client') return
      handleGenerateBundle.call(this, options, bundle, state)
    },

    closeBundle() {
      const envName = this.environment?.name
      if (envName && envName !== 'client') return
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

      const serveFontsCss = (
        _req: unknown,
        res: import('node:http').ServerResponse,
        next: () => void,
      ) => {
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
      }

      server.middlewares.use('/@pyyupsk/fonts', serveFontsCss)
      server.middlewares.use('/fonts.css', serveFontsCss)

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
