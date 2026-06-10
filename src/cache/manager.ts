import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { hashConfig } from '@/config/hash'
import { buildGoogleFontsUrl, parseGoogleFontsCss } from '@/sources/google'
import type { FontsConfig, FontSource, NormalizedFamily } from '@/types'

import { downloadFont } from './download'

export interface CacheManifestEntry {
  hash: string
  files: string[]
}

export interface CacheManifest {
  version: 1
  families: Record<string, CacheManifestEntry>
}

function readManifest(cacheDir: string): CacheManifest | null {
  try {
    const raw = readFileSync(join(cacheDir, 'manifest.json'), 'utf8')
    return JSON.parse(raw) as CacheManifest
  } catch {
    return null
  }
}

function writeManifest(cacheDir: string, manifest: CacheManifest): void {
  writeFileSync(join(cacheDir, 'manifest.json'), JSON.stringify(manifest, null, 2))
}

function familyHash(family: NormalizedFamily, source: FontSource): string {
  const config: FontsConfig = {
    source,
    inject: 'auto',
    families: [family],
  }
  return hashConfig(config)
}

async function downloadFamily(
  family: NormalizedFamily,
  cacheDir: string,
): Promise<[Error, null] | [null, string[]]> {
  const url = buildGoogleFontsUrl(family)

  let css: string
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; vite-fonts/0.1)' },
    })
    if (!res.ok)
      return [
        new Error(`[vite-fonts] Failed to fetch CSS for "${family.family}": HTTP ${res.status}`),
        null,
      ]
    css = await res.text()
  } catch (e) {
    return [e instanceof Error ? e : new Error(String(e)), null]
  }

  const fontFiles = parseGoogleFontsCss(css)
  const written: string[] = []

  for (const file of fontFiles) {
    const [err, bytes] = await downloadFont(file.url)
    if (err) return [err, null]

    const dest = join(cacheDir, file.filename)
    writeFileSync(dest, bytes)
    if (!written.includes(file.filename)) written.push(file.filename)
  }

  return [null, written]
}

export async function ensureFonts(
  families: NormalizedFamily[],
  source: FontSource,
  cacheDir: string,
): Promise<[Error, null] | [null, CacheManifest]> {
  mkdirSync(cacheDir, { recursive: true })

  const manifest: CacheManifest = readManifest(cacheDir) ?? { version: 1, families: {} }

  for (const family of families) {
    const hash = familyHash(family, source)
    const cached = manifest.families[family.key]

    if (cached?.hash === hash) continue

    const [err, files] = await downloadFamily(family, cacheDir)
    if (err) return [err, null]

    manifest.families[family.key] = { hash, files }
  }

  writeManifest(cacheDir, manifest)
  return [null, manifest]
}
