import { describe, expect, it } from 'vitest'

import { buildFontFace } from '@/css/font-face'
import type { FontFile } from '@/sources/google'

const FILE: FontFile = {
  url: 'https://fonts.gstatic.com/s/inter/v20/UcC73.woff2',
  filename: 'inter-400-normal.woff2',
  family: 'Inter',
  weight: 400,
  style: 'normal',
}

describe('buildFontFace', () => {
  it('generates valid @font-face rule', () => {
    const css = buildFontFace(FILE, '/assets/inter-400-normal.woff2', 'swap')
    expect(css).toContain('@font-face')
    expect(css).toContain("font-family: 'Inter'")
    expect(css).toContain('font-weight: 400')
    expect(css).toContain('font-style: normal')
    expect(css).toContain('font-display: swap')
    expect(css).toContain("url('/assets/inter-400-normal.woff2')")
    expect(css).toContain("format('woff2')")
  })

  it('uses provided asset path not original url', () => {
    const css = buildFontFace(FILE, '/hashed/inter.woff2', 'swap')
    expect(css).not.toContain('fonts.gstatic.com')
    expect(css).toContain('/hashed/inter.woff2')
  })

  it('respects font-display value', () => {
    const css = buildFontFace(FILE, '/inter.woff2', 'optional')
    expect(css).toContain('font-display: optional')
  })
})
