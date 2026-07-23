import type { RequestHandler } from 'express'
import { pinoHttp } from 'pino-http'

import { logger } from '../lib/logger.js'

/**
 * Request/response logging, and a request-scoped child logger on `req.log`.
 */
export const requestLogger: RequestHandler = pinoHttp({ logger })
