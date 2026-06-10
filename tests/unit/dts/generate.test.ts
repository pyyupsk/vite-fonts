import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { generateDts } from '@/dts/generate'
import type { NormalizedFamily } from '@/types'

const FAMILY: NormalizedFamily = {
  key: 'sans',
  family: 'Inter',
  weights: [400, 700],
  styles: ['normal'],
  subsets: ['latin'],
  display: 'swap',
  axes: [],
  variable: '--font-sans',
  fallback: [],
  adjustFontFallback: true,
  local: [],
  preload: false,
}

const VARIABLE_FAMILY: NormalizedFamily = {
  ...FAMILY,
  key: 'mono',
  family: 'JetBrains Mono',
  weights: ['variable'],
  variable: '--font-mono',
}

let tmpDir: string

afterEach(async () => {
  if (tmpDir) await rm(tmpDir, { recursive: true, force: true })
})

describe('generateDts', () => {
  it('writes client.d.ts to node_modules/.vite-fonts/', async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'vite-fonts-test-'))
    const err = await generateDts([FAMILY], tmpDir)
    expect(err).toBeNull()

    const content = await readFile(
      join(tmpDir, 'node_modules', '.vite-fonts', 'client.d.ts'),
      'utf8',
    )
    expect(content).toContain('declare module "@pyyupsk/fonts"')
    expect(content).toContain('declare module "@pyyupsk/fonts?url"')
    expect(content).toContain('declare module "@pyyupsk/fonts/meta"')
  })

  it('generates literal types for family key', async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'vite-fonts-test-'))
    await generateDts([FAMILY], tmpDir)

    const content = await readFile(
      join(tmpDir, 'node_modules', '.vite-fonts', 'client.d.ts'),
      'utf8',
    )
    expect(content).toContain('"sans"')
    expect(content).toContain('"Inter"')
    expect(content).toContain('"--font-sans"')
    expect(content).toContain('"var(--font-sans)"')
    expect(content).toContain('400')
    expect(content).toContain('700')
  })

  it('handles variable weight', async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'vite-fonts-test-'))
    await generateDts([VARIABLE_FAMILY], tmpDir)

    const content = await readFile(
      join(tmpDir, 'node_modules', '.vite-fonts', 'client.d.ts'),
      'utf8',
    )
    expect(content).toContain('"variable"')
  })

  it('generates entries for multiple families', async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'vite-fonts-test-'))
    await generateDts([FAMILY, VARIABLE_FAMILY], tmpDir)

    const content = await readFile(
      join(tmpDir, 'node_modules', '.vite-fonts', 'client.d.ts'),
      'utf8',
    )
    expect(content).toContain('"sans"')
    expect(content).toContain('"mono"')
  })

  it('returns error when dir is unwritable', async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'vite-fonts-test-'))
    const { writeFile } = await import('node:fs/promises')
    // use a file path as root so mkdir fails immediately (ENOTDIR)
    const filePath = join(tmpDir, 'not-a-dir')
    await writeFile(filePath, '')
    const err = await generateDts([FAMILY], filePath)
    expect(err).toBeInstanceOf(Error)
  })
})
