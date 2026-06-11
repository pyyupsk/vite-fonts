import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { CacheManifest } from '@/cache/manager'

const MANIFEST: CacheManifest = {
  version: 1,
  families: {
    inter: {
      hash: 'abc123def456',
      files: ['inter-400-normal.woff2', 'inter-700-normal.woff2'],
      fontFiles: [
        {
          url: '',
          filename: 'inter-400-normal.woff2',
          family: 'Inter',
          weight: 400,
          style: 'normal',
        },
        {
          url: '',
          filename: 'inter-700-normal.woff2',
          family: 'Inter',
          weight: 700,
          style: 'normal',
        },
      ],
    },
  },
}

let cacheDir: string
let cwd: string
let logs: string[]

beforeEach(() => {
  cwd = join(tmpdir(), `vite-fonts-cli-test-${Date.now()}`)
  cacheDir = join(cwd, 'node_modules', '.vite', 'fonts')
  mkdirSync(cacheDir, { recursive: true })
  writeFileSync(join(cacheDir, 'manifest.json'), JSON.stringify(MANIFEST))
  vi.spyOn(process, 'cwd').mockReturnValue(cwd)
  logs = []
})

afterEach(() => {
  vi.restoreAllMocks()
})

async function runList(verbose: boolean): Promise<void> {
  const consola = await import('consola')
  vi.spyOn(consola.consola, 'log').mockImplementation((...args) => logs.push(args.join(' ')))
  vi.spyOn(consola.consola, 'info').mockImplementation((...args) => logs.push(args.join(' ')))
  vi.spyOn(consola.consola, 'success').mockImplementation((...args) => logs.push(args.join(' ')))
  vi.spyOn(consola.consola, 'warn').mockImplementation((...args) => logs.push(args.join(' ')))

  const { listCommand } = await import('@/cli/list')
  await listCommand.run?.({ args: { verbose } as never, rawArgs: [], cmd: listCommand }) // nosonar - casting citty ParsedArgs; alias expansion tested by citty itself
}

describe('listCommand', () => {
  it('prints families and file count', async () => {
    await runList(false)
    const output = logs.join('\n')
    expect(output).toContain('inter')
    expect(output).toContain('2 files')
    expect(output).toContain('abc123de')
  })

  it('verbose shows per-file detail', async () => {
    await runList(true)
    expect(logs.join('\n')).toContain('inter-400-normal.woff2')
  })

  it('warns when manifest missing', async () => {
    const { rmSync } = await import('node:fs')
    rmSync(join(cacheDir, 'manifest.json'))
    await runList(false)
    expect(logs.join('\n')).toContain('No cache found')
  })
})
