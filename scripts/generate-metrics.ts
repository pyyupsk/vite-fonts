import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { entireMetricsCollection } from '@capsizecss/metrics/entireMetricsCollection'

const OUT = resolve(import.meta.dir, '../src/metrics/data.json')

interface MetricsEntry {
  familyName: string
  category: string
  capHeight?: number
  ascent: number
  descent: number
  lineGap: number
  unitsPerEm: number
  xWidthAvg: number
}

const result: Record<
  string,
  {
    capHeight: number
    ascent: number
    descent: number
    lineGap: number
    unitsPerEm: number
    xWidthAvg: number
    category: string
  }
> = {
  $schema: 'https://json.schemastore.org/base.json' as unknown as never,
}

for (const entry of Object.values(entireMetricsCollection) as MetricsEntry[]) {
  result[entry.familyName] = {
    capHeight: entry.capHeight ?? 0,
    ascent: entry.ascent,
    descent: entry.descent,
    lineGap: entry.lineGap,
    unitsPerEm: entry.unitsPerEm,
    xWidthAvg: entry.xWidthAvg,
    category: entry.category,
  }
}

writeFileSync(OUT, JSON.stringify(result, null, 2) + '\n')
// oxlint-disable-next-line no-console
console.log(`Wrote ${Object.keys(result).length - 1} font metrics to src/metrics/data.json`)
