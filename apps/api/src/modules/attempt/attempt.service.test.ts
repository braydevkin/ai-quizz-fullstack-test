import type { Attempt, CreateAttemptInput, Quiz } from '@quiz/shared'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { Kysely } from 'kysely'

import type { Database } from '../../db/schema.js'
import { HttpError } from '../../utils/http-error.js'
import {
  createAttemptService,
  grade,
  type AttemptStore,
  type QuizLookup,
} from './attempt.service.js'

/** The service never touches the instance — it only threads it to the stores. */
const db = {} as Kysely<Database>

const question = (id: number, correctAnswer: number) => ({
  id,
  question: `q${id}`,
  options: ['a', 'b', 'c', 'd'],
  correctAnswer,
  explanation: 'because',
})

const quiz: Quiz = {
  id: 'agent-fundamentals',
  title: 'Agent Fundamentals',
  description: 'Test your knowledge of AI agent design',
  questions: [question(1, 0), question(2, 3), question(3, 1)],
}

describe('grade', () => {
  it('scores against the answer key and counts the quiz size as the total', () => {
    const answers: CreateAttemptInput['answers'] = [
      { questionId: 1, selectedAnswer: 0 }, // correct
      { questionId: 2, selectedAnswer: 2 }, // wrong
      { questionId: 3, selectedAnswer: 1 }, // correct
    ]

    const { score, total, graded } = grade(quiz, answers)

    expect(score).toBe(2)
    expect(total).toBe(3)
    expect(graded[1]).toEqual({
      questionId: 2,
      selectedAnswer: 2,
      correctAnswer: 3,
      correct: false,
    })
  })

  it('counts a total from the quiz even when a question is left unanswered', () => {
    expect(grade(quiz, [{ questionId: 1, selectedAnswer: 0 }])).toMatchObject({
      score: 1,
      total: 3,
    })
  })

  it('rejects an answer for a question the quiz does not have', () => {
    expect(() => grade(quiz, [{ questionId: 99, selectedAnswer: 0 }])).toThrow(HttpError)
  })
})

let attempts: AttemptStore
let quizzes: QuizLookup

beforeEach(() => {
  attempts = {
    insert: jest.fn<AttemptStore['insert']>(),
    findById: jest.fn<AttemptStore['findById']>(),
    listByUser: jest.fn<AttemptStore['listByUser']>(),
  }
  quizzes = { findById: jest.fn<QuizLookup['findById']>() }
})

const service = () => createAttemptService(db, { attempts, quizzes })

async function expectStatus(promise: Promise<unknown>, status: number): Promise<void> {
  await expect(promise).rejects.toThrow(HttpError)
  await expect(promise).rejects.toMatchObject({ status })
}

const submission: CreateAttemptInput = {
  userId: '11111111-1111-4111-8111-111111111111',
  quizId: 'agent-fundamentals',
  answers: [
    { questionId: 1, selectedAnswer: 0 },
    { questionId: 2, selectedAnswer: 3 },
    { questionId: 3, selectedAnswer: 0 },
  ],
}

describe('submit', () => {
  it('grades server-side and persists the snapshot', async () => {
    jest.mocked(quizzes.findById).mockResolvedValue(quiz)
    jest.mocked(attempts.insert).mockImplementation(
      async (_db, attempt) =>
        ({
          ...attempt,
          id: 'attempt-1',
          createdAt: '2026-07-24T00:00:00.000Z',
          answers: [],
        }) as unknown as Attempt,
    )

    await service().submit(submission)

    expect(attempts.insert).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        userId: submission.userId,
        quizId: 'agent-fundamentals',
        quizTitle: 'Agent Fundamentals',
        score: 2,
        total: 3,
      }),
    )
  })

  it('404s when the quiz does not exist', async () => {
    jest.mocked(quizzes.findById).mockResolvedValue(null)

    await expectStatus(service().submit(submission), 404)
    expect(attempts.insert).not.toHaveBeenCalled()
  })
})

describe('get', () => {
  it('404s when there is no such attempt', async () => {
    jest.mocked(attempts.findById).mockResolvedValue(null)

    await expectStatus(service().get('nope'), 404)
  })
})
