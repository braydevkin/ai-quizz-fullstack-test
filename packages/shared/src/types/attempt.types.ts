import type { z } from 'zod'

import type {
  answerInputSchema,
  attemptSchema,
  attemptSummarySchema,
  createAttemptSchema,
  gradedAnswerSchema,
} from '../schemas/attempt.schema.js'

/**
 * Attempt domain types.
 *
 * Inferred from the zod schemas so the model can't drift from the validation
 * that guards it — edit `schemas/attempt.schema.ts`, not this file.
 */

export type AnswerInput = z.infer<typeof answerInputSchema>
export type CreateAttemptInput = z.infer<typeof createAttemptSchema>
export type GradedAnswer = z.infer<typeof gradedAnswerSchema>
export type Attempt = z.infer<typeof attemptSchema>
export type AttemptSummary = z.infer<typeof attemptSummarySchema>
