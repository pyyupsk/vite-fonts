import { createLogger } from 'vite'
import type { Logger } from 'vite'

let _logger: Logger | null = null

export function setLogger(logger: Logger): void {
  _logger = logger
}

export function getLogger(): Logger {
  if (!_logger) _logger = createLogger('info', { prefix: '[vite-fonts]' })
  return _logger
}
