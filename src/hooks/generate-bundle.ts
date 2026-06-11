import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { generateCss } from '@/css/generate'
import type { FontFile } from '@/sources/google'
import type { NormalizedFamily } from '@/types'

import type { PluginState } from './state'

interface BundleContext {
  emitFile(file: { type: 'asset'; name: string; source: string | Uint8Array }): string
  getFileName(referenceId: string): string
}

type OutputBundle = Record<string, { type: string; source?: string | Uint8Array }>

function preloadFiles(family: NormalizedFamily, files: FontFile[]): FontFile[] {
  if (family.preload === false) return []
  if (family.preload === true) {
    const first = files.find((f) => f.weight === 400) ?? files[0]
    return first ? [first] : []
  }
  return files.filter((f) => (family.preload as number[]).includes(f.weight as number))
}

export function handleGenerateBundle(
  this: BundleContext,
  _options: unknown,
  _bundle: OutputBundle,
  state: PluginState,
): void {
  if (state.command !== 'build') return
  if (!state.config || !state.cacheDir) return

  // 1. Emit WOFF2 font files as assets
  const assetMap: Record<string, string> = {}
  for (const files of Object.values(state.filesMap)) {
    for (const file of files) {
      if (assetMap[file.filename]) continue
      try {
        const bytes = readFileSync(join(state.cacheDir, file.filename))
        const refId = this.emitFile({ type: 'asset', name: file.filename, source: bytes })
        assetMap[file.filename] = '/' + this.getFileName(refId)
      } catch {
        // missing file — skip
      }
    }
  }

  // 2. Generate fonts CSS with resolved asset paths
  const css = generateCss(state.config.families, state.filesMap, assetMap, state.metricsMap)

  // 3. Emit fonts CSS asset
  const cssRefId = this.emitFile({ type: 'asset', name: 'fonts.css', source: css })
  const cssFinalName = this.getFileName(cssRefId)

  // 4. Build HTML inject snippet — stored for closeBundle to apply to HTML files on disk
  const preloadTags = state.config.families
    .flatMap((family) =>
      preloadFiles(family, state.filesMap[family.key] ?? []).map((file) => {
        const href = assetMap[file.filename] ?? file.filename
        return `    <link rel="preload" as="font" type="font/woff2" href="${href}" crossorigin>`
      }),
    )
    .join('\n')

  const stylesheetTag = `    <link rel="stylesheet" href="/${cssFinalName}">`

  state.htmlInject = [preloadTags, stylesheetTag].filter(Boolean).join('\n')
}
