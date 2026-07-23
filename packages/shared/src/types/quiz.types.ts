import type { z } from 'zod'

import type {
  createQuestionSchema,
  createQuizSchema,
  questionSchema,
  quizSchema,
  quizSummarySchema,
  updateQuizSchema,
} from '../schemas/quiz.schema.js'

/**
 * Quiz domain types.
 *
 * Inferred from the zod schemas so a model change can't drift from the
 * validation that guards it — edit `schemas/quiz.schema.ts`, not this file.
 */

export type Question = z.infer<typeof questionSchema>
export type Quiz = z.infer<typeof quizSchema>
export type QuizSummary = z.infer<typeof quizSummarySchema>

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>
export type CreateQuizInput = z.infer<typeof createQuizSchema>
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>
