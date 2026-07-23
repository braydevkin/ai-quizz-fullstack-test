import type { AttemptSummary } from '@quiz/shared'

import { computeStats, percentOf } from './stats'

const attempt = (quizId: string, score: number, total: number): AttemptSummary => ({
  id: `${quizId}-${score}`,
  quizId,
  quizTitle: quizId,
  score,
  total,
  createdAt: '2026-07-24T00:00:00.000Z',
})

describe('percentOf', () => {
  it('rounds the score to a percentage', () => {
    expect(percentOf({ score: 2, total: 3 })).toBe(67)
  })

  it('is zero for an empty quiz rather than NaN', () => {
    expect(percentOf({ score: 0, total: 0 })).toBe(0)
  })
})

describe('computeStats', () => {
  it('returns zeroes for no attempts', () => {
    expect(computeStats([])).toEqual({
      totalAttempts: 0,
      quizzesCompleted: 0,
      averagePercent: 0,
      bestPercent: 0,
    })
  })

  it('aggregates count, distinct quizzes, average and best', () => {
    const stats = computeStats([
      attempt('a', 5, 5), // 100
      attempt('a', 3, 5), // 60
      attempt('b', 4, 5), // 80
    ])

    expect(stats).toEqual({
      totalAttempts: 3,
      quizzesCompleted: 2,
      averagePercent: 80,
      bestPercent: 100,
    })
  })
})
