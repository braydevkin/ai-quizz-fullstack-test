import type { Attempt, AttemptSummary, CreateAttemptInput, GradedAnswer, Quiz } from '@quiz/shared'
import type { Kysely } from 'kysely'

import type { Database } from '../../db/schema.js'
import { badRequest, notFound } from '../../utils/http-error.js'
import * as quizRepository from '../quiz/quiz.repository.js'
import * as attemptRepository from './attempt.repository.js'
import type { NewAttempt } from './attempt.repository.js'

/**
 * Attempt orchestration. Scores are computed here against the stored answer
 * key, never trusted from the client, then persisted.
 */

/** The slices of the repositories this service depends on — the seam tests fill. */
export interface AttemptStore {
  insert(db: Kysely<Database>, attempt: NewAttempt): Promise<Attempt>
  findById(db: Kysely<Database>, id: string): Promise<Attempt | null>
  listByUser(db: Kysely<Database>, userId: string): Promise<AttemptSummary[]>
}

export interface QuizLookup {
  findById(db: Kysely<Database>, id: string): Promise<Quiz | null>
}

export interface AttemptService {
  submit(input: CreateAttemptInput): Promise<Attempt>
  get(id: string): Promise<Attempt>
  listByUser(userId: string): Promise<AttemptSummary[]>
}

/**
 * Grade a submission against the quiz's answer key.
 *
 * Pure and exported so the scoring can be tested without a database. `total` is
 * the quiz's question count, so skipping a question counts against the score.
 * An answer naming a question the quiz doesn't have is a client error.
 */
export function grade(
  quiz: Quiz,
  answers: CreateAttemptInput['answers'],
): { score: number; total: number; graded: GradedAnswer[] } {
  const correctById = new Map(quiz.questions.map((q) => [q.id, q.correctAnswer]))

  const graded = answers.map((answer): GradedAnswer => {
    const correctAnswer = correctById.get(answer.questionId)

    if (correctAnswer === undefined) {
      throw badRequest(`Question ${answer.questionId} is not part of quiz "${quiz.id}"`)
    }

    return {
      questionId: answer.questionId,
      selectedAnswer: answer.selectedAnswer,
      correctAnswer,
      correct: answer.selectedAnswer === correctAnswer,
    }
  })

  return {
    score: graded.filter((answer) => answer.correct).length,
    total: quiz.questions.length,
    graded,
  }
}

export function createAttemptService(
  db: Kysely<Database>,
  deps: { attempts: AttemptStore; quizzes: QuizLookup } = {
    attempts: attemptRepository,
    quizzes: quizRepository,
  },
): AttemptService {
  return {
    submit: async (input) => {
      const quiz = await deps.quizzes.findById(db, input.quizId)

      if (!quiz) throw notFound(`Quiz "${input.quizId}" not found`)

      const { score, total, graded } = grade(quiz, input.answers)

      // A bad `userId` trips the foreign key rather than a lookup here — the id
      // always comes from a prior identify, so the extra round trip isn't worth it.
      return deps.attempts.insert(db, {
        userId: input.userId,
        quizId: quiz.id,
        quizTitle: quiz.title,
        score,
        total,
        answers: graded,
      })
    },

    get: async (id) => {
      const attempt = await deps.attempts.findById(db, id)

      if (!attempt) throw notFound(`Attempt "${id}" not found`)

      return attempt
    },

    listByUser: (userId) => deps.attempts.listByUser(db, userId),
  }
}
