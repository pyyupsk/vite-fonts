import type { HtmlTagDescriptor } from 'vite'

import type { FontFile } from '@/sources/google'
import type { NormalizedFamily } from '@/types'

import type { PluginState } from './state'

function preloadFiles(family: NormalizedFamily, files: FontFile[]): FontFile[] {
  if (family.preload === false) return []
  if (family.preload === true) {
    const first = files.find((f) => f.weight === 400) ?? files[0]
    return first ? [first] : []
  }
  return files.filter((f) => (family.preload as number[]).includes(f.weight as number))
}

export function handleTransformIndexHtml(state: PluginState): HtmlTagDescriptor[] {
  if (state.config?.inject !== 'auto') return []
  if (state.command === 'build') return []

  const tags: HtmlTagDescriptor[] = []

  for (const family of state.config.families) {
    const files = state.filesMap[family.key] ?? []
    for (const file of preloadFiles(family, files)) {
      tags.push({
        tag: 'link',
        attrs: {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: `/__fonts/${file.filename}`,
          crossorigin: true,
        },
        injectTo: 'head-prepend',
      })
    }
  }

  tags.push({
    tag: 'link',
    attrs: { rel: 'stylesheet', href: '/@pyyupsk/fonts' },
    injectTo: 'head',
  })

  return tags
}
