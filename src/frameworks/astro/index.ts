import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import type { Dirent } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { AstroIntegration } from 'astro'

import { normalize } from '@/config/normalize'
import {
  buildPreloadTags,
  collectHtmlFiles,
  injectIntoHtml,
  preloadHrefsFromCss,
} from '@/hooks/inject-html'

import { fonts as fontsPlugin } from '../../index'
import type { FontsInput } from '../../types'

const CSS_FILENAME = 'fonts.css'
const STYLESHEET_TAG = `    <link rel="stylesheet" href="/${CSS_FILENAME}">`

function findFontsCss(outDir: string): string | null {
  const direct = join(outDir, CSS_FILENAME)
  if (existsSync(direct)) return direct
  const client = join(outDir, 'client', CSS_FILENAME)
  if (existsSync(client)) return client
  let entries: Dirent[]
  try {
    entries = readdirSync(outDir, { withFileTypes: true })
  } catch {
    return null
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const nested = join(outDir, entry.name, CSS_FILENAME)
    if (existsSync(nested)) return nested
  }
  return null
}

function injectPreloads(outDir: string, input: FontsInput): void {
  const config = normalize(input)
  if (config.inject !== 'auto') return

  const cssPath = findFontsCss(outDir)
  if (!cssPath) return
  const css = readFileSync(cssPath, 'utf8')
  const preloadTags = buildPreloadTags(preloadHrefsFromCss(css, config.families))
  for (const file of collectHtmlFiles(outDir)) {
    const html = readFileSync(file, 'utf8')
    const next = injectIntoHtml(html, preloadTags, STYLESHEET_TAG)
    if (next !== html) writeFileSync(file, next)
  }
}

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
      'astro:build:done': ({ dir }) => {
        injectPreloads(fileURLToPath(dir), input)
      },
    },
  }
}
