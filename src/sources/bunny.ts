import type { NormalizedFamily } from '@/types'

export type { FontFile } from './google'
export { parseGoogleFontsCss as parseBunnyFontsCss } from './google'

const VARIABLE_RANGE = '100..900'
const BASE_URL = 'https://fonts.bunny.net/css2'

export function buildBunnyFontsUrl(family: NormalizedFamily): string {
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
