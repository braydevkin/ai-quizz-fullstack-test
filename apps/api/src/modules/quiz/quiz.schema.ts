import { quizIdSchema } from '@quiz/shared'
import { z } from 'zod'

/**
 * Request-shape validation the transport owns.
 *
 * Body schemas are *not* redefined here — `createQuizSchema`,
 * `replaceQuizSchema` and `updateQuizSchema` come from `@quiz/shared` so the
 * API and the web app validate payloads against the very same rules. What is
 * local to HTTP, like the shape of a route parameter, belongs in this file.
 */

/** `/quizzes/:id` — rejects a malformed slug with a 400 before any query runs. */
export const quizParamsSchema = z.object({ id: quizIdSchema })

export type QuizParams = z.infer<typeof quizParamsSchema>
