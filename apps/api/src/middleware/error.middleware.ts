import { STATUS_CODES } from 'node:http'

import type { ErrorRequestHandler, RequestHandler } from 'express'

import { isProduction } from '../lib/env.js'

interface HttpError extends Error {
  status?: number
  statusCode?: number
}

/**
 * Terminal middleware for unmatched routes. Registered after the routing table
 * so anything reaching it is genuinely unknown.
 */
export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    statusCode: 404,
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  })
}

/**
 * Single JSON error shape for the whole API. Express 5 forwards rejected async
 * handlers here automatically, so handlers never need their own try/catch.
 *
 * `next` is unused but required: Express identifies error middleware by arity.
 */
export const errorHandler: ErrorRequestHandler = (error: HttpError, req, res, _next) => {
  const statusCode = error.status ?? error.statusCode ?? 500

  req.log.error({ err: error }, 'request failed')

  res.status(statusCode).json({
    statusCode,
    error: STATUS_CODES[statusCode] ?? 'Error',
    message: statusCode >= 500 && isProduction ? 'Internal Server Error' : error.message,
  })
}
