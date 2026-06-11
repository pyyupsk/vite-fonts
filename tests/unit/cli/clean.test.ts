import { existsSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let cacheDir: string
let cwd: string

beforeEach(() => {
  cwd = join(tmpdir(), `vite-fonts-clean-test-${Date.now()}`)
  cacheDir = join(cwd, 'node_modules', '.vite', 'fonts')
  mkdirSync(cacheDir, { recursive: true })
  vi.spyOn(process, 'cwd').mockReturnValue(cwd)
  vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('cleanCommand', () => {
  it('removes the cache directory', async () => {
    expect(existsSync(cacheDir)).toBe(true)

    const { cleanCommand } = await import('@/cli/clean')
    await cleanCommand.run?.({ args: {} as never, rawArgs: [], cmd: cleanCommand }) // nosonar - casting citty ParsedArgs; no args to validate

    expect(existsSync(cacheDir)).toBe(false)
  })

  it('succeeds when cache does not exist', async () => {
    const { rmSync } = await import('node:fs')
    rmSync(cacheDir, { recursive: true })

    const { cleanCommand } = await import('@/cli/clean')
    expect(
      () => cleanCommand.run?.({ args: {} as never, rawArgs: [], cmd: cleanCommand }), // nosonar - casting citty ParsedArgs; no args to validate
    ).not.toThrow()
  })
})
