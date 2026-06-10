import { createHash } from 'node:crypto'

import type { FontsConfig } from '../types'

export function hashConfig(config: FontsConfig): string {
  const digest = createHash('sha256').update(JSON.stringify(config)).digest('hex')
  return digest.slice(0, 8)
}
