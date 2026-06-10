import {
  computeOverrides,
  defaultFallbackName,
  getFallbackMetrics,
  lookupMetrics,
} from '@/metrics/lookup'
import type { FontFile } from '@/sources/google'
import type { NormalizedFamily } from '@/types'

import { buildFallbackFontFace } from './fallback'
import { buildFontFace } from './font-face'
import { buildThemeBlock } from './theme'

function resolveFallbackName(family: NormalizedFamily): string | null {
  if (!family.adjustFontFallback) return null
  if (typeof family.adjustFontFallback === 'string') return family.adjustFontFallback
  const metrics = lookupMetrics(family.family)
  if (!metrics) return null
  return defaultFallbackName(metrics.category)
}

function buildSidecarFontFace(family: NormalizedFamily): string | null {
  const fallbackName = resolveFallbackName(family)
  if (!fallbackName) return null

  const webMetrics = lookupMetrics(family.family)
  const fallbackMetrics = getFallbackMetrics(fallbackName)
  if (!webMetrics || !fallbackMetrics) return null

  const overrides = computeOverrides(webMetrics, fallbackMetrics)
  return buildFallbackFontFace(family.family, fallbackName, overrides)
}

function rootVar(family: NormalizedFamily): string {
  const fallbackFamilyName = resolveFallbackName(family)
  const fallbackStack = [
    ...(fallbackFamilyName ? [`'${family.family} Fallback'`] : []),
    ...family.fallback,
    'sans-serif',
  ].join(', ')
  return `  ${family.variable}: '${family.family}', ${fallbackStack};`
}

export function generateCss(
  families: NormalizedFamily[],
  filesMap: Record<string, FontFile[]>,
  assetMap: Record<string, string>,
): string {
  const parts: string[] = []

  for (const family of families) {
    const files = filesMap[family.key] ?? []
    for (const file of files) {
      const assetPath = assetMap[file.filename] ?? file.filename
      parts.push(buildFontFace(file, assetPath, family.display))
    }

    const sidecar = buildSidecarFontFace(family)
    if (sidecar) parts.push(sidecar)
  }

  const rootVars = families.map(rootVar).join('\n')
  parts.push(`:root {\n${rootVars}\n}`, buildThemeBlock(families))

  return parts.filter(Boolean).join('\n\n')
}
