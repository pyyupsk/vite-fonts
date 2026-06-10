export type FontDisplay = 'auto' | 'block' | 'swap' | 'fallback' | 'optional'

export type FontSource = 'google' | 'bunny'

export type FontInject = 'auto' | 'manual' | false

export interface LocalFontFile {
  path: string
  weight: number | string
  style?: 'normal' | 'italic'
}

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

export interface FontsOptions {
  source?: FontSource
  inject?: FontInject
  preload?: boolean | string[]
  subsets?: string[]
  display?: FontDisplay
  families: string[] | Record<string, FamilyConfig>
}

export type FontsInput = string | string[] | FontsOptions

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

export interface FontsConfig {
  source: FontSource
  inject: FontInject
  families: NormalizedFamily[]
}
