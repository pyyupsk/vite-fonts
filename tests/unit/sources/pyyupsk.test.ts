import { describe, expect, it, vi } from 'vitest'

import { normalize } from '@/config/normalize'
import {
  buildPyyupskFiles,
  fetchPyyupskMetadata,
  toPyyupskId,
  type PyyupskMetadata,
} from '@/sources/pyyupsk'

const STATIC_METADATA: PyyupskMetadata = {
  family: {
    id: 'lobster',
    name: 'Lobster',
    isVariable: false,
    wghtMin: null,
    wghtMax: null,
  },
  variants: [
    {
      id: 'lobster-400-normal',
      familyId: 'lobster',
      style: 'normal',
      weight: 400,
      postScriptName: 'Lobster-Regular',
      fileUrl: 'https://cdn.fasu.dev/fonts/ofl/lobster/lobster-normal-400.woff2',
    },
  ],
}

const VARIABLE_METADATA: PyyupskMetadata = {
  family: {
    id: 'inter',
    name: 'Inter',
    isVariable: true,
    wghtMin: 100,
    wghtMax: 900,
  },
  variants: [
    {
      id: 'inter-400-normal',
      familyId: 'inter',
      style: 'normal',
      weight: 400,
      postScriptName: 'Inter-Regular',
      fileUrl: 'https://cdn.fasu.dev/fonts/ofl/inter/inter-normal-variable.woff2',
    },
    {
      id: 'inter-400-italic',
      familyId: 'inter',
      style: 'italic',
      weight: 400,
      postScriptName: 'Inter-Italic',
      fileUrl: 'https://cdn.fasu.dev/fonts/ofl/inter/inter-italic-variable.woff2',
    },
  ],
}

describe('toPyyupskId', () => {
  it('lowercases and dashes spaces', () => {
    expect(toPyyupskId('Fira Code')).toBe('fira-code')
  })
})

describe('fetchPyyupskMetadata', () => {
  it('returns parsed metadata on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(STATIC_METADATA) }),
    )

    const result = await fetchPyyupskMetadata('Lobster')
    expect(result).toEqual(STATIC_METADATA)
    vi.unstubAllGlobals()
  })

  it('returns null on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    const result = await fetchPyyupskMetadata('Unknown Font')
    expect(result).toBeNull()
    vi.unstubAllGlobals()
  })
})

describe('buildPyyupskFiles', () => {
  it('builds files for static weights', () => {
    const base = normalize(['Lobster']).families[0]! // nosonar - noUncheckedIndexedAccess makes [0] T|undefined; ! is correct
    const family = { ...base, weights: [400] as (number | 'variable')[] }
    const files = buildPyyupskFiles(family, STATIC_METADATA)

    expect(files).toHaveLength(1)
    expect(files[0]!.url).toContain('lobster-normal-400.woff2')
    expect(files[0]!.weight).toBe(400)
  })

  it('skips combos missing from metadata variants', () => {
    const base = normalize(['Lobster']).families[0]! // nosonar - noUncheckedIndexedAccess makes [0] T|undefined; ! is correct
    const family = { ...base, weights: [900] as (number | 'variable')[] }
    const files = buildPyyupskFiles(family, STATIC_METADATA)

    expect(files).toHaveLength(0)
  })

  it('builds a variable-range file per style', () => {
    const family = normalize(['Inter:variable']).families[0]! // nosonar - noUncheckedIndexedAccess makes [0] T|undefined; ! is correct
    const files = buildPyyupskFiles(family, VARIABLE_METADATA)

    expect(files).toHaveLength(1)
    expect(files[0]!.weight).toBe('100 900')
    expect(files[0]!.url).toContain('inter-normal-variable.woff2')
  })

  it('throws when family has no variable font', () => {
    const family = normalize(['Lobster:variable']).families[0]! // nosonar - noUncheckedIndexedAccess makes [0] T|undefined; ! is correct
    expect(() => buildPyyupskFiles(family, STATIC_METADATA)).toThrow(/does not provide a variable/)
  })
})
