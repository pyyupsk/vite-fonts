import { describe, expect, it } from 'vitest'

import {
  META_RESOLVED_ID,
  META_VIRTUAL_ID,
  RESOLVED_ID,
  VIRTUAL_ID,
  handleResolveId,
} from '@/hooks/resolve-id'

describe('handleResolveId', () => {
  it('resolves virtual font id', () => {
    expect(handleResolveId(VIRTUAL_ID)).toBe(RESOLVED_ID)
  })

  it('resolves meta virtual id', () => {
    expect(handleResolveId(META_VIRTUAL_ID)).toBe(META_RESOLVED_ID)
  })

  it('returns undefined for unrelated ids', () => {
    expect(handleResolveId('./foo.ts')).toBeUndefined()
    expect(handleResolveId('react')).toBeUndefined()
    expect(handleResolveId('@pyyupsk/other')).toBeUndefined()
  })

  it(String.raw`resolved id starts with \0`, () => {
    expect(RESOLVED_ID.startsWith('\0')).toBe(true)
    expect(META_RESOLVED_ID.startsWith('\0')).toBe(true)
  })

  it('resolved id ends with .css for CSS pipeline', () => {
    expect(RESOLVED_ID.endsWith('.css')).toBe(true)
  })
})
