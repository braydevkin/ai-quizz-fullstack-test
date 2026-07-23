import { z } from 'zod'

/**
 * Request-shape validation the transport owns.
 *
 * The body schema (`createAttemptSchema`) comes from `@quiz/shared`; what is
 * local to HTTP — the route parameter and the list query — belongs here.
 */

/** `/attempts/:id`. */
export const attemptParamsSchema = z.object({ id: z.uuid() })

/** `GET /attempts?userId=…` — the history list is always scoped to a user. */
export const attemptQuerySchema = z.object({ userId: z.uuid() })

export type AttemptParams = z.infer<typeof attemptParamsSchema>
export type AttemptQuery = z.infer<typeof attemptQuerySchema>
