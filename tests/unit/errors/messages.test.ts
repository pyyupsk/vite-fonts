import { describe, expect, it } from 'vitest'

import {
  fontNotFoundError,
  localFileMissingError,
  networkError,
  variableCollisionError,
  weightUnavailableError,
} from '@/errors/messages'

describe('fontNotFoundError', () => {
  it('includes prefix and family name', () => {
    const err = fontNotFoundError('Intre', 404)
    expect(err.message).toContain('[vite-fonts]')
    expect(err.message).toContain('Intre')
    expect(err.message).toContain('404')
  })

  it('includes fuzzy suggestions for close typo', () => {
    const err = fontNotFoundError('Intre', 404)
    expect(err.message).toContain('Inter')
    expect(err.message).toContain('Did you mean')
  })

  it('includes google fonts check URL', () => {
    const err = fontNotFoundError('Intre', 404)
    expect(err.message).toContain('fonts.google.com')
  })
})

describe('weightUnavailableError', () => {
  it('includes family and weight', () => {
    const err = weightUnavailableError('Inter', 950)
    expect(err.message).toContain('Inter')
    expect(err.message).toContain('950')
  })
})

describe('variableCollisionError', () => {
  it('includes variable name and both family keys', () => {
    const err = variableCollisionError('--font-sans', ['sans', 'brand'])
    expect(err.message).toContain('--font-sans')
    expect(err.message).toContain('families.sans')
    expect(err.message).toContain('families.brand')
  })
})

describe('networkError', () => {
  it('wraps Error cause', () => {
    const err = networkError('Inter', new Error('ENOTFOUND fonts.googleapis.com'))
    expect(err.message).toContain('Inter')
    expect(err.message).toContain('ENOTFOUND')
  })

  it('wraps string cause', () => {
    const err = networkError('Inter', 'timeout')
    expect(err.message).toContain('timeout')
  })
})

describe('localFileMissingError', () => {
  it('includes path and family key', () => {
    const err = localFileMissingError('./fonts/Satoshi.woff2', 'brand')
    expect(err.message).toContain('./fonts/Satoshi.woff2')
    expect(err.message).toContain('families.brand')
  })
})
