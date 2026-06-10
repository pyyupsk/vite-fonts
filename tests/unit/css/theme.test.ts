import { describe, expect, it } from 'vitest'

import { normalize } from '@/config/normalize'
import { buildThemeBlock } from '@/css/theme'

describe('buildThemeBlock', () => {
  it('generates @theme inline block for tailwind v4', () => {
    const { families } = normalize({
      families: { sans: { family: 'Inter', variable: '--font-sans' } },
    })
    const css = buildThemeBlock(families)
    expect(css).toContain('@theme inline')
    expect(css).toContain('--font-sans')
  })

  it('includes all family variables', () => {
    const { families } = normalize({
      families: {
        sans: { family: 'Inter', variable: '--font-sans' },
        mono: { family: 'JetBrains Mono', variable: '--font-mono' },
      },
    })
    const css = buildThemeBlock(families)
    expect(css).toContain('--font-sans')
    expect(css).toContain('--font-mono')
  })

  it('returns empty string when no families have variables', () => {
    const css = buildThemeBlock([])
    expect(css).toBe('')
  })
})
