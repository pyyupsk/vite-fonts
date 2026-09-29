import type { HtmlTagDescriptor } from 'vite'

import { selectPreloadFiles } from './inject-html'
import type { PluginState } from './state'

export function handleTransformIndexHtml(state: PluginState): HtmlTagDescriptor[] {
  if (state.config?.inject !== 'auto') return []
  if (state.command === 'build') return []

  const tags: HtmlTagDescriptor[] = []

  for (const family of state.config.families) {
    const files = state.filesMap[family.key] ?? []
    for (const file of selectPreloadFiles(family, files)) {
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
