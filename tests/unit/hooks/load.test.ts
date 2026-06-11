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
    subset: 'latin',
  },
]

const CTX = {} as Parameters<typeof handleLoad>[2] // nosonar - minimal stub; dev-mode load never calls emitFile

function makeState(command: 'serve' | 'build' = 'serve'): PluginState {
  const { families, source, inject } = normalize('Inter')
  return {
    config: { families, source, inject },
    cacheDir: '/tmp/vite-fonts-test', // nosonar - test-only stub value, no real FS writes
    root: '/tmp',
    command,
    filesMap: { inter: INTER_FILES },
    metricsMap: {},
    assetRefIds: {},
  }
}

describe('handleLoad', () => {
  it('returns null for unrelated ids', async () => {
    const result = await handleLoad('./foo.ts', makeState(), CTX)
    expect(result).toBeNull()
  })

  it('returns CSS string for resolved font id (dev)', async () => {
    const css = await handleLoad(RESOLVED_ID, makeState('serve'), CTX)
    expect(typeof css).toBe('string')
    expect(css).toContain('@font-face')
    expect(css).toContain('Inter')
  })

  it('dev CSS uses /__fonts/ paths', async () => {
    const css = await handleLoad(RESOLVED_ID, makeState('serve'), CTX)
    expect(css).toContain('/__fonts/')
  })

  it('includes :root and @theme blocks', async () => {
    const css = await handleLoad(RESOLVED_ID, makeState('serve'), CTX)
    expect(css).toContain(':root')
    expect(css).toContain('--font-inter')
    expect(css).toContain('@theme inline')
  })

  it('returns null for meta id (handled separately)', async () => {
    const result = await handleLoad(META_RESOLVED_ID, makeState(), CTX)
    expect(result).toBeNull()
  })

  it('returns null when filesMap is empty', async () => {
    const state = makeState()
    state.filesMap = {}
    const css = await handleLoad(RESOLVED_ID, state, CTX)
    expect(css).toContain(':root')
  })
})
