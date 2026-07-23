/**
 * Errors that carry an HTTP status.
 *
 * `errorHandler` (middleware/error.middleware.ts) already reads `status` off
 * whatever reaches it, so throwing one of these from a service or a handler is
 * all it takes to answer with that status — Express 5 forwards rejected async
 * handlers on its own.
 */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    /** Optional machine-readable context, e.g. zod issues on a 400. */
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

export const badRequest = (message: string, details?: unknown): HttpError =>
  new HttpError(400, message, details)

export const notFound = (message: string): HttpError => new HttpError(404, message)

export const conflict = (message: string): HttpError => new HttpError(409, message)
