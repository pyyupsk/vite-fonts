import { createLogger } from 'vite'
import type { Logger } from 'vite'

const c = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
}

export const PREFIX = `${c.cyan}[vite-fonts]${c.reset}`
export const clr = c

let loggerInstance: Logger | null = null

export function setLogger(logger: Logger): void {
  loggerInstance = logger
}

export function getLogger() {
  const base = loggerInstance ?? createLogger('info')
  return {
    info: (msg: string) => base.info(`${PREFIX} ${msg}`),
    warn: (msg: string) => base.warn(`${PREFIX} ${msg}`),
    error: (msg: string) => base.error(`${PREFIX} ${msg}`),
  }
}
