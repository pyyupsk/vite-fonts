import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { create } from 'fontkit'
import type { Font } from 'fontkit'

import type { FontFile } from '@/sources/google'

import type { FontMetrics } from './lookup'

export async function extractMetrics(
  files: FontFile[],
  cacheDir: string,
): Promise<FontMetrics | null> {
  const file = files.find((f) => f.weight === 400 && f.style === 'normal') ?? files[0]
  if (!file) return null

  let bytes: Uint8Array
  try {
    bytes = await readFile(join(cacheDir, file.filename))
  } catch {
    return null
  }

  try {
    const result = create(Buffer.from(bytes))
    const font: Font | null = 'fonts' in result ? (result.fonts[0] ?? null) : result
    if (!font) return null

    const os2 = font['OS/2']
    const post = (font as unknown as Record<string, { isFixedPitch?: number } | undefined>)['post']

    return {
      capHeight: font.capHeight ?? 0,
      ascent: font.ascent,
      descent: font.descent,
      lineGap: font.lineGap,
      unitsPerEm: font.unitsPerEm,
      xWidthAvg: os2?.xAvgCharWidth ?? 0,
      category: resolveCategory(os2?.sFamilyClass ?? 0, post?.isFixedPitch ?? 0),
    }
  } catch {
    return null
  }
}

function resolveCategory(sFamilyClass: number, isFixedPitch: number): FontMetrics['category'] {
  if (isFixedPitch) return 'monospace'
  const classId = sFamilyClass >> 8
  if (
    classId === 1 ||
    classId === 2 ||
    classId === 3 ||
    classId === 4 ||
    classId === 5 ||
    classId === 7
  )
    return 'serif'
  return 'sans-serif'
}
