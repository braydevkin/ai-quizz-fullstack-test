import { createAttemptSchema } from '@quiz/shared'
import { Router, type Request } from 'express'

import { parseOrThrow } from '../../utils/validation.js'
import { attemptParamsSchema, attemptQuerySchema } from './attempt.schema.js'
import { createAttemptService, type AttemptService } from './attempt.service.js'

/**
 * `/attempts` — recording and reading quiz runs.
 *
 * | Method | Path            | Success             |
 * | ------ | --------------- | ------------------- |
 * | POST   | `/`             | 201 `Attempt`       |
 * | GET    | `/?userId=…`    | 200 `AttemptSummary[]` (history) |
 * | GET    | `/:id`          | 200 `Attempt` (review) |
 *
 * The score is never taken from the client: `POST /` submits only the chosen
 * options and the service grades against the stored answer key. Express 5
 * forwards a rejected async handler to `errorHandler`, so nothing needs try/catch.
 */
export const attemptRouter: Router = Router()

/** The pool is attached to `app.locals` by `attachDatabase`. */
const serviceFor = (req: Request): AttemptService => createAttemptService(req.app.locals.db)

const attemptIdOf = (req: Request): string =>
  parseOrThrow(attemptParamsSchema, req.params, 'Invalid attempt id').id

attemptRouter.post('/', async (req, res) => {
  const input = parseOrThrow(createAttemptSchema, req.body, 'Invalid attempt payload')
  const attempt = await serviceFor(req).submit(input)

  res.status(201).location(`/attempts/${attempt.id}`).json(attempt)
})

attemptRouter.get('/', async (req, res) => {
  const { userId } = parseOrThrow(attemptQuerySchema, req.query, 'Invalid attempt query')

  res.json(await serviceFor(req).listByUser(userId))
})

attemptRouter.get('/:id', async (req, res) => {
  res.json(await serviceFor(req).get(attemptIdOf(req)))
})
