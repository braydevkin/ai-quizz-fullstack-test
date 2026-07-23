/**
 * Fisher–Yates shuffle, returning a new array (the input is left untouched).
 *
 * Used to randomise question and option order for a replayable run. Plain
 * `Math.random` is fine here — this is presentation, not anything that needs to
 * be unpredictable or reproducible.
 */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items]

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    // `i > 0` and `0 <= j <= i` keep both indices in range.
    const temp = result[i]!
    result[i] = result[j]!
    result[j] = temp
  }

  return result
}
