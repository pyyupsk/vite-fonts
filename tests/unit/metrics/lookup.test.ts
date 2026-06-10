import { describe, expect, it } from 'vitest'

import {
  computeOverrides,
  defaultFallbackName,
  getFallbackMetrics,
  lookupMetrics,
} from '@/metrics/lookup'

describe('lookupMetrics', () => {
  it('returns metrics for known font', () => {
    const m = lookupMetrics('Inter')
    expect(m).not.toBeNull()
    expect(m!.capHeight).toBeGreaterThan(0)
    expect(m!.unitsPerEm).toBeGreaterThan(0)
    expect(m!.category).toBe('sans-serif')
  })

  it('returns null for unknown font', () => {
    expect(lookupMetrics('UnknownFontXYZ')).toBeNull()
  })

  it('lookup is case-insensitive', () => {
    expect(lookupMetrics('inter')).not.toBeNull()
    expect(lookupMetrics('INTER')).not.toBeNull()
  })
})

describe('defaultFallbackName', () => {
  it('returns Arial for sans-serif', () => {
    expect(defaultFallbackName('sans-serif')).toBe('Arial')
  })

  it('returns Times New Roman for serif', () => {
    expect(defaultFallbackName('serif')).toBe('Times New Roman')
  })

  it('returns Courier New for monospace', () => {
    expect(defaultFallbackName('monospace')).toBe('Courier New')
  })

  it('returns Arial for display', () => {
    expect(defaultFallbackName('display')).toBe('Arial')
  })
})

describe('getFallbackMetrics', () => {
  it('returns metrics for Arial', () => {
    const m = getFallbackMetrics('Arial')
    expect(m).not.toBeNull()
    expect(m!.capHeight).toBe(716)
    expect(m!.unitsPerEm).toBe(2048)
  })

  it('returns metrics for Times New Roman', () => {
    const m = getFallbackMetrics('Times New Roman')
    expect(m).not.toBeNull()
    expect(m!.capHeight).toBe(662)
  })

  it('returns metrics for Courier New', () => {
    const m = getFallbackMetrics('Courier New')
    expect(m).not.toBeNull()
  })

  it('returns null for unknown system font', () => {
    expect(getFallbackMetrics('Comic Sans')).toBeNull()
  })
})

describe('computeOverrides', () => {
  it('produces correct overrides for Inter vs Arial', () => {
    const inter = lookupMetrics('Inter')!
    const arial = getFallbackMetrics('Arial')!
    const overrides = computeOverrides(inter, arial)

    expect(overrides.sizeAdjust).toMatch(/^\d+\.\d+%$/)
    expect(overrides.ascentOverride).toMatch(/^\d+\.\d+%$/)
    expect(overrides.descentOverride).toMatch(/^\d+\.\d+%$/)
    expect(overrides.lineGapOverride).toMatch(/^\d+(\.\d+)?%$/)
  })

  it('size-adjust for Inter vs Arial is approximately 107%', () => {
    const inter = lookupMetrics('Inter')!
    const arial = getFallbackMetrics('Arial')!
    const overrides = computeOverrides(inter, arial)
    const value = Number.parseFloat(overrides.sizeAdjust)
    expect(value).toBeGreaterThan(100)
    expect(value).toBeLessThan(115)
  })

  it('all override values are non-negative', () => {
    const inter = lookupMetrics('Inter')!
    const arial = getFallbackMetrics('Arial')!
    const { sizeAdjust, ascentOverride, descentOverride, lineGapOverride } = computeOverrides(
      inter,
      arial,
    )
    for (const v of [sizeAdjust, ascentOverride, descentOverride, lineGapOverride]) {
      expect(Number.parseFloat(v)).toBeGreaterThanOrEqual(0)
    }
  })
})
