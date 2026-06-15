import type { NormalizedFamily } from '@/types'

export interface FontFile {
  url: string
  filename: string
  family: string
  weight: number | string
  style: 'normal' | 'italic'
  subset: string
  unicodeRange?: string
}

const VARIABLE_RANGE = '100..900'
const BASE_URL = 'https://fonts.googleapis.com/css2'

const RE_BLOCK = /\/\*\s*([^*]+?)\s*\*\/\s*(@font-face\s*\{[^}]+\})/g
const RE_URL = /url\(([^)]+)\)/
const RE_FAMILY = /font-family:\s*['"]?([^'";]+)['"]?/
const RE_WEIGHT = /font-weight:\s*([^\s;]+)/
const RE_STYLE = /font-style:\s*([^\s;]+)/
const RE_UNICODE_RANGE = /unicode-range:\s*([^;]+)/

export function buildGoogleFontsUrl(family: NormalizedFamily): string {
  const isVariable = family.weights.includes('variable')
  const hasItalic = family.styles.includes('italic')
  const extraAxes = family.axes.filter((a) => a !== 'wght' && a !== 'ital').toSorted()

  let familyParam: string

  if (isVariable) {
    const axisNames = [...(hasItalic ? ['ital'] : []), ...extraAxes, 'wght'].join(',')
    const axisDefaults = extraAxes.map((a) => (a === 'opsz' ? '8' : '0')).join(',')
    if (hasItalic) {
      const prefix = extraAxes.length ? `0,${axisDefaults},` : '0,'
      const prefixI = extraAxes.length ? `1,${axisDefaults},` : '1,'
      familyParam = `${family.family}:${axisNames}@${prefix}${VARIABLE_RANGE};${prefixI}${VARIABLE_RANGE}`
    } else if (extraAxes.length) {
      familyParam = `${family.family}:${axisNames}@${axisDefaults},${VARIABLE_RANGE}`
    } else {
      familyParam = `${family.family}:wght@${VARIABLE_RANGE}`
    }
  } else {
    const numericWeights = family.weights.filter((w): w is number => typeof w === 'number')

    if (hasItalic) {
      const entries = [
        ...numericWeights.map((w) => `0,${w}`),
        ...numericWeights.map((w) => `1,${w}`),
      ]
        .toSorted((a, b) => a.localeCompare(b))
        .join(';')
      familyParam = `${family.family}:ital,wght@${entries}`
    } else {
      familyParam = `${family.family}:wght@${numericWeights.join(';')}`
    }
  }

  return `${BASE_URL}?family=${encodeURIComponent(familyParam)}&display=${family.display}`
}

export function parseGoogleFontsCss(css: string, subsets = ['latin']): FontFile[] {
  const results: FontFile[] = []
  let match: RegExpExecArray | null

  RE_BLOCK.lastIndex = 0
  while ((match = RE_BLOCK.exec(css)) !== null) {
    const subset = match[1]?.trim() ?? 'latin'
    const block = match[2] ?? ''

    if (!subsets.includes(subset)) continue

    const url = (RE_URL.exec(block) ?? [])[1] ?? ''
    const family = ((RE_FAMILY.exec(block) ?? [])[1] ?? '').trim()
    const weightRaw = ((RE_WEIGHT.exec(block) ?? [])[1] ?? '400').trim()
    const style = ((RE_STYLE.exec(block) ?? [])[1] ?? 'normal').trim() as 'normal' | 'italic'
    const unicodeRange = ((RE_UNICODE_RANGE.exec(block) ?? [])[1] ?? '').trim() || undefined

    const weight = /^\d+$/.test(weightRaw) ? Number(weightRaw) : weightRaw

    const familySlug = family.toLowerCase().replace(/\s+/g, '-')
    const subsetSlug = subset.replace(/[^a-z0-9]/g, '-')
    const filename = `${familySlug}-${weight}-${style}-${subsetSlug}.woff2`

    results.push({ url, filename, family, weight, style, subset, unicodeRange })
  }

  return results
}
