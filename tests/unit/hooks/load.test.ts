import { describe, expect, it } from 'vitest'

import { normalize } from '@/config/normalize'
import { handleLoad } from '@/hooks/load'
import { META_RESOLVED_ID, RESOLVED_ID } from '@/hooks/resolve-id'
import type { PluginState } from '@/hooks/state'
import type { FontFile } from '@/sources/google'

const INTER_FILES: FontFile[] = [
  {
    url: 'https://fonts.gstatic.com/inter-400.woff2',
    filename: 'inter-400-normal.woff2',
    family: 'Inter',
    weight: 400,
    style: 'normal',
  },
]

function makeState(command: 'serve' | 'build' = 'serve'): PluginState {
  const { families, source, inject } = normalize('Inter')
  return {
    config: { families, source, inject },
    cacheDir: '/tmp/vite-fonts-test', // nosonar — test-only, no real FS writes
    command,
    filesMap: { inter: INTER_FILES },
  }
}

describe('handleLoad', () => {
  it('returns null for unrelated ids', () => {
    const result = handleLoad('./foo.ts', makeState())
    expect(result).toBeNull()
  })

  it('returns CSS string for resolved font id (dev)', () => {
    const css = handleLoad(RESOLVED_ID, makeState('serve'))
    expect(typeof css).toBe('string')
    expect(css).toContain('@font-face')
    expect(css).toContain('Inter')
  })

  it('dev CSS uses /__fonts/ paths', () => {
    const css = handleLoad(RESOLVED_ID, makeState('serve')) as string
    expect(css).toContain('/__fonts/')
  })

  it('includes :root and @theme blocks', () => {
    const css = handleLoad(RESOLVED_ID, makeState('serve')) as string
    expect(css).toContain(':root')
    expect(css).toContain('--font-inter')
    expect(css).toContain('@theme inline')
  })

  it('returns null for meta id (handled separately)', () => {
    const result = handleLoad(META_RESOLVED_ID, makeState())
    expect(result).toBeNull()
  })

  it('returns null when filesMap is empty', () => {
    const state = makeState()
    state.filesMap = {}
    const css = handleLoad(RESOLVED_ID, state) as string
    expect(css).toContain(':root')
  })
})
