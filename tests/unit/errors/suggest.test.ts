import { describe, expect, it } from 'vitest'

import { suggestFonts } from '@/errors/suggest'

describe('suggestFonts', () => {
  it('suggests Inter for "Intre"', () => {
    const results = suggestFonts('Intre')
    expect(results).toContain('Inter')
  })

  it('suggests Lato for "Laro"', () => {
    const results = suggestFonts('Laro')
    expect(results).toContain('Lato')
  })

  it('returns at most maxResults entries', () => {
    expect(suggestFonts('Roboto', 2)).toHaveLength(2)
  })

  it('returns empty for completely unrelated string', () => {
    expect(suggestFonts('xyzzyfoobarbaz')).toHaveLength(0)
  })

  it('exact match returns that font first', () => {
    const results = suggestFonts('Roboto')
    expect(results[0]).toBe('Roboto')
  })
})
