import type { AstroIntegration } from 'astro'

import { fonts as fontsPlugin } from './index'
import type { FontsInput } from './types'

export function fonts(input: FontsInput): AstroIntegration {
  return {
    name: 'vite-fonts-astro',
    hooks: {
      'astro:config:setup': ({ updateConfig, addMiddleware }) => {
        updateConfig({ vite: { plugins: [fontsPlugin(input)] } })
        addMiddleware({
          entrypoint: '@pyyupsk/vite-fonts/middleware',
          order: 'pre',
        })
      },
    },
  }
}
