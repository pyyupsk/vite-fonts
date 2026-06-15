import type { NormalizedFamily } from '@/types'

export type { FontFile } from './google'
export { parseGoogleFontsCss as parseBunnyFontsCss } from './google'
import { buildFamilyParam } from './google'

const BASE_URL = 'https://fonts.bunny.net/css2'

export function buildBunnyFontsUrl(family: NormalizedFamily, variableRange?: string): string {
  const familyParam = buildFamilyParam(family, variableRange)
  return `${BASE_URL}?family=${encodeURIComponent(familyParam)}&display=${family.display}`
}
