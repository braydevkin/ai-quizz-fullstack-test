/**
 * Turn a percentage score into a performance tier.
 *
 * Shared so the results screen and the dashboard label a score the same way.
 * Thresholds are editorial and kept here as the single place to tune them.
 */

export type PerformanceTier = 'excellent' | 'keep-practicing' | 'needs-review'

export interface Performance {
  tier: PerformanceTier
  /** Short headline, e.g. shown large on the results screen. */
  label: string
  /** One encouraging sentence to sit under the label. */
  message: string
}

/** Inclusive lower bounds, checked high to low. */
export const PERFORMANCE_THRESHOLDS = {
  excellent: 80,
  keepPracticing: 50,
} as const

/** `percentage` is 0–100. Values outside the range are clamped by comparison. */
export function getPerformanceTier(percentage: number): Performance {
  if (percentage >= PERFORMANCE_THRESHOLDS.excellent) {
    return {
      tier: 'excellent',
      label: 'Excellent',
      message: 'Outstanding work — you know this material well.',
    }
  }

  if (percentage >= PERFORMANCE_THRESHOLDS.keepPracticing) {
    return {
      tier: 'keep-practicing',
      label: 'Keep practicing',
      message: 'A solid effort — a little more review and you will have it.',
    }
  }

  return {
    tier: 'needs-review',
    label: 'Needs review',
    message: 'Revisit the explanations and give it another go.',
  }
}
