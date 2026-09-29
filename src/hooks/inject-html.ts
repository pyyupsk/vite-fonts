import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import type { Dirent } from 'node:fs'
import { join } from 'node:path'

import type { FontFile } from '@/sources/google'
import type { NormalizedFamily } from '@/types'

export function selectPreloadFiles(family: NormalizedFamily, files: FontFile[]): FontFile[] {
  if (family.preload === false) return []
  if (family.preload === true) {
    const first = files.find((f) => f.weight === 400) ?? files[0]
    return first ? [first] : []
  }
  if (!Array.isArray(family.preload)) return []
  const weights = family.preload
  return files.filter((f) => weights.includes(f.weight as number))
}

interface ParsedFontFace {
  family: string
  weight: string
  url: string
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
    if (family && weight && url) out.push({ family, weight, url })
  }
  return out
}

function blockWeightMatches(blockWeight: string, target: number): boolean {
  const nums = blockWeight.split(/\s+/).map(Number)
  return nums.includes(target)
}

export function preloadHrefsFromCss(css: string, families: NormalizedFamily[]): string[] {
  const blocks = parseFontFaceBlocks(css)
  const hrefs: string[] = []
  for (const family of families) {
    const own = blocks.filter((b) => b.family.toLowerCase() === family.family.toLowerCase())
    if (family.preload === false) continue
    if (family.preload === true) {
      const match = own.find((b) => blockWeightMatches(b.weight, 400)) ?? own[0]
      if (match) hrefs.push(match.url)
      continue
    }
    for (const b of own) {
      if (
        Array.isArray(family.preload) &&
        family.preload.some((w) => blockWeightMatches(b.weight, w))
      ) {
        hrefs.push(b.url)
      }
    }
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
