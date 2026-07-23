import type { AttemptSummary } from '@quiz/shared'

/**
 * Roll a user's attempt history up into the handful of numbers the dashboard
 * shows. Pure, so it can be unit-tested without rendering.
 */

export interface DashboardStats {
  totalAttempts: number
  /** Distinct quizzes the user has completed at least once. */
  quizzesCompleted: number
  /** Mean score across every attempt, 0–100. */
  averagePercent: number
  /** Best single score, 0–100. */
  bestPercent: number
}

/** A single attempt's score as a rounded percentage. */
export function percentOf(attempt: Pick<AttemptSummary, 'score' | 'total'>): number {
  return attempt.total === 0 ? 0 : Math.round((attempt.score / attempt.total) * 100)
}

export function computeStats(attempts: AttemptSummary[]): DashboardStats {
  if (attempts.length === 0) {
    return { totalAttempts: 0, quizzesCompleted: 0, averagePercent: 0, bestPercent: 0 }
  }

  const percentages = attempts.map(percentOf)
  const distinctQuizzes = new Set(attempts.map((attempt) => attempt.quizId))
  const sum = percentages.reduce((total, percent) => total + percent, 0)

  return {
    totalAttempts: attempts.length,
    quizzesCompleted: distinctQuizzes.size,
    averagePercent: Math.round(sum / attempts.length),
    bestPercent: Math.max(...percentages),
  }
}
