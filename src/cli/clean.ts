import { rmSync } from 'node:fs'
import { join } from 'node:path'

import { defineCommand } from 'citty'
import { consola } from 'consola'

export const cleanCommand = defineCommand({
  meta: { name: 'clean', description: 'Remove font cache' },
  run() {
    const cacheDir = join(process.cwd(), 'node_modules', '.vite', 'fonts')
    try {
      rmSync(cacheDir, { recursive: true, force: true })
      consola.success(`Removed ${cacheDir}`)
    } catch (e) {
      consola.error(`Failed to remove cache: ${e instanceof Error ? e.message : String(e)}`)
      process.exit(1)
    }
  },
})
