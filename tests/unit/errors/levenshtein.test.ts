import { describe, expect, it } from 'vitest'

import { levenshtein } from '@/errors/levenshtein'

describe('levenshtein', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshtein('inter', 'inter')).toBe(0)
  })

  it('returns length for empty source', () => {
    expect(levenshtein('', 'abc')).toBe(3)
  })

  it('returns length for empty target', () => {
    expect(levenshtein('abc', '')).toBe(3)
  })

  it('counts single substitution', () => {
    expect(levenshtein('cat', 'bat')).toBe(1)
  })

  it('counts single insertion', () => {
    expect(levenshtein('inter', 'intre')).toBe(2)
  })

  it('handles common typo: Intre → Inter', () => {
    expect(levenshtein('intre', 'inter')).toBeLessThanOrEqual(2)
  })
})
