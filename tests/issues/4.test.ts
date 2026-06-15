/**
 * Issue #4: Font with trailing number ("Source Serif 4") returns HTTP 400
 *
 * Root cause: hardcoded variable range 100..900 rejected by Google Fonts API
 * for fonts whose wght axis minimum > 100. Source Serif 4 starts at 200.
 *
 * Fix: on 400, fetch Google Fonts metadata to discover actual wght range,
 * then retry with the correct range (e.g. 200..900).
 */

import { mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, assert, beforeEach, describe, expect, it, vi } from 'vitest'

import { ensureFonts } from '@/cache/manager'
import { normalize } from '@/config/normalize'

const MOCK_CSS = `/* latin */
@font-face {
  font-family: 'Source Serif 4';
  font-style: normal;
  font-weight: 200 900;
  font-display: optional;
  src: url(https://fonts.gstatic.com/s/sourceserif4/stub.woff2) format('woff2');
  unicode-range: U+0000-00FF;
}`

// fallow-ignore-next-line code-duplication
const MOCK_METADATA = {
  axes: [
    { tag: 'opsz', min: 8, max: 60, defaultValue: 14 },
    { tag: 'wght', min: 200, max: 900, defaultValue: 400 },
  ],
}

vi.mock('@/cache/download', () => ({
  downloadFont: vi.fn().mockResolvedValue([null, new Uint8Array([0, 1, 2])]),
}))

let cacheDir: string

beforeEach(() => {
  cacheDir = join(tmpdir(), `vite-fonts-issue-4-${Date.now()}`)
  mkdirSync(cacheDir, { recursive: true })
})

afterEach(() => {
  rmSync(cacheDir, { recursive: true, force: true })
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

describe('issue #4 — variable font with trailing number (Source Serif 4)', () => {
  it('resolves successfully after metadata-guided retry', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 400, text: () => Promise.resolve('') })
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve(`)]}'\n${JSON.stringify(MOCK_METADATA)}`),
        })
        .mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve(MOCK_CSS) }),
    )

    const { families } = normalize({
      families: {
        'source-serif-4': {
          family: 'Source Serif 4',
          display: 'optional',
          weights: ['variable'],
          styles: ['normal', 'italic'],
        },
      },
    })

    const [err, manifest] = await ensureFonts(families, 'google', cacheDir)

    expect(err).toBeNull()
    expect(manifest).not.toBeNull()
    expect(manifest!.families['source-serif-4']).toBeDefined()
  })

  it('retries with wght range derived from metadata (200..900)', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 400, text: () => Promise.resolve('') })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(`)]}'\n${JSON.stringify(MOCK_METADATA)}`),
      })
      .mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve(MOCK_CSS) })

    vi.stubGlobal('fetch', fetchMock)

    const { families } = normalize({
      families: {
        'source-serif-4': {
          family: 'Source Serif 4',
          display: 'optional',
          weights: ['variable'],
          styles: ['normal', 'italic'],
        },
      },
    })

    await ensureFonts(families, 'google', cacheDir)

    const retryCall = fetchMock.mock.calls[2]
    assert(retryCall)
    expect(decodeURIComponent(retryCall[0] as string)).toContain('200..900')
  })

  it('still errors when font genuinely does not exist', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 400, text: () => Promise.resolve('') })
        .mockResolvedValueOnce({ ok: false, status: 404 })
        .mockResolvedValue({ ok: false, status: 400, text: () => Promise.resolve('') }),
    )

    const { families } = normalize({
      families: {
        'nonexistent-font': {
          family: 'Nonexistent Font',
          display: 'swap',
          weights: ['variable'],
          styles: ['normal'],
        },
      },
    })

    const [err] = await ensureFonts(families, 'google', cacheDir)

    expect(err).not.toBeNull()
  })
})
