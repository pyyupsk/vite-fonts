/** Controls how a font face is displayed based on download status and readiness. */
export type FontDisplay = 'auto' | 'block' | 'swap' | 'fallback' | 'optional'

/** Font provider to download from. */
export type FontSource = 'google' | 'bunny' | 'fontsource' | 'pyyupsk'

/**
 * Controls how the generated CSS is injected into the page.
 * - `'auto'` — injected via virtual module and `<link>` tag automatically
 * - `'manual'` — virtual module resolved but no `<link>` tag injected
 * - `false` — no injection at all
 */
export type FontInject = 'auto' | 'manual' | false

/** A locally hosted font file entry for a family variant. */
export interface LocalFontFile {
  path: string
  weight: number | string
  style?: 'normal' | 'italic'
}

/** Per-family font configuration. */
export interface FamilyConfig {
  family: string
  weights?: (number | 'variable')[]
  styles?: ('normal' | 'italic')[]
  subsets?: string[]
  display?: FontDisplay
  axes?: string[]
  variable?: string
  fallback?: string[]
  adjustFontFallback?: boolean | string
  local?: LocalFontFile[]
  preload?: boolean | number[]
}

/** Full options object accepted by the `fonts()` plugin. */
export interface FontsOptions {
  source?: FontSource
  inject?: FontInject
  preload?: boolean | string[]
  subsets?: string[]
  display?: FontDisplay
  families: string[] | Record<string, FamilyConfig>
}

/**
 * Input accepted by the `fonts()` plugin.
 * - `string` — single family name with defaults
 * - `string[]` — multiple family names with defaults
 * - `FontsOptions` — full options object
 */
export type FontsInput = string | string[] | FontsOptions

/** Normalized internal representation of a font family after config resolution. */
export interface NormalizedFamily {
  key: string
  family: string
  weights: (number | 'variable')[]
  styles: ('normal' | 'italic')[]
  subsets: string[]
  display: FontDisplay
  axes: string[]
  variable: string
  fallback: string[]
  adjustFontFallback: boolean | string
  local: LocalFontFile[]
  preload: boolean | number[]
}

/** Resolved plugin config passed to internal hooks. */
export interface FontsConfig {
  source: FontSource
  inject: FontInject
  families: NormalizedFamily[]
}
