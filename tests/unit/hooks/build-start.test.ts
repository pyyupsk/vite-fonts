import { mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { normalize } from '@/config/normalize'
import { handleBuildStart } from '@/hooks/build-start'
import type { PluginState } from '@/hooks/state'

const MOCK_CSS = `/* latin */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/inter/v20/stub.woff2) format('woff2');
  unicode-range: U+0000-00FF;
}`

vi.mock('@/cache/download', () => ({
  downloadFont: vi.fn().mockResolvedValue([null, new Uint8Array([0, 1, 2])]),
}))

let cacheDir: string

beforeEach(() => {
  cacheDir = join(tmpdir(), `vite-fonts-hook-test-${Date.now()}`)
  mkdirSync(cacheDir, { recursive: true })
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve(MOCK_CSS) }),
  )
})

afterEach(() => {
  rmSync(cacheDir, { recursive: true, force: true })
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

describe('handleBuildStart', () => {
  it('populates filesMap from ensureFonts result', async () => {
    const { families, source, inject } = normalize('Inter')
    const state: PluginState = {
      config: { families, source, inject },
      cacheDir,
      root: tmpdir(),
      command: 'serve',
      filesMap: {},
      metricsMap: {},
      assetRefIds: {},
    }

    const err = await handleBuildStart(state)
    expect(err).toBeNull()
    expect(state.filesMap['inter']).toBeDefined()
    expect(state.filesMap['inter']!.length).toBeGreaterThan(0)
  })

  it('returns error if ensureFonts fails', async () => {
    const { families, source, inject } = normalize('Inter')
    const state: PluginState = {
      config: { families, source, inject },
      cacheDir: '/nonexistent/path/that/cannot/be/created/xyz',
      root: tmpdir(),
      command: 'serve',
      filesMap: {},
      metricsMap: {},
      assetRefIds: {},
    }

    const err = await handleBuildStart(state)
    expect(err).toBeInstanceOf(Error)
  })
})
