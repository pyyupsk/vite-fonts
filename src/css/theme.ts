import type { NormalizedFamily } from '@/types'

export function buildThemeBlock(families: NormalizedFamily[]): string {
  if (families.length === 0) return ''

  const vars = families.map((f) => `  ${f.variable}: var(${f.variable});`).join('\n')

  return `@theme inline {\n${vars}\n}`
}
