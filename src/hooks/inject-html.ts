import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import type { Dirent } from 'node:fs'
import { join } from 'node:path'

import type { FontFile } from '@/sources/google'
import type { NormalizedFamily } from '@/types'

type Preloadable = Pick<FontFile, 'weight' | 'subset'>

export function selectPreloadFiles<T extends Preloadable>(
  family: NormalizedFamily,
  files: T[],
): T[] {
  if (family.preload === false) return []
  if (family.preload === true) {
    const bySubset = new Map<string, T[]>()
    for (const f of files) bySubset.set(f.subset, [...(bySubset.get(f.subset) ?? []), f])
    return [...bySubset.values()].flatMap((group) => {
      const pick = group.find((f) => coversWeight(f.weight, 400)) ?? group[0]
      return pick ? [pick] : []
    })
  }
  const weights = family.preload
  return files.filter((f) => weights.some((w) => coversWeight(f.weight, w)))
}

function coversWeight(weight: number | string, target: number): boolean {
  if (typeof weight === 'number') return weight === target
  const [min, max = min] = weight.trim().split(/\s+/).map(Number)
  return min !== undefined && max !== undefined && target >= min && target <= max
}

interface ParsedFontFace {
  family: string
  weight: string
  url: string
  unicodeRange?: string
}

export function parseFontFaceBlocks(css: string): ParsedFontFace[] {
  const blocks = css.match(/@font-face\s*\{[^}]*\}/g) ?? []
  const out: ParsedFontFace[] = []
  for (const block of blocks) {
    const family = block.match(/font-family:\s*'([^']+)'/)?.[1]
    const weight = block.match(/font-weight:\s*([^;]+);/)?.[1]?.trim()
    const url =
      block.match(/url\('([^']+)'\)/)?.[1] ??
      block.match(/url\("([^"]+)"\)/)?.[1] ??
      block.match(/url\(\s*([^)'"\s]+)\s*\)/)?.[1]
    const unicodeRange = block.match(/unicode-range:\s*([^;]+);/)?.[1]?.trim()
    if (family && weight && url)
      out.push({ family, weight, url, ...(unicodeRange && { unicodeRange }) })
  }
  return out
}

export function preloadHrefsFromCss(css: string, families: NormalizedFamily[]): string[] {
  const blocks = parseFontFaceBlocks(css)
  const hrefs: string[] = []
  for (const family of families) {
    if (family.preload === false) continue
    const own = blocks.filter((b) => b.family.toLowerCase() === family.family.toLowerCase())
    const files = own.map((b) => ({ ...b, subset: b.unicodeRange ?? '' }))
    for (const f of selectPreloadFiles(family, files)) hrefs.push(f.url)
  }
  return [...new Set(hrefs)]
}

export function collectHtmlFiles(dir: string): string[] {
  let entries: Dirent[]
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return []
  }
  const out: string[] = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...collectHtmlFiles(full))
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full)
  }
  return out
}

export function buildPreloadTags(hrefs: string[]): string {
  return hrefs
    .map(
      (href) => `    <link rel="preload" as="font" type="font/woff2" href="${href}" crossorigin>`,
    )
    .join('\n')
}

export function injectIntoHtml(html: string, preloadTags: string, stylesheetTag: string): string {
  let out = html

  const freshPreloads = preloadTags
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((line) => {
      const href = line.match(/href="([^"]+)"/)?.[1]
      return href ? !out.includes(`href="${href}"`) : !out.includes(line)
    })

  if (freshPreloads.length > 0) {
    const block = freshPreloads.join('\n')
    if (/<head[^>]*>/.test(out)) {
      out = out.replace(/<head[^>]*>/, (m) => `${m}\n${block}`)
    } else if (out.includes('</head>')) {
      out = out.replace('</head>', `${block}\n  </head>`)
    }
  }

  const sheetHref = stylesheetTag.match(/href="([^"]+)"/)?.[1]
  const sheetMissing = sheetHref ? !out.includes(sheetHref) : !out.includes(stylesheetTag.trim())
  if (sheetMissing && stylesheetTag.trim() && out.includes('</head>')) {
    out = out.replace('</head>', `${stylesheetTag}\n  </head>`)
  }

  return out
}

export function injectSnippetIntoHtmlFiles(outDir: string, snippet: string): void {
  const lines = snippet
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const preloads = lines.filter((l) => l.includes('rel="preload"'))
  const sheet = lines.find((l) => l.includes('rel="stylesheet"')) ?? ''
  for (const file of collectHtmlFiles(outDir)) {
    const html = readFileSync(file, 'utf8')
    const next = injectIntoHtml(html, preloads.join('\n'), sheet)
    if (next !== html) writeFileSync(file, next)
  }
}
