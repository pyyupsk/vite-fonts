import { mkdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ensureFonts } from '@/cache/manager'
import { normalize } from '@/config/normalize'

vi.mock('@/cache/download', () => ({
  downloadFont: vi.fn().mockResolvedValue([null, new Uint8Array([0, 1, 2])]),
}))

let cacheDir: string

beforeEach(() => {
  cacheDir = join(tmpdir(), `vite-fonts-test-${Date.now()}`)
  mkdirSync(cacheDir, { recursive: true })
})

afterEach(() => {
  rmSync(cacheDir, { recursive: true, force: true })
  vi.clearAllMocks()
})

describe('ensureFonts', () => {
  it('downloads fonts and writes manifest on first run', async () => {
    const { families } = normalize('Inter')
    const [err, manifest] = await ensureFonts(families, 'google', cacheDir)

    expect(err).toBeNull()
    expect(manifest).not.toBeNull()
    expect(manifest!.version).toBe(1)
    expect(Object.keys(manifest!.families)).toHaveLength(1)
  })

  it('manifest lists downloaded files for the family', async () => {
    const { families } = normalize('Inter')
    const [, manifest] = await ensureFonts(families, 'google', cacheDir)

    const entry = manifest!.families['inter']
    expect(entry).toBeDefined()
    expect(entry!.files.length).toBeGreaterThan(0)
    expect(entry!.files[0]).toContain('.woff2')
  })

  it('skips download on cache hit (same hash)', async () => {
    const { downloadFont } = await import('@/cache/download')
    const { families } = normalize('Inter')

    await ensureFonts(families, 'google', cacheDir)
    vi.clearAllMocks()
    await ensureFonts(families, 'google', cacheDir)

    expect(downloadFont).not.toHaveBeenCalled()
  })

  it('re-downloads when config hash changes', async () => {
    const { downloadFont } = await import('@/cache/download')

    await ensureFonts(normalize('Inter').families, 'google', cacheDir)
    vi.clearAllMocks()

    await ensureFonts(normalize('Inter:variable').families, 'google', cacheDir)

    expect(downloadFont).toHaveBeenCalled()
  })

  it('writes manifest.json to cacheDir', async () => {
    const { families } = normalize('Inter')
    await ensureFonts(families, 'google', cacheDir)

    const raw = readFileSync(join(cacheDir, 'manifest.json'), 'utf8')
    const json = JSON.parse(raw)
    expect(json.version).toBe(1)
  })
})
