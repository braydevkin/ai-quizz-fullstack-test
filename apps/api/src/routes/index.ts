import type { Express } from 'express'

import { healthRouter } from './health.route.js'

/**
 * Application routing table.
 *
 * Feature routers live in `src/modules/<feature>` and get mounted here behind
 * their own prefix, e.g. `app.use('/quizzes', quizRouter)`.
 */
export function registerRoutes(app: Express): void {
  app.use('/', healthRouter)
}
