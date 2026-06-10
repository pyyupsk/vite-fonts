import { describe, expect, it } from 'vitest'

import { hello } from '@/index'

describe('hello', () => {
  it('returns greeting', () => {
    expect(hello('world')).toBe('Hello, world!')
  })
})
