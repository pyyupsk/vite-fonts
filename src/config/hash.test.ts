import { describe, expect, it } from 'vitest'

import { hashConfig } from './hash'
import { normalize } from './normalize'

describe('hashConfig', () => {
  it('same input produces same hash', () => {
    const a = hashConfig(normalize('Inter'))
    const b = hashConfig(normalize('Inter'))
    expect(a).toBe(b)
  })

  it('different input produces different hash', () => {
    const a = hashConfig(normalize('Inter'))
    const b = hashConfig(normalize('Roboto'))
    expect(a).not.toBe(b)
  })

  it('hash is 8 hex chars', () => {
    const h = hashConfig(normalize('Inter'))
    expect(h).toMatch(/^[0-9a-f]{8}$/)
  })
})
