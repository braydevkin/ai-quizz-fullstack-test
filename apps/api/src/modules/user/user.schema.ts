import { z } from 'zod'

/**
 * Request-shape validation the transport owns.
 *
 * The body schema (`identifyUserSchema`) comes from `@quiz/shared` so the API
 * and the web app validate against the same rules. What is local to HTTP, like
 * the shape of a route parameter, belongs here.
 */

/** `/users/:id` — rejects a malformed id with a 400 before any query runs. */
export const userParamsSchema = z.object({ id: z.uuid() })

export type UserParams = z.infer<typeof userParamsSchema>
