import { resolve } from 'node:path'

import type { ViteDevServer } from 'vite'
import { createServer } from 'vite'
import { afterAll, assert, beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('@/cache/manager', () => ({
  ensureFonts: vi.fn().mockResolvedValue([
    null,
    {
      version: 1,
      families: {
        inter: {
          hash: 'stub',
          files: ['inter-400-normal.woff2'],
          fontFiles: [
            {
              url: 'https://fonts.gstatic.com/stub.woff2',
              filename: 'inter-400-normal.woff2',
              family: 'Inter',
              weight: 400,
              style: 'normal',
            },
          ],
        },
      },
    },
  ]),
}))

vi.mock('@/dts/generate', () => ({
  generateDts: vi.fn().mockResolvedValue(null),
}))

import { fonts } from '@/plugin'

describe('vite dev server integration', () => {
  let server: ViteDevServer

  beforeAll(async () => {
    server = await createServer({
      root: resolve(__dirname, '../fixtures/basic'),
      logLevel: 'silent',
      server: { port: 0 },
      plugins: [fonts('Inter')],
    })
    await server.listen()
  })

  afterAll(async () => {
    await server.close()
  })

  it('virtual module @pyyupsk/fonts resolves to CSS with @font-face', async () => {
    const result = await server.transformRequest('\0@pyyupsk/fonts.css')
    assert(result !== null)
    expect(result.code).toContain('@font-face')
    expect(result.code).toContain('Inter')
  })

  it('dev CSS uses /__fonts/ URL paths', async () => {
    const result = await server.transformRequest('\0@pyyupsk/fonts.css')
    assert(result !== null)
    expect(result.code).toContain('/__fonts/')
  })

  it('@pyyupsk/fonts/meta resolves to JS with fonts export', async () => {
    const result = await server.transformRequest('\0@pyyupsk/fonts-meta.js')
    assert(result !== null)
    expect(result.code).toContain('export const fonts')
    expect(result.code).toContain('Inter')
  })

  it('transformIndexHtml injects stylesheet link', async () => {
    const html = await server.transformIndexHtml('/', '<html><head></head><body></body></html>')
    expect(html).toContain('/@pyyupsk/fonts')
    expect(html).toContain('stylesheet')
  })
})
