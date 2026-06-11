import { describe, expect, it } from 'vitest'

import { buildFallbackFontFace } from '@/css/fallback'
import { computeOverrides, getFallbackMetrics } from '@/metrics/lookup'
import type { FontMetrics } from '@/metrics/lookup'

const INTER: FontMetrics = {
  capHeight: 768,
  ascent: 1984,
  descent: -494,
  lineGap: 0,
  unitsPerEm: 2048,
  xWidthAvg: 961,
  category: 'sans-serif',
}

function interArialOverrides() {
  return computeOverrides(INTER, getFallbackMetrics('Arial')!)
}

describe('buildFallbackFontFace', () => {
  it('contains @font-face', () => {
    const css = buildFallbackFontFace('Inter', 'Arial', interArialOverrides())
    expect(css).toContain('@font-face')
  })

  it('sets font-family to "<Family> Fallback"', () => {
    const css = buildFallbackFontFace('Inter', 'Arial', interArialOverrides())
    expect(css).toContain("font-family: 'Inter Fallback'")
  })

  it('uses local() src for system font', () => {
    const css = buildFallbackFontFace('Inter', 'Arial', interArialOverrides())
    expect(css).toContain("src: local('Arial')")
  })

  it('includes size-adjust', () => {
    const css = buildFallbackFontFace('Inter', 'Arial', interArialOverrides())
    expect(css).toContain('size-adjust:')
  })

  it('includes ascent-override', () => {
    const css = buildFallbackFontFace('Inter', 'Arial', interArialOverrides())
    expect(css).toContain('ascent-override:')
  })

  it('includes descent-override', () => {
    const css = buildFallbackFontFace('Inter', 'Arial', interArialOverrides())
    expect(css).toContain('descent-override:')
  })

  it('includes line-gap-override', () => {
    const css = buildFallbackFontFace('Inter', 'Arial', interArialOverrides())
    expect(css).toContain('line-gap-override:')
  })
})
