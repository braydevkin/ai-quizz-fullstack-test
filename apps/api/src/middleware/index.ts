import express, { type Express } from 'express'

import { corsMiddleware } from './cors.middleware.js'
import { attachDatabase } from './db.middleware.js'
import { errorHandler, notFoundHandler } from './error.middleware.js'
import { requestLogger } from './logger.middleware.js'

/**
 * Cross-cutting infrastructure concerns, applied before the routing table.
 * Register new middleware here so `app.ts` stays a thin composition root.
 */
export function registerMiddleware(app: Express): void {
  app.use(requestLogger)
  app.use(corsMiddleware)
  app.use(express.json())

  attachDatabase(app)
}

/**
 * Must be registered *after* every route: Express matches middleware in order,
 * so a 404 handler mounted earlier would swallow the whole routing table.
 */
export function registerErrorHandlers(app: Express): void {
  app.use(notFoundHandler)
  app.use(errorHandler)
}
