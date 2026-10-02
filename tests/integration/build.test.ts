import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import type { Rolldown } from 'vite'
import { build } from 'vite'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

const FILES = vi.hoisted(() =>
  [400, 700].map((weight) => ({
    url: `https://fonts.gstatic.com/inter-${weight}.woff2`,
    filename: `inter-${weight}-normal.woff2`,
    family: 'Inter',
    weight,
    style: 'normal',
    subset: 'latin',
  })),
)

vi.mock('@/cache/manager', () => ({
  ensureFonts: vi
    .fn()
    .mockResolvedValue([
      null,
      { version: 1, families: { inter: { hash: 'stub', files: [], fontFiles: FILES } } },
    ]),
}))

vi.mock('@/dts/generate', () => ({
  generateDts: vi.fn().mockResolvedValue(null),
}))

import { fonts } from '@/plugin'

const ROOT = resolve(__dirname, '../fixtures/ssr')
const PRELOAD_RE = /\/assets\/inter-\d+-normal-[\w-]+\.woff2/g

let tmp: string

async function run(ssr: boolean): Promise<Rolldown.RolldownOutput> {
  const out = await build({
    root: ROOT,
    logLevel: 'silent',
    cacheDir: join(tmp, 'cache'),
    plugins: [
      fonts({ families: { inter: { family: 'Inter', weights: [400, 700], preload: [700] } } }),
    ],
    build: {
      write: false,
      outDir: join(tmp, ssr ? 'server' : 'client'),
      ssr: ssr ? 'entry.js' : undefined,
      rollupOptions: ssr ? undefined : { input: join(ROOT, 'entry.js') },
    },
  })
  return out as Rolldown.RolldownOutput
}

function preloadHrefs(out: Rolldown.RolldownOutput): string[] {
  const code = out.output.flatMap((o) => (o.type === 'chunk' ? [o.code] : [])).join('\n')
  return code.match(PRELOAD_RE) ?? []
}

describe('vite build integration', () => {
  let client: Rolldown.RolldownOutput
  let server: Rolldown.RolldownOutput

  beforeAll(async () => {
    tmp = mkdtempSync(join(tmpdir(), 'vite-fonts-build-'))
    const fontsDir = join(tmp, 'cache', 'fonts')
    mkdirSync(fontsDir, { recursive: true })
    for (const f of FILES) writeFileSync(join(fontsDir, f.filename), `bytes of ${f.filename}`)
    client = await run(false)
    server = await run(true)
  })

  afterAll(() => {
    rmSync(tmp, { recursive: true, force: true })
  })

  it('emits each font file exactly once', () => {
    const woff2 = client.output.filter((o) => o.fileName.endsWith('.woff2')).map((o) => o.name)
    expect(woff2.toSorted()).toEqual(FILES.map((f) => f.filename))
  })

  it('client meta preloads point at the emitted hashed asset', () => {
    const emitted = client.output.find((o) => o.name === 'inter-700-normal.woff2')
    expect(preloadHrefs(client)).toEqual([`/${emitted!.fileName}`])
  })

  it('SSR meta preloads match the client asset URLs', () => {
    expect(preloadHrefs(server)).toEqual(preloadHrefs(client))
  })
})
