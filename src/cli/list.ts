import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { defineCommand } from 'citty'
import { consola } from 'consola'

import type { CacheManifest } from '@/cache/manager'

function readManifest(cacheDir: string): CacheManifest | null {
  try {
    return JSON.parse(readFileSync(join(cacheDir, 'manifest.json'), 'utf8')) as CacheManifest
  } catch {
    return null
  }
}

export const listCommand = defineCommand({
  meta: { name: 'list', description: 'Show cached fonts' },
  args: {
    verbose: { type: 'boolean', alias: ['v'], description: 'Show per-file detail', default: false },
  },
  run({ args }) {
    const cacheDir = join(process.cwd(), 'node_modules', '.vite', 'fonts')
    const manifest = readManifest(cacheDir)

    if (!manifest) {
      consola.warn('No cache found. Run `vite` or `vite build` first.')
      return
    }

    const entries = Object.entries(manifest.families)
    consola.info(`@pyyupsk/vite-fonts cache — ${cacheDir}\n`)

    for (const [key, entry] of entries) {
      const count = entry.files.length
      const hash = entry.hash.slice(0, 8)

      if (args.verbose) {
        consola.log(`  ${key}  [${hash}]`)
        for (const file of entry.fontFiles ?? []) {
          consola.log(
            `    ${file.filename.padEnd(40)} ${String(file.weight).padEnd(8)} ${file.style}`,
          )
        }
      } else {
        const label = count === 1 ? '1 file ' : `${count} files`
        consola.log(`  ${key.padEnd(20)} ${label}  [${hash}]`)
      }
    }

    consola.success(`${entries.length} ${entries.length === 1 ? 'family' : 'families'} cached`)
  },
})
