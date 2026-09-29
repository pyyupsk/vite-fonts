import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { fonts } from '@/frameworks/astro/index'

const CSS = `@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/_astro/inter-400-abc123.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/_astro/inter-700-def456.woff2') format('woff2');
}`

let dir: string
const CSS_FILENAME_HERE = 'fonts.css'

beforeEach(() => {
  dir = join(tmpdir(), `vite-fonts-astro-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  mkdirSync(join(dir, 'writings'), { recursive: true })
  writeFileSync(join(dir, CSS_FILENAME_HERE), CSS)
  writeFileSync(
    join(dir, 'index.html'),
    '<html><head>\n  <link rel="stylesheet" href="/fonts.css" />\n</head><body></body></html>',
  )
  writeFileSync(
    join(dir, 'writings', 'post.html'),
    '<html><head>\n  <link rel="stylesheet" href="/fonts.css" />\n</head><body></body></html>',
  )
})

afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
})

describe('astro integration build:done', () => {
  it('injects preloads into all nested pages', async () => {
    const integration = fonts('Inter')
    const hook = integration.hooks?.['astro:build:done'] as unknown as (args: {
      dir: URL
    }) => void | Promise<void>
    await hook({ dir: pathToFileURL(`${dir}/`) })

    for (const page of [join(dir, 'index.html'), join(dir, 'writings', 'post.html')]) {
      const html = readFileSync(page, 'utf8')
      expect(html).toContain('rel="preload"')
      expect(html).toContain('/_astro/inter-400-abc123.woff2')
      expect(html).not.toContain('inter-700-def456')
      expect(html.indexOf('rel="preload"')).toBeGreaterThan(html.indexOf('<head>'))
    }
  })

  it('skips injection when inject is manual', async () => {
    const integration = fonts({ families: ['Inter'], inject: 'manual' })
    const hook = integration.hooks?.['astro:build:done'] as unknown as (args: {
      dir: URL
    }) => void | Promise<void>
    await hook({ dir: pathToFileURL(`${dir}/`) })
    expect(readFileSync(join(dir, 'index.html'), 'utf8')).not.toContain('rel="preload"')
  })
})
