import { z } from 'zod'

import { questionIdSchema, quizIdSchema } from './quiz.schema.js'

/**
 * Attempt models — a completed quiz run, its score and its per-question answers.
 *
 * The client submits only *which option it chose* per question; the API grades
 * against the stored answer key, so a score can't be forged from the browser.
 * `selectedAnswer`/`correctAnswer` are zero-based indices into the question's
 * options, exactly like `correctAnswer` on the quiz itself.
 */

/** One submitted answer: the question and the option index the user picked. */
export const answerInputSchema = z.object({
  questionId: questionIdSchema,
  selectedAnswer: z.int().min(0),
})

/** Submit payload for `POST /attempts`. The score is computed server-side. */
export const createAttemptSchema = z.object({
  userId: z.uuid(),
  quizId: quizIdSchema,
  answers: z.array(answerInputSchema).min(1),
})

/** An answer once graded — what the review screen renders. */
export const gradedAnswerSchema = z.object({
  questionId: questionIdSchema,
  selectedAnswer: z.int().min(0),
  correctAnswer: z.int().min(0),
  correct: z.boolean(),
})

/** A stored attempt with its full graded answer set. */
export const attemptSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  quizId: quizIdSchema,
  /** Snapshot of the title at submit time, so history survives a quiz rename. */
  quizTitle: z.string(),
  score: z.int().min(0),
  total: z.int().min(0),
  answers: z.array(gradedAnswerSchema),
  /** ISO 8601 timestamp, as it travels over the wire. */
  createdAt: z.string(),
})

/** History-list shape — everything but the per-question answers. */
export const attemptSummarySchema = attemptSchema.omit({ userId: true, answers: true })
