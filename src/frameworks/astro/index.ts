import type { AstroIntegration } from 'astro'

import { fonts as fontsPlugin } from '../../index'
import type { FontsInput } from '../../types'

/**
 * Astro integration that downloads and self-hosts web fonts at build time.
 *
 * @param input - Font families to load. Accepts a family name, array of names, or full options object.
 * @returns Astro integration to pass to `integrations` in your Astro config.
 */
export function fonts(input: FontsInput): AstroIntegration {
  return {
    name: 'vite-fonts-astro',
    hooks: {
      'astro:config:setup': ({ updateConfig, addMiddleware }) => {
        updateConfig({ vite: { plugins: [fontsPlugin(input) as any] } })
        addMiddleware({
          entrypoint: '@pyyupsk/vite-fonts/astro/middleware',
          order: 'pre',
        })
      },
    },
  }
}
