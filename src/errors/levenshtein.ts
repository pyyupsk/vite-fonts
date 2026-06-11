export function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: n + 1 }, (_, i) => i)

  for (let i = 1; i <= m; i++) {
    let prev = dp[0] as number
    dp[0] = i
    for (let j = 1; j <= n; j++) {
      const cur = dp[j] as number
      const left = dp[j - 1] as number
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, cur, left)
      prev = cur
    }
  }

  return dp[n] as number
}
