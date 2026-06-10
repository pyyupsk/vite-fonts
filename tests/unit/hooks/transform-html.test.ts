import { describe, expect, it } from 'vitest'

import { normalize } from '@/config/normalize'
import type { PluginState } from '@/hooks/state'
import { handleTransformIndexHtml } from '@/hooks/transform-html'
import type { FontFile } from '@/sources/google'

const INTER_FILES: FontFile[] = [
  { url: '', filename: 'inter-400-normal.woff2', family: 'Inter', weight: 400, style: 'normal' },
  { url: '', filename: 'inter-700-normal.woff2', family: 'Inter', weight: 700, style: 'normal' },
]

function makeState(overrides: Partial<PluginState> = {}): PluginState {
  const { families, source, inject } = normalize('Inter')
  return {
    config: { families, source, inject },
    cacheDir: '/tmp/vite-fonts-test', // nosonar - test-only stub value, no real FS writes
    root: '/tmp',
    command: 'serve',
    filesMap: { inter: INTER_FILES },
    ...overrides,
  }
}

describe('handleTransformIndexHtml', () => {
  it('returns empty array when inject is not auto', () => {
    const { families, source } = normalize('Inter')
    const state = makeState({ config: { families, source, inject: false } })
    expect(handleTransformIndexHtml(state)).toHaveLength(0)
  })

  it('returns empty array when inject is manual', () => {
    const { families, source } = normalize('Inter')
    const state = makeState({ config: { families, source, inject: 'manual' } })
    expect(handleTransformIndexHtml(state)).toHaveLength(0)
  })

  it('injects stylesheet link when inject is auto', () => {
    const tags = handleTransformIndexHtml(makeState())
    const sheet = tags.find((t) => t.tag === 'link' && t.attrs?.rel === 'stylesheet')
    expect(sheet).toBeDefined()
    expect(sheet!.attrs?.href).toBe('/@pyyupsk/fonts')
    expect(sheet!.injectTo).toBe('head')
  })

  it('injects preload link for preload fonts (preload: true → first file)', () => {
    const tags = handleTransformIndexHtml(makeState())
    const preloads = tags.filter((t) => t.tag === 'link' && t.attrs?.rel === 'preload')
    expect(preloads.length).toBeGreaterThan(0)
    expect(preloads[0]!.attrs?.as).toBe('font')
    expect(preloads[0]!.attrs?.type).toBe('font/woff2')
    expect(preloads[0]!.attrs?.crossorigin).toBe(true)
    expect(preloads[0]!.attrs?.href).toContain('/__fonts/')
  })

  it('injects preload only for weight 400 when preload: true', () => {
    const tags = handleTransformIndexHtml(makeState())
    const preloads = tags.filter((t) => t.tag === 'link' && t.attrs?.rel === 'preload')
    expect(preloads).toHaveLength(1)
    expect(preloads[0]!.attrs?.href).toContain('inter-400')
  })

  it('injects no preload when preload: false', () => {
    const { families, source, inject } = normalize('Inter')
    const noPreloadFamilies = families.map((f) => ({ ...f, preload: false as const }))
    const state = makeState({ config: { families: noPreloadFamilies, source, inject } })
    const preloads = getTags(state).filter((t) => t.attrs?.rel === 'preload')
    expect(preloads).toHaveLength(0)
  })

  it('injects preload for specific weights when preload: number[]', () => {
    const { families, source, inject } = normalize('Inter')
    const weightFamilies = families.map((f) => ({ ...f, preload: [400, 700] as number[] }))
    const state = makeState({ config: { families: weightFamilies, source, inject } })
    const preloads = getTags(state).filter((t) => t.attrs?.rel === 'preload')
    expect(preloads).toHaveLength(2)
  })

  it('preload links inject before head', () => {
    const result = handleTransformIndexHtml(makeState())
    const preloads = result.filter((t) => t.attrs?.rel === 'preload')
    for (const p of preloads) expect(p.injectTo).toBe('head-prepend')
  })
})

function getTags(state: PluginState) {
  return handleTransformIndexHtml(state)
}
