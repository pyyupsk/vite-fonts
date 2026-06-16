import { describe, expect, it, vi } from 'vitest'

import { normalize } from '@/config/normalize'
import {
  buildFontsourceFiles,
  fetchFontsourceMetadata,
  toFontsourceId,
  type FontsourceMetadata,
} from '@/sources/fontsource'

const METADATA: FontsourceMetadata = {
  id: 'inter',
  family: 'Inter',
  subsets: ['latin'],
  weights: [400, 700],
  styles: ['normal', 'italic'],
  variable: true,
  unicodeRange: { latin: 'U+0000-00FF' },
  variants: {
    400: {
      normal: {
        latin: {
          url: {
            woff2: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff2',
            woff: '',
          },
        },
      },
      italic: {
        latin: {
          url: {
            woff2: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-italic.woff2',
            woff: '',
          },
        },
      },
    },
    700: {
      normal: {
        latin: {
          url: {
            woff2: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff2',
            woff: '',
          },
        },
      },
      italic: {
        latin: {
          url: {
            woff2: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-italic.woff2',
            woff: '',
          },
        },
      },
    },
  },
}

describe('toFontsourceId', () => {
  it('lowercases and dashes spaces', () => {
    expect(toFontsourceId('Fira Code')).toBe('fira-code')
  })
})

describe('fetchFontsourceMetadata', () => {
  it('returns parsed metadata on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(METADATA) }),
    )

    const result = await fetchFontsourceMetadata('Inter')
    expect(result).toEqual(METADATA)
    vi.unstubAllGlobals()
  })

  it('returns null on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    const result = await fetchFontsourceMetadata('Unknown Font')
    expect(result).toBeNull()
    vi.unstubAllGlobals()
  })
})

describe('buildFontsourceFiles', () => {
  it('builds files for default weights/styles', () => {
    const base = normalize(['Inter']).families[0]! // nosonar - noUncheckedIndexedAccess makes [0] T|undefined; ! is correct
    const family = { ...base, weights: [400, 700] as (number | 'variable')[] }
    const files = buildFontsourceFiles(family, METADATA)

    expect(files).toHaveLength(2)
    expect(files[0]!.url).toContain('inter@latest/latin-400-normal.woff2')
    expect(files[0]!.filename).toBe('inter-400-normal-latin.woff2')
  })

  it('includes italic variants when requested', () => {
    const base = normalize(['Inter']).families[0]! // nosonar - noUncheckedIndexedAccess makes [0] T|undefined; ! is correct
    const family = {
      ...base,
      weights: [400] as (number | 'variable')[],
      styles: ['normal', 'italic'] as ('normal' | 'italic')[],
    }
    const files = buildFontsourceFiles(family, METADATA)

    expect(files).toHaveLength(2)
    expect(files.map((f) => f.style)).toEqual(['normal', 'italic'])
  })

  it('skips combos missing from metadata variants', () => {
    const base = normalize(['Inter']).families[0]! // nosonar - noUncheckedIndexedAccess makes [0] T|undefined; ! is correct
    const family = { ...base, weights: [900] as (number | 'variable')[] }
    const files = buildFontsourceFiles(family, METADATA)

    expect(files).toHaveLength(0)
  })

  it('throws for variable weight', () => {
    const family = normalize(['Inter:variable']).families[0]! // nosonar - noUncheckedIndexedAccess makes [0] T|undefined; ! is correct
    expect(() => buildFontsourceFiles(family, METADATA)).toThrow(/does not support variable/)
  })
})
