import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { normalize } from '@/config/normalize'
import {
  buildPreloadTags,
  collectHtmlFiles,
  injectIntoHtml,
  injectSnippetIntoHtmlFiles,
  parseFontFaceBlocks,
  preloadHrefsFromCss,
} from '@/hooks/inject-html'

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
}

@font-face {
  font-family: 'Fira Code';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/_astro/fira-400-ghi789.woff2') format('woff2');
}`

let dir: string

beforeEach(() => {
  dir = join(tmpdir(), `vite-fonts-inject-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  mkdirSync(join(dir, 'writings'), { recursive: true })
  writeFileSync(join(dir, 'index.html'), '<html><head></head><body></body></html>')
  writeFileSync(join(dir, 'writings', 'post.html'), '<html><head></head><body></body></html>')
})

afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
})

describe('parseFontFaceBlocks', () => {
  it('extracts family, weight, and url from each block', () => {
    const blocks = parseFontFaceBlocks(CSS)
    expect(blocks).toHaveLength(3)
    expect(blocks[0]).toEqual({
      family: 'Inter',
      weight: '400',
      url: '/_astro/inter-400-abc123.woff2',
    })
  })
})

describe('preloadHrefsFromCss', () => {
  it('preload: true picks weight 400 only per family', () => {
    const { families } = normalize(['Inter', 'Fira Code'])
    const hrefs = preloadHrefsFromCss(CSS, families)
    expect(hrefs).toEqual(['/_astro/inter-400-abc123.woff2', '/_astro/fira-400-ghi789.woff2'])
  })

  it('preload: false skips the family', () => {
    const { families, source, inject } = normalize(['Inter'])
    const config = {
      families: families.map((f) => ({ ...f, preload: false as const })),
      source,
      inject,
    }
    expect(preloadHrefsFromCss(CSS, config.families)).toEqual([])
  })

  it('preload: number[] picks matching weights', () => {
    const { families, source, inject } = normalize(['Inter'])
    const config = {
      families: families.map((f) => ({ ...f, preload: [400, 700] as number[] })),
      source,
      inject,
    }
    expect(preloadHrefsFromCss(CSS, config.families)).toEqual([
      '/_astro/inter-400-abc123.woff2',
      '/_astro/inter-700-def456.woff2',
    ])
  })

  it('dedupes repeated hrefs', () => {
    const { families } = normalize(['Inter'])
    expect(preloadHrefsFromCss(CSS, [...families, ...families])).toEqual([
      '/_astro/inter-400-abc123.woff2',
    ])
  })
})

describe('collectHtmlFiles', () => {
  it('finds nested html files recursively', () => {
    const files = collectHtmlFiles(dir).sort()
    expect(files).toEqual([join(dir, 'index.html'), join(dir, 'writings', 'post.html')].sort())
  })

  it('returns empty array for missing dir', () => {
    expect(collectHtmlFiles(join(dir, 'nope'))).toEqual([])
  })
})

describe('injectIntoHtml', () => {
  const sheet = '    <link rel="stylesheet" href="/fonts.css">'

  it('prepends preloads after <head> and stylesheet before </head>', () => {
    const tags = buildPreloadTags(['/_astro/a.woff2'])
    const out = injectIntoHtml('<html><head></head><body></body></html>', tags, sheet)
    expect(out.indexOf('rel="preload"')).toBeGreaterThan(out.indexOf('<head>'))
    expect(out.indexOf('rel="preload"')).toBeLessThan(out.indexOf('rel="stylesheet"'))
    expect(out).toContain('/fonts.css')
  })

  it('is idempotent on repeated application', () => {
    const tags = buildPreloadTags(['/_astro/a.woff2'])
    const once = injectIntoHtml('<html><head></head></html>', tags, sheet)
    const twice = injectIntoHtml(once, tags, sheet)
    expect(twice).toBe(once)
  })

  it('skips stylesheet when already present (middleware prerender case)', () => {
    const html = '<html><head>\n  <link rel="stylesheet" href="/fonts.css" />\n</head></html>'
    const out = injectIntoHtml(html, buildPreloadTags(['/_astro/a.woff2']), sheet)
    expect(out.match(/fonts\.css/g)).toHaveLength(1)
    expect(out).toContain('rel="preload"')
  })
})

describe('injectSnippetIntoHtmlFiles', () => {
  it('patches nested html files recursively', () => {
    const snippet = [
      '    <link rel="preload" as="font" type="font/woff2" href="/_astro/a.woff2" crossorigin>',
      '    <link rel="stylesheet" href="/fonts.css">',
    ].join('\n')
    injectSnippetIntoHtmlFiles(dir, snippet)
    for (const f of collectHtmlFiles(dir)) {
      const html = readFileSync(f, 'utf8')
      expect(html).toContain('rel="preload"')
      expect(html).toContain('/fonts.css')
    }
  })
})
