import { describe, expect, it } from 'vitest'

import { normalize } from '@/config/normalize'
import { generateCss } from '@/css/generate'
import type { FontFile } from '@/sources/google'

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
})
