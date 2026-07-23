import type { ZodType } from 'zod'

import { badRequest } from './http-error.js'

/**
 * Parse untrusted input against a zod schema, turning a failure into a 400.
 *
 * Issues are mapped by hand rather than through one of zod's formatting
 * helpers: `path` + `message` is the shape clients actually need, and it does
 * not move when zod reshuffles its error utilities.
 */
export function parseOrThrow<TOutput>(
  schema: ZodType<TOutput>,
  value: unknown,
  message = 'Validation failed',
): TOutput {
  const result = schema.safeParse(value)

  if (!result.success) {
    throw badRequest(
      message,
      result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    )
  }

  return result.data
}
