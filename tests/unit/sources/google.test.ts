import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { normalize } from '@/config/normalize'
import { buildGoogleFontsUrl, parseGoogleFontsCss } from '@/sources/google'

const FIXTURE_CSS = readFileSync(resolve(__dirname, '../../fixtures/inter-400-700.css'), 'utf8')

describe('buildGoogleFontsUrl', () => {
  it('builds url for single weight', () => {
    const family = normalize(['Inter']).families[0]! // nosonar - noUncheckedIndexedAccess makes [0] T|undefined; ! is correct
    const url = buildGoogleFontsUrl(family)

    expect(url).toContain('fonts.googleapis.com/css2')
    expect(url).toContain('family=Inter')
    expect(url).toContain('400')
    expect(url).toContain('display=swap')
  })

  it('includes all default weights', () => {
    const family = normalize(['Inter']).families[0]! // nosonar - noUncheckedIndexedAccess makes [0] T|undefined; ! is correct
    const url = buildGoogleFontsUrl(family)

    expect(url).toContain('400')
    expect(url).toContain('500')
    expect(url).toContain('700')
  })

  it('builds variable font url with wght range', () => {
    const family = normalize(['Inter:variable']).families[0]! // nosonar - noUncheckedIndexedAccess makes [0] T|undefined; ! is correct
    const url = decodeURIComponent(buildGoogleFontsUrl(family))

    expect(url).toContain('Inter:wght@100..900')
  })

  it('includes ital axis for italic styles', () => {
    const base = normalize(['Inter']).families[0]! // nosonar - noUncheckedIndexedAccess makes [0] T|undefined; ! is correct
    const family = { ...base, styles: ['normal', 'italic'] as ('normal' | 'italic')[] }
    const url = decodeURIComponent(buildGoogleFontsUrl(family))

    expect(url).toContain('ital,wght')
    expect(url).toContain('0,400')
    expect(url).toContain('1,400')
  })
})

describe('parseGoogleFontsCss', () => {
  it('filters to latin subset by default (2 blocks from 14)', () => {
    const files = parseGoogleFontsCss(FIXTURE_CSS)
    expect(files).toHaveLength(2)
  })

  it('returns all 14 blocks when all subsets requested', () => {
    const files = parseGoogleFontsCss(FIXTURE_CSS, [
      'cyrillic-ext',
      'cyrillic',
      'greek-ext',
      'greek',
      'vietnamese',
      'latin-ext',
      'latin',
    ])
    expect(files).toHaveLength(14)
  })

  it('all urls point to fonts.gstatic.com woff2 files', () => {
    const files = parseGoogleFontsCss(FIXTURE_CSS)
    for (const file of files) {
      expect(file.url).toContain('fonts.gstatic.com')
      expect(file.url).toContain('.woff2')
    }
  })

  it('extracts correct family, weight, style for first block', () => {
    const file = parseGoogleFontsCss(FIXTURE_CSS)[0]!
    expect(file.family).toBe('Inter')
    expect(file.weight).toBe(400)
    expect(file.style).toBe('normal')
  })

  it('generates stable filename with subset', () => {
    const file = parseGoogleFontsCss(FIXTURE_CSS)[0]!
    expect(file.filename).toBe('inter-400-normal-latin.woff2')
  })

  it('parses both weight 400 and 700 blocks', () => {
    const files = parseGoogleFontsCss(FIXTURE_CSS)
    const weights = [...new Set(files.map((f) => f.weight))]
    expect(weights).toContain(400)
    expect(weights).toContain(700)
  })
})
