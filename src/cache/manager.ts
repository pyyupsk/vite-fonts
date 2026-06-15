import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'

import { hashConfig } from '@/config/hash'
import { fontNotFoundError, networkError } from '@/errors/messages'
import { getLogger } from '@/logger'
import { buildGoogleFontsUrl, parseGoogleFontsCss } from '@/sources/google'
import type { FontFile } from '@/sources/google'
import type { FontsConfig, FontSource, NormalizedFamily } from '@/types'

import { downloadFont } from './download'

export interface CacheManifestEntry {
  hash: string
  files: string[]
  fontFiles: FontFile[]
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

function handleLocalFamily(
  family: NormalizedFamily,
  cacheDir: string,
): [null, { files: string[]; fontFiles: FontFile[] }] {
  const logger = getLogger()
  const files: string[] = []
  const fontFiles: FontFile[] = []

  for (const local of family.local) {
    const filename = basename(local.path)
    const dest = join(cacheDir, filename)
    copyFileSync(local.path, dest)
    if (!files.includes(filename)) files.push(filename)
    fontFiles.push({
      url: local.path,
      filename,
      family: family.family,
      weight: local.weight,
      style: local.style ?? 'normal',
      subset: 'local',
    })
  }

  logger.info(`"${family.family}" loaded from local files (${files.length} files)`)
  return [null, { files, fontFiles }]
}

async function downloadFamily(
  family: NormalizedFamily,
  cacheDir: string,
): Promise<[Error, null] | [null, { files: string[]; fontFiles: FontFile[] }]> {
  const logger = getLogger()
  const url = buildGoogleFontsUrl(family)

  logger.info(`Downloading "${family.family}" from Google Fonts...`)

  let css: string
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })
    if (!res.ok) return [fontNotFoundError(family.family, res.status), null]
    css = await res.text()
  } catch (e) {
    return [networkError(family.family, e), null]
  }

  const fontFiles = parseGoogleFontsCss(css, family.subsets)
  const written: string[] = []

  for (const file of fontFiles) {
    const [err, bytes] = await downloadFont(file.url)
    if (err) return [err, null]

    const dest = join(cacheDir, file.filename)
    writeFileSync(dest, bytes)
    if (!written.includes(file.filename)) written.push(file.filename)
  }

  logger.info(`"${family.family}" cached (${written.length} files)`)
  return [null, { files: written, fontFiles }]
}

export async function ensureFonts(
  families: NormalizedFamily[],
  source: FontSource,
  cacheDir: string,
): Promise<[Error, null] | [null, CacheManifest]> {
  mkdirSync(cacheDir, { recursive: true })

  const manifest: CacheManifest = readManifest(cacheDir) ?? { version: 1, families: {} }
  const logger = getLogger()

  for (const family of families) {
    const hash = familyHash(family, source)
    const cached = manifest.families[family.key]

    if (cached?.hash === hash) {
      logger.info(`"${family.family}" loaded from cache`)
      if (!cached.fontFiles) cached.fontFiles = []
      continue
    }

    const isLocalOnly = family.local.length > 0
    const [err, result] = isLocalOnly
      ? handleLocalFamily(family, cacheDir)
      : await downloadFamily(family, cacheDir)
    if (err) return [err, null]

    manifest.families[family.key] = { hash, files: result.files, fontFiles: result.fontFiles }
  }

  writeManifest(cacheDir, manifest)
  return [null, manifest]
}
