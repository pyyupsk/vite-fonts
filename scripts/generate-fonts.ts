import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const METADATA_URL = 'https://fonts.google.com/metadata/fonts'
const OUT = resolve(import.meta.dir, '../src/errors/fonts.json')

interface FontsMetadata {
  familyMetadataList: Array<{ family: string }>
}

const res = await fetch(METADATA_URL)
if (!res.ok) throw new Error(`Failed to fetch Google Fonts metadata: HTTP ${res.status}`)

const data = (await res.json()) as FontsMetadata
const families = data.familyMetadataList.map((f) => f.family).toSorted((a, b) => a.localeCompare(b))

writeFileSync(OUT, JSON.stringify(families, null, 2) + '\n')
// oxlint-disable-next-line no-console
console.log(`Wrote ${families.length} fonts to src/errors/fonts.json`)
