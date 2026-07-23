import { describe, expect, it } from '@jest/globals'

import type { AttemptRow } from '../../db/schema.js'
import { toAttempt, toAttemptSummary } from './attempt.repository.js'

/**
 * The row-mapping boundary only — the query builders are exercised against a
 * real database by hand, not mocked here.
 */

const attemptRow: AttemptRow = {
  id: '22222222-2222-4222-8222-222222222222',
  user_id: '11111111-1111-4111-8111-111111111111',
  quiz_id: 'agent-fundamentals',
  quiz_title: 'Agent Fundamentals',
  score: 2,
  total: 3,
  answers: [{ questionId: 1, selectedAnswer: 0, correctAnswer: 0, correct: true }],
  created_at: new Date('2026-07-24T12:00:00Z'),
}

describe('toAttempt', () => {
  it('maps the row to the domain shape with an ISO timestamp', () => {
    expect(toAttempt(attemptRow)).toEqual({
      id: '22222222-2222-4222-8222-222222222222',
      userId: '11111111-1111-4111-8111-111111111111',
      quizId: 'agent-fundamentals',
      quizTitle: 'Agent Fundamentals',
      score: 2,
      total: 3,
      answers: [{ questionId: 1, selectedAnswer: 0, correctAnswer: 0, correct: true }],
      createdAt: '2026-07-24T12:00:00.000Z',
    })
  })
})

describe('toAttemptSummary', () => {
  it('drops the user id and the per-question answers', () => {
    const summary = toAttemptSummary(attemptRow)

    expect(summary).not.toHaveProperty('userId')
    expect(summary).not.toHaveProperty('answers')
    expect(summary).toMatchObject({ id: attemptRow.id, score: 2, total: 3 })
  })
})
