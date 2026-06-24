import type { NormalizedFamily } from '@/types'

import type { FontFile } from './google'

const API_BASE = 'https://fonts-api.fasu.dev/api/fonts'

interface PyyupskVariant {
  id: string
  familyId: string
  style: 'normal' | 'italic'
  weight: number
  postScriptName: string
  fileUrl: string
}

interface PyyupskFamily {
  id: string
  name: string
  wghtMin: number | null
  wghtMax: number | null
}

export interface PyyupskMetadata {
  family: PyyupskFamily
  variants: PyyupskVariant[]
}

export function toPyyupskId(family: string): string {
  return family.toLowerCase().replace(/\s+/g, '-')
}

export async function fetchPyyupskMetadata(family: string): Promise<PyyupskMetadata | null> {
  const id = toPyyupskId(family)
  const res = await fetch(`${API_BASE}/${id}`)
  if (!res.ok) return null
  return (await res.json()) as PyyupskMetadata
}

function variableRange(metadata: PyyupskMetadata): { min: number; max: number } | null {
  const { wghtMin, wghtMax } = metadata.family
  if (wghtMin == null || wghtMax == null) return null
  return { min: wghtMin, max: wghtMax }
}

function buildVariableFiles(
  family: NormalizedFamily,
  metadata: PyyupskMetadata,
  range: { min: number; max: number },
): FontFile[] {
  const files: FontFile[] = []

  for (const style of family.styles) {
    const variant = metadata.variants.find((v) => v.style === style)
    if (!variant) continue

    files.push({
      url: variant.fileUrl,
      filename: `${metadata.family.id}-${range.min}-${range.max}-${style}-variable.woff2`,
      family: metadata.family.name,
      weight: `${range.min} ${range.max}`,
      style,
      subset: 'all',
    })
  }

  return files
}

function buildStaticFiles(family: NormalizedFamily, metadata: PyyupskMetadata): FontFile[] {
  const numericWeights = family.weights.filter((w): w is number => typeof w === 'number')
  const files: FontFile[] = []

  for (const weight of numericWeights) {
    for (const style of family.styles) {
      const variant = metadata.variants.find((v) => v.weight === weight && v.style === style)
      if (!variant) continue

      files.push({
        url: variant.fileUrl,
        filename: `${metadata.family.id}-${weight}-${style}.woff2`,
        family: metadata.family.name,
        weight,
        style,
        subset: 'all',
      })
    }
  }

  return files
}

export function buildPyyupskFiles(family: NormalizedFamily, metadata: PyyupskMetadata): FontFile[] {
  const wantsVariable = family.weights.includes('variable')
  const range = variableRange(metadata)

  if (wantsVariable && !range) {
    throw new Error(`pyyupsk source does not provide a variable font for "${family.family}"`)
  }
  if (!wantsVariable && range) {
    throw new Error(
      `pyyupsk source only provides "${family.family}" as a variable font — use "${family.family}:variable"`,
    )
  }

  return range ? buildVariableFiles(family, metadata, range) : buildStaticFiles(family, metadata)
}
