import { describe, expect, it } from 'vitest'

import { normalize } from '@/config/normalize'

describe('normalize', () => {
  it('single string applies all defaults', () => {
    // tracer bullet
    const config = normalize('Inter')

    expect(config.source).toBe('google')
    expect(config.inject).toBe('auto')
    expect(config.families).toHaveLength(1)

    const family = config.families[0]! // nosonar - noUncheckedIndexedAccess makes [0] T|undefined; ! is correct
    expect(family.key).toBe('inter')
    expect(family.family).toBe('Inter')
    expect(family.weights).toEqual([400, 500, 700])
    expect(family.styles).toEqual(['normal'])
    expect(family.subsets).toEqual(['latin'])
    expect(family.display).toBe('swap')
    expect(family.variable).toBe('--font-inter')
    expect(family.preload).toBe(true)
  })

  it(':variable suffix sets weights to ["variable"]', () => {
    const config = normalize('Inter:variable')
    const family = config.families[0]! // nosonar - noUncheckedIndexedAccess makes [0] T|undefined; ! is correct
    expect(family.family).toBe('Inter')
    expect(family.weights).toEqual(['variable'])
  })

  it('array of strings produces multiple families', () => {
    const config = normalize(['Inter', 'JetBrains Mono'])
    expect(config.families).toHaveLength(2)
    expect(config.families[0]?.family).toBe('Inter')
    expect(config.families[1]?.family).toBe('JetBrains Mono')
  })

  it('multi-word family gets kebab variable and key', () => {
    const config = normalize('JetBrains Mono')
    const family = config.families[0]! // nosonar - noUncheckedIndexedAccess makes [0] T|undefined; ! is correct
    expect(family.key).toBe('jetbrains-mono')
    expect(family.variable).toBe('--font-jetbrains-mono')
  })

  it('object with families array uses top-level display', () => {
    const config = normalize({ display: 'optional', families: ['Inter'] })
    expect(config.families[0]?.display).toBe('optional')
  })

  it('object with families map uses per-family config', () => {
    const config = normalize({
      families: {
        sans: { family: 'Inter', weights: [400, 700], variable: '--font-sans' },
        mono: { family: 'JetBrains Mono', weights: ['variable'] },
      },
    })
    expect(config.families).toHaveLength(2)

    const sans = config.families.find((f) => f.key === 'sans')
    expect(sans?.family).toBe('Inter')
    expect(sans?.weights).toEqual([400, 700])
    expect(sans?.variable).toBe('--font-sans')

    const mono = config.families.find((f) => f.key === 'mono')
    expect(mono?.weights).toEqual(['variable'])
    expect(mono?.variable).toBe('--font-jetbrains-mono')
  })

  it('source and inject forwarded from options', () => {
    const config = normalize({ source: 'bunny', inject: false, families: ['Inter'] })
    expect(config.source).toBe('bunny')
    expect(config.inject).toBe(false)
  })
})
