import type { NormalizedFamily } from '@/types'

import type { FontFile } from './google'

const API_BASE = 'https://api.fontsource.org/v1/fonts'

interface FontsourceVariants {
  [weight: string]: {
    [style: string]: {
      [subset: string]: { url: { woff2: string; woff: string; ttf?: string } }
    }
  }
}

export interface FontsourceMetadata {
  id: string
  family: string
  subsets: string[]
  weights: number[]
  styles: ('normal' | 'italic')[]
  variable: boolean
  variants: FontsourceVariants
  unicodeRange: Record<string, string>
}

export function toFontsourceId(family: string): string {
  return family.toLowerCase().replace(/\s+/g, '-')
}

export async function fetchFontsourceMetadata(family: string): Promise<FontsourceMetadata | null> {
  const id = toFontsourceId(family)
  const res = await fetch(`${API_BASE}/${id}`)
  if (!res.ok) return null
  return (await res.json()) as FontsourceMetadata
}

export function buildFontsourceFiles(
  family: NormalizedFamily,
  metadata: FontsourceMetadata,
): FontFile[] {
  const isVariable = family.weights.includes('variable')
  if (isVariable) {
    throw new Error(
      `fontsource source does not support variable weights for "${family.family}" — use static weights instead`,
    )
  }

  const numericWeights = family.weights.filter((w): w is number => typeof w === 'number')
  const files: FontFile[] = []

  for (const weight of numericWeights) {
    for (const style of family.styles) {
      for (const subset of family.subsets) {
        const variant = metadata.variants[weight]?.[style]?.[subset]
        if (!variant) continue

        const familySlug = metadata.id
        const subsetSlug = subset.replace(/[^a-z0-9]/g, '-')
        files.push({
          url: variant.url.woff2,
          filename: `${familySlug}-${weight}-${style}-${subsetSlug}.woff2`,
          family: metadata.family,
          weight,
          style,
          subset,
          unicodeRange: metadata.unicodeRange[subset],
        })
      }
    }
  }

  return files
}
