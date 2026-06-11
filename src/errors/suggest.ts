import fontsList from './fonts.json'
import { levenshtein } from './levenshtein'

export function suggestFonts(query: string, maxResults = 3): string[] {
  const q = query.toLowerCase()

  return fontsList
    .map((name) => ({ name, dist: levenshtein(q, name.toLowerCase()) }))
    .toSorted((a, b) => a.dist - b.dist)
    .slice(0, maxResults)
    .filter((r) => r.dist <= Math.max(3, Math.floor(q.length / 2)))
    .map((r) => r.name)
}
