import { createLogger } from 'vite'
import type { Logger } from 'vite'

let loggerInstance: Logger | null = null

export function setLogger(logger: Logger): void {
  loggerInstance = logger
}

export function getLogger(): Logger {
  if (!loggerInstance) loggerInstance = createLogger('info', { prefix: '[vite-fonts]' })
  return loggerInstance
}
