import { describe, expect, it } from 'vitest'

import { normalize } from '@/config/normalize'
import { generateCss } from '@/css/generate'
import type { FontMetrics } from '@/metrics/lookup'
import type { FontFile } from '@/sources/google'

const INTER_METRICS: FontMetrics = {
  capHeight: 768,
  ascent: 1984,
  descent: -494,
  lineGap: 0,
  unitsPerEm: 2048,
  xWidthAvg: 961,
  category: 'sans-serif',
}

const METRICS_MAP = { Inter: INTER_METRICS }

const INTER_FILES: FontFile[] = [
  {
    url: 'https://fonts.gstatic.com/inter-400.woff2',
    filename: 'inter-400-normal.woff2',
    family: 'Inter',
    weight: 400,
    style: 'normal',
  },
  {
    url: 'https://fonts.gstatic.com/inter-700.woff2',
    filename: 'inter-700-normal.woff2',
    family: 'Inter',
    weight: 700,
    style: 'normal',
  },
]

const ASSET_MAP: Record<string, string> = {
  'inter-400-normal.woff2': '/assets/inter-400-normal.abc123.woff2',
  'inter-700-normal.woff2': '/assets/inter-700-normal.def456.woff2',
}

describe('generateCss', () => {
  it('contains @font-face blocks for all files', () => {
    const { families } = normalize('Inter')
    const css = generateCss(families, { inter: INTER_FILES }, ASSET_MAP)
    expect(css).toContain('@font-face')
    expect(css.match(/@font-face/g)).toHaveLength(2)
  })

  it('uses hashed asset paths', () => {
    const { families } = normalize('Inter')
    const css = generateCss(families, { inter: INTER_FILES }, ASSET_MAP)
    expect(css).toContain('inter-400-normal.abc123.woff2')
    expect(css).toContain('inter-700-normal.def456.woff2')
  })

  it('includes :root css variable block', () => {
    const { families } = normalize('Inter')
    const css = generateCss(families, { inter: INTER_FILES }, ASSET_MAP)
    expect(css).toContain(':root')
    expect(css).toContain('--font-inter')
  })

  it('includes @theme inline block', () => {
    const { families } = normalize('Inter')
    const css = generateCss(families, { inter: INTER_FILES }, ASSET_MAP)
    expect(css).toContain('@theme inline')
  })

  it('includes sidecar @font-face when adjustFontFallback: true', () => {
    const { families } = normalize('Inter')
    const adjusted = families.map((f) => ({ ...f, adjustFontFallback: true }))
    const css = generateCss(adjusted, { inter: INTER_FILES }, ASSET_MAP, METRICS_MAP)
    expect(css).toContain("font-family: 'Inter Fallback'")
    expect(css).toContain("src: local('Arial')")
    expect(css).toContain('size-adjust:')
  })

  it('includes sidecar @font-face when adjustFontFallback is string', () => {
    const { families } = normalize('Inter')
    const adjusted = families.map((f) => ({ ...f, adjustFontFallback: 'Arial' }))
    const css = generateCss(adjusted, { inter: INTER_FILES }, ASSET_MAP, METRICS_MAP)
    expect(css).toContain("font-family: 'Inter Fallback'")
  })

  it(':root var includes fallback family when adjustFontFallback set', () => {
    const { families } = normalize('Inter')
    const adjusted = families.map((f) => ({ ...f, adjustFontFallback: true }))
    const css = generateCss(adjusted, { inter: INTER_FILES }, ASSET_MAP, METRICS_MAP)
    expect(css).toContain("'Inter Fallback'")
    expect(css).toContain(':root')
  })

  it('no sidecar @font-face when adjustFontFallback: false', () => {
    const { families } = normalize('Inter')
    const css = generateCss(families, { inter: INTER_FILES }, ASSET_MAP)
    expect(css).not.toContain('Inter Fallback')
  })
})
