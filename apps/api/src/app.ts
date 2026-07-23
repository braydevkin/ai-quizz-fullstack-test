import express, { type Express } from 'express'

import { registerErrorHandlers, registerMiddleware } from './middleware/index.js'
import { registerRoutes } from './routes/index.js'

/**
 * Composition root: builds a fully wired Express app without starting it.
 *
 * Keeping this separate from `server.ts` means the app can later be booted by
 * anything (tests, serverless adapters, scripts) without side effects.
 */
export function createApp(): Express {
  const app = express()

  app.set('trust proxy', true)
  app.disable('x-powered-by')

  registerMiddleware(app)
  registerRoutes(app)
  registerErrorHandlers(app)

  return app
}
