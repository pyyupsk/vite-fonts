import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { normalize } from '@/config/normalize'
import { handleGenerateBundle } from '@/hooks/generate-bundle'
import { handleLoad, handleLoadMeta } from '@/hooks/load'
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
    outDir: null,
    htmlInject: null,
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

function countingCtx() {
  const emitted: string[] = []
  const ctx = {
    emitFile: (file: { name: string }) => {
      emitted.push(file.name)
      return `ref${emitted.length}`
    },
  }
  return { ctx, emitted }
}

async function importMeta(code: string) {
  const url = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
  return (await import(url)) as {
    fonts: Record<string, { preloads: { href: string; type: string }[] }>
    preloads: { href: string; type: string }[]
  }
}

describe('handleLoadMeta', () => {
  const FILES: FontFile[] = [400, 500, 700].map((weight) => ({
    ...INTER_FILES[0]!,
    filename: `inter-${weight}-normal.woff2`,
    weight,
  }))

  let cacheDir: string

  beforeEach(() => {
    cacheDir = mkdtempSync(join(tmpdir(), 'vite-fonts-meta-'))
    for (const f of FILES) writeFileSync(join(cacheDir, f.filename), f.filename)
  })

  afterEach(() => {
    rmSync(cacheDir, { recursive: true, force: true })
  })

  function makeMetaState(command: 'serve' | 'build', preload: boolean | number[]): PluginState {
    const state = makeState(command)
    state.cacheDir = cacheDir
    state.filesMap = { inter: FILES }
    state.config!.families[0]!.preload = preload
    return state
  }

  it('dev preloads use /__fonts/ hrefs', async () => {
    const meta = await importMeta(
      handleLoadMeta(META_RESOLVED_ID, makeMetaState('serve', true), CTX)!,
    )
    expect(meta.preloads).toEqual([{ href: '/__fonts/inter-400-normal.woff2', type: 'font/woff2' }])
    expect(meta.fonts.inter!.preloads).toEqual(meta.preloads)
  })

  it('build preloads use Vite asset placeholders for the emitted files', async () => {
    const { ctx, emitted } = countingCtx()
    const meta = await importMeta(
      handleLoadMeta(META_RESOLVED_ID, makeMetaState('build', true), ctx)!,
    )
    const ref = emitted.indexOf('inter-400-normal.woff2') + 1
    expect(meta.preloads).toEqual([{ href: `__VITE_ASSET__ref${ref}__`, type: 'font/woff2' }])
  })

  it('drops duplicate hrefs when weights share one file', async () => {
    const ctx = { emitFile: () => 'same' }
    const meta = await importMeta(
      handleLoadMeta(META_RESOLVED_ID, makeMetaState('build', [400, 700]), ctx)!,
    )
    expect(meta.preloads).toEqual([{ href: '__VITE_ASSET__same__', type: 'font/woff2' }])
    expect(meta.fonts.inter!.preloads).toEqual(meta.preloads)
  })

  it('preload: false yields no preloads', async () => {
    const meta = await importMeta(
      handleLoadMeta(META_RESOLVED_ID, makeMetaState('serve', false), CTX)!,
    )
    expect(meta.preloads).toEqual([])
  })

  it('a weight list selects only those weights', async () => {
    const meta = await importMeta(
      handleLoadMeta(META_RESOLVED_ID, makeMetaState('serve', [500, 700]), CTX)!,
    )
    expect(meta.preloads.map((p) => p.href)).toEqual([
      '/__fonts/inter-500-normal.woff2',
      '/__fonts/inter-700-normal.woff2',
    ])
  })

  it('emits each font once across meta, CSS and generateBundle', () => {
    const state = makeMetaState('build', true)
    const { ctx, emitted } = countingCtx()
    handleLoadMeta(META_RESOLVED_ID, state, ctx)
    handleLoad(RESOLVED_ID, state, ctx)
    handleGenerateBundle.call({ ...ctx, getFileName: (id) => id }, {}, {}, state)
    expect(emitted.toSorted()).toEqual(FILES.map((f) => f.filename))
  })

  it('meta emits only the preloaded files', () => {
    const { ctx, emitted } = countingCtx()
    handleLoadMeta(META_RESOLVED_ID, makeMetaState('build', [700]), ctx, 'ssr')
    expect(emitted).toEqual(['inter-700-normal.woff2'])
  })

  it('emits again per environment', () => {
    const state = makeMetaState('build', true)
    const { ctx, emitted } = countingCtx()
    handleLoad(RESOLVED_ID, state, ctx, 'client')
    handleLoad(RESOLVED_ID, state, ctx, 'ssr')
    expect(emitted).toHaveLength(FILES.length * 2)
  })
})
