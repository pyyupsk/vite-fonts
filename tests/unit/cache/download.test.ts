import { afterEach, describe, expect, it, vi } from 'vitest'

import { downloadFont } from '@/cache/download'

function mockFetch(status: number, body: Uint8Array, contentType = 'font/woff2') {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      headers: { get: () => contentType },
      arrayBuffer: () => Promise.resolve(body.buffer),
    }),
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('downloadFont', () => {
  it('returns bytes on success', async () => {
    const bytes = new Uint8Array([1, 2, 3])
    mockFetch(200, bytes)

    const [err, data] = await downloadFont('https://fonts.gstatic.com/test.woff2')
    expect(err).toBeNull()
    expect(data).toBeInstanceOf(Uint8Array)
    expect(data).toHaveLength(3)
  })

  it('returns error on non-200', async () => {
    mockFetch(404, new Uint8Array())
    const [err] = await downloadFont('https://fonts.gstatic.com/test.woff2')
    expect(err).toBeInstanceOf(Error)
    expect(err?.message).toContain('404')
  })

  it('returns error on wrong content-type', async () => {
    mockFetch(200, new Uint8Array([1, 2, 3]), 'text/html')
    const [err] = await downloadFont('https://fonts.gstatic.com/test.woff2')
    expect(err).toBeInstanceOf(Error)
    expect(err?.message).toContain('content-type')
  })
})
