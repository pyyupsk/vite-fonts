import { describe, expect, it } from 'vitest'

import { fonts } from '@/index'

describe('fonts plugin', () => {
  it('returns a vite plugin object', () => {
    const plugin = fonts('Inter')
    expect(plugin).toBeDefined()
    expect(plugin.name).toBe('vite-fonts')
  })

  it('accepts array input', () => {
    const plugin = fonts(['Inter', 'JetBrains Mono'])
    expect(plugin.name).toBe('vite-fonts')
  })
})
