import type { FontFile } from '@/sources/google'
import type { FontDisplay } from '@/types'

export function buildFontFace(file: FontFile, assetPath: string, display: FontDisplay): string {
  return `@font-face {
  font-family: '${file.family}';
  font-style: ${file.style};
  font-weight: ${file.weight};
  font-display: ${display};
  src: url('${assetPath}') format('woff2');
}`
}
