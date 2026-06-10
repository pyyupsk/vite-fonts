import type { FontFile } from '@/sources/google'
import type { NormalizedFamily } from '@/types'

import { buildFontFace } from './font-face'
import { buildThemeBlock } from './theme'

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
  }

  const rootVars = families
    .map(
      (f) =>
        `  ${f.variable}: '${f.family}', ${f.fallback.length ? f.fallback.join(', ') + ', ' : ''}sans-serif;`,
    )
    .join('\n')

  parts.push(`:root {\n${rootVars}\n}`, buildThemeBlock(families))

  return parts.filter(Boolean).join('\n\n')
}
