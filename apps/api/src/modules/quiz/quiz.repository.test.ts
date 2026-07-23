import type { Question } from '@quiz/shared'
import { describe, expect, it } from '@jest/globals'

import type { QuestionRow, QuizRow } from '../../db/schema.js'
import { toQuestionRows, toQuiz } from './quiz.repository.js'

/**
 * The row-mapping boundary only — the query builders are exercised against a
 * real database by hand, not mocked here.
 */

const quizRow: QuizRow = {
  id: 'agent-fundamentals',
  title: 'Agent Fundamentals',
  description: 'Test your knowledge of AI agent design and implementation',
  created_at: new Date('2026-07-23T00:00:00Z'),
  updated_at: new Date('2026-07-23T00:00:00Z'),
}

const questionRow: QuestionRow = {
  quiz_id: 'agent-fundamentals',
  id: 1,
  position: 0,
  question: 'What is the primary purpose of an AI agent?',
  options: ['To replace human workers', 'To autonomously perform tasks'],
  correct_answer: 1,
  explanation: 'AI agents act autonomously.',
}

describe('toQuiz', () => {
  it('nests questions under the quiz in camelCase', () => {
    expect(toQuiz(quizRow, [questionRow])).toEqual({
      id: 'agent-fundamentals',
      title: 'Agent Fundamentals',
      description: 'Test your knowledge of AI agent design and implementation',
      questions: [
        {
          id: 1,
          question: 'What is the primary purpose of an AI agent?',
          options: ['To replace human workers', 'To autonomously perform tasks'],
          correctAnswer: 1,
          explanation: 'AI agents act autonomously.',
        },
      ],
    })
  })

  it('drops the timestamps and the foreign key from the domain shape', () => {
    const quiz = toQuiz(quizRow, [questionRow])

    expect(quiz).not.toHaveProperty('created_at')
    expect(quiz.questions[0]).not.toHaveProperty('quiz_id')
    expect(quiz.questions[0]).not.toHaveProperty('position')
  })

  it('maps a quiz with no questions to an empty array', () => {
    expect(toQuiz(quizRow, []).questions).toEqual([])
  })
})

describe('toQuestionRows', () => {
  const questions: Question[] = [
    {
      id: 7,
      question: 'first',
      options: ['a', 'b'],
      correctAnswer: 0,
      explanation: 'because',
    },
    {
      id: 3,
      question: 'second',
      options: ['c', 'd'],
      correctAnswer: 1,
      explanation: 'because',
    },
  ]

  it('numbers positions from the array order, not from the ids', () => {
    expect(
      toQuestionRows('agent-fundamentals', questions).map((row) => [row.id, row.position]),
    ).toEqual([
      [7, 0],
      [3, 1],
    ])
  })

  it('stamps every row with the owning quiz and snake_cases the answer key', () => {
    const rows = toQuestionRows('agent-fundamentals', questions)

    expect(rows.every((row) => row.quiz_id === 'agent-fundamentals')).toBe(true)
    expect(rows[0]).toMatchObject({ correct_answer: 0, options: ['a', 'b'] })
  })
})
