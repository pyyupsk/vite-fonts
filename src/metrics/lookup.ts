export interface FontMetrics {
  capHeight: number
  ascent: number
  descent: number
  lineGap: number
  unitsPerEm: number
  xWidthAvg: number
  category: 'sans-serif' | 'serif' | 'monospace' | 'display'
}

export interface FallbackOverrides {
  sizeAdjust: string
  ascentOverride: string
  descentOverride: string
  lineGapOverride: string
}

const SYSTEM_METRICS: Record<string, FontMetrics> = {
  Arial: {
    capHeight: 716,
    ascent: 1854,
    descent: -434,
    lineGap: 67,
    unitsPerEm: 2048,
    xWidthAvg: 904,
    category: 'sans-serif',
  },
  'Times New Roman': {
    capHeight: 662,
    ascent: 1825,
    descent: -443,
    lineGap: 87,
    unitsPerEm: 2048,
    xWidthAvg: 821,
    category: 'serif',
  },
  'Courier New': {
    capHeight: 571,
    ascent: 1705,
    descent: -615,
    lineGap: 0,
    unitsPerEm: 2048,
    xWidthAvg: 1229,
    category: 'monospace',
  },
}

const DEFAULT_FALLBACKS: Record<FontMetrics['category'], string> = {
  'sans-serif': 'Arial',
  serif: 'Times New Roman',
  monospace: 'Courier New',
  display: 'Arial',
}

function pct(value: number): string {
  return (Math.round(value * 10000) / 100).toFixed(2) + '%'
}

export function lookupMetrics(
  family: string,
  metricsMap: Record<string, FontMetrics>,
): FontMetrics | null {
  const key = Object.keys(metricsMap).find((k) => k.toLowerCase() === family.toLowerCase())
  return key ? (metricsMap[key] ?? null) : null
}

export function getFallbackMetrics(name: string): FontMetrics | null {
  return SYSTEM_METRICS[name] ?? null
}

export function defaultFallbackName(category: FontMetrics['category']): string {
  return DEFAULT_FALLBACKS[category]
}

export function computeOverrides(webFont: FontMetrics, fallback: FontMetrics): FallbackOverrides {
  const mainAvgWidth = webFont.xWidthAvg / webFont.unitsPerEm
  const fallbackAvgWidth = fallback.xWidthAvg / fallback.unitsPerEm
  const sizeAdjust = webFont.xWidthAvg ? mainAvgWidth / fallbackAvgWidth : 1

  const ascentOverride = webFont.ascent / (webFont.unitsPerEm * sizeAdjust)
  const descentOverride = Math.abs(webFont.descent) / (webFont.unitsPerEm * sizeAdjust)
  const lineGapOverride = webFont.lineGap / (webFont.unitsPerEm * sizeAdjust)

  return {
    sizeAdjust: pct(sizeAdjust),
    ascentOverride: pct(ascentOverride),
    descentOverride: pct(descentOverride),
    lineGapOverride: pct(lineGapOverride),
  }
}
