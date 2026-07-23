import type { Express } from 'express'

import { quizRouter } from '../modules/quiz/quiz.routes.js'
import { healthRouter } from './health.route.js'

/**
 * Application routing table.
 *
 * Feature routers live in `src/modules/<feature>` and get mounted here behind
 * their own prefix.
 */
export function registerRoutes(app: Express): void {
  app.use('/', healthRouter)
  app.use('/quizzes', quizRouter)
}
