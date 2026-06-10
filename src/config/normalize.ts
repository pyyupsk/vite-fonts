import type {
  FontDisplay,
  FontInject,
  FontSource,
  FontsConfig,
  FontsInput,
  FontsOptions,
  NormalizedFamily,
} from '../types'

const DEFAULTS = {
  source: 'google' as FontSource,
  inject: 'auto' as FontInject,
  weights: [400, 500, 700] as (number | 'variable')[],
  styles: ['normal'] as ('normal' | 'italic')[],
  subsets: ['latin'],
  display: 'swap' as FontDisplay,
  axes: [] as string[],
  fallback: [] as string[],
  adjustFontFallback: false as boolean | string,
  local: [],
  preload: true as boolean | number[],
}

function toKey(family: string): string {
  return family.toLowerCase().replace(/\s+/g, '-')
}

function toVariable(family: string): string {
  return `--font-${toKey(family)}`
}

function normalizeFamily(raw: string): NormalizedFamily {
  const isVariable = raw.endsWith(':variable')
  const family = isVariable ? raw.slice(0, -9) : raw

  return {
    key: toKey(family),
    family,
    weights: isVariable ? ['variable'] : DEFAULTS.weights,
    styles: DEFAULTS.styles,
    subsets: DEFAULTS.subsets,
    display: DEFAULTS.display,
    axes: DEFAULTS.axes,
    variable: toVariable(family),
    fallback: DEFAULTS.fallback,
    adjustFontFallback: DEFAULTS.adjustFontFallback,
    local: DEFAULTS.local,
    preload: DEFAULTS.preload,
  }
}

function normalizeFamiliesArray(families: string[]): NormalizedFamily[] {
  return families.map(normalizeFamily)
}

function normalizeOptions(opts: FontsOptions): FontsConfig {
  const families = Array.isArray(opts.families)
    ? normalizeFamiliesArray(opts.families).map((f) => ({
        ...f,
        subsets: opts.subsets ?? f.subsets,
        display: opts.display ?? f.display,
      }))
    : Object.entries(opts.families).map(([key, cfg]) => ({
        key,
        family: cfg.family,
        weights: cfg.weights ?? DEFAULTS.weights,
        styles: cfg.styles ?? DEFAULTS.styles,
        subsets: cfg.subsets ?? opts.subsets ?? DEFAULTS.subsets,
        display: cfg.display ?? opts.display ?? DEFAULTS.display,
        axes: cfg.axes ?? DEFAULTS.axes,
        variable: cfg.variable ?? toVariable(cfg.family),
        fallback: cfg.fallback ?? DEFAULTS.fallback,
        adjustFontFallback: cfg.adjustFontFallback ?? DEFAULTS.adjustFontFallback,
        local: cfg.local ?? DEFAULTS.local,
        preload: cfg.preload ?? DEFAULTS.preload,
      }))

  return {
    source: opts.source ?? DEFAULTS.source,
    inject: opts.inject ?? DEFAULTS.inject,
    families,
  }
}

export function normalize(input: FontsInput): FontsConfig {
  if (typeof input === 'string') {
    return {
      source: DEFAULTS.source,
      inject: DEFAULTS.inject,
      families: [normalizeFamily(input)],
    }
  }

  if (Array.isArray(input)) {
    return {
      source: DEFAULTS.source,
      inject: DEFAULTS.inject,
      families: normalizeFamiliesArray(input),
    }
  }

  return normalizeOptions(input)
}
