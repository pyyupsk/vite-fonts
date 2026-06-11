import { suggestFonts } from './suggest'

export function fontNotFoundError(family: string, httpStatus: number): Error {
  const suggestions = suggestFonts(family)
  const lines = [`[vite-fonts] Font "${family}" not found on Google Fonts (HTTP ${httpStatus}).`]

  if (suggestions.length > 0) {
    lines.push('', '  Did you mean:')
    for (const s of suggestions) lines.push(`    → ${s}`)
  }

  lines.push('', `  Check: https://fonts.google.com/?query=${encodeURIComponent(family)}`)

  return new Error(lines.join('\n'))
}

export function weightUnavailableError(family: string, weight: number | string): Error {
  return new Error(
    `[vite-fonts] "${family}" doesn't have weight ${weight}.\n\n` +
      `  Check available weights at: https://fonts.google.com/specimen/${encodeURIComponent(family)}`,
  )
}

export function variableCollisionError(variable: string, keys: string[]): Error {
  const familyLines = keys.map((k) => `  - families.${k}`).join('\n')
  return new Error(
    `[vite-fonts] Two families share variable "${variable}":\n${familyLines}\n\n` +
      `  Each variable must be unique. Rename one.`,
  )
}

export function networkError(family: string, cause: unknown): Error {
  let reason: string
  if (cause instanceof Error) reason = cause.message
  else if (typeof cause === 'string') reason = cause
  else reason = JSON.stringify(cause)
  return new Error(
    `[vite-fonts] Failed to download "${family}" from Google Fonts.\n\n` +
      `  ✗ ${reason}\n\n` +
      `  Options:\n` +
      `    1. Check internet connection\n` +
      `    2. Use local files instead`,
  )
}

export function localFileMissingError(path: string, familyKey: string): Error {
  return new Error(
    `[vite-fonts] Local font file not found:\n  ${path}\n\n` +
      `  Resolved from: vite.config.ts (families.${familyKey}.local)`,
  )
}
