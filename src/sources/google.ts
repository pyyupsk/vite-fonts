import type { NormalizedFamily } from '@/types'

export interface FontFile {
  url: string
  filename: string
  family: string
  weight: number | string
  style: 'normal' | 'italic'
}

const VARIABLE_RANGE = '100..900'
const BASE_URL = 'https://fonts.googleapis.com/css2'

const RE_FONT_FACE = /@font-face\s*\{[^}]+\}/g
const RE_URL = /url\(([^)]+)\)/
const RE_FAMILY = /font-family:\s*['"]?([^'";]+)['"]?/
const RE_WEIGHT = /font-weight:\s*([^\s;]+)/
const RE_STYLE = /font-style:\s*([^\s;]+)/

export function buildGoogleFontsUrl(family: NormalizedFamily): string {
  const isVariable = family.weights.includes('variable')
  const hasItalic = family.styles.includes('italic')

  let familyParam: string

  if (isVariable) {
    familyParam = hasItalic
      ? `${family.family}:ital,wght@0,${VARIABLE_RANGE};1,${VARIABLE_RANGE}`
      : `${family.family}:wght@${VARIABLE_RANGE}`
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

export function parseGoogleFontsCss(css: string): FontFile[] {
  const blocks = css.match(RE_FONT_FACE) ?? []

  return blocks.map((block) => {
    const url = (RE_URL.exec(block) ?? [])[1] ?? ''
    const family = ((RE_FAMILY.exec(block) ?? [])[1] ?? '').trim()
    const weightRaw = ((RE_WEIGHT.exec(block) ?? [])[1] ?? '400').trim()
    const style = ((RE_STYLE.exec(block) ?? [])[1] ?? 'normal').trim() as 'normal' | 'italic'

    const weight = /^\d+$/.test(weightRaw) ? Number(weightRaw) : weightRaw

    const familySlug = family.toLowerCase().replace(/\s+/g, '-')
    const filename = `${familySlug}-${weight}-${style}.woff2`

    return { url, filename, family, weight, style }
  })
}
