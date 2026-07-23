import cors from 'cors'
import type { RequestHandler } from 'express'

import { env } from '../lib/env.js'

/**
 * CORS, driven entirely by the `CORS_ORIGIN` environment variable
 * (comma-separated list, or `*` to allow any origin).
 */
const origins = env.CORS_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

export const corsMiddleware: RequestHandler = cors({
  origin: origins.includes('*') ? true : origins,
  credentials: true,
})
