import type { Plugin } from 'vite'
import { describe, expect, it } from 'vitest'

import { fonts } from '@/index'

describe('fonts plugin', () => {
  it('returns a vite plugin object', () => {
    const plugin = fonts('Inter') as Plugin
    expect(plugin).toBeDefined()
    expect(plugin.name).toBe('vite-fonts')
  })

  it('accepts array input', () => {
    const plugin = fonts(['Inter', 'JetBrains Mono']) as Plugin
    expect(plugin.name).toBe('vite-fonts')
  })
})
