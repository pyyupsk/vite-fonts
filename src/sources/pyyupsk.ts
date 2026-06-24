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
  isVariable: boolean
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

export function buildPyyupskFiles(family: NormalizedFamily, metadata: PyyupskMetadata): FontFile[] {
  const isVariable = family.weights.includes('variable')
  const files: FontFile[] = []

  if (isVariable) {
    if (!metadata.family.isVariable) {
      throw new Error(`pyyupsk source does not provide a variable font for "${family.family}"`)
    }

    const min = metadata.family.wghtMin ?? 100
    const max = metadata.family.wghtMax ?? 900

    for (const style of family.styles) {
      const variant = metadata.variants.find((v) => v.style === style)
      if (!variant) continue

      files.push({
        url: variant.fileUrl,
        filename: `${metadata.family.id}-${min}-${max}-${style}-variable.woff2`,
        family: metadata.family.name,
        weight: `${min} ${max}`,
        style,
        subset: 'all',
      })
    }

    return files
  }

  const numericWeights = family.weights.filter((w): w is number => typeof w === 'number')

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
