import { createQuizSchema, replaceQuizSchema, updateQuizSchema } from '@quiz/shared'
import { Router, type Request } from 'express'

import { parseOrThrow } from '../../utils/validation.js'
import { quizParamsSchema } from './quiz.schema.js'
import { createQuizService, type QuizService } from './quiz.service.js'

/**
 * `/quizzes` — CRUD over quiz content.
 *
 * | Method | Path       | Success                    |
 * | ------ | ---------- | -------------------------- |
 * | GET    | `/`        | 200 `QuizSummary[]`        |
 * | GET    | `/:id`     | 200 `Quiz`                 |
 * | POST   | `/`        | 201 `Quiz` + `Location`    |
 * | PUT    | `/:id`     | 200 `Quiz` (full replace)  |
 * | PATCH  | `/:id`     | 200 `Quiz` (partial)       |
 * | DELETE | `/:id`     | 204                        |
 *
 * Express 5 forwards a rejected async handler to `errorHandler` by itself, so
 * nothing here needs try/catch: `parseOrThrow` and the service throw `HttpError`
 * and the error middleware turns it into the API's single JSON error shape.
 */
export const quizRouter: Router = Router()

/** The pool is attached to `app.locals` by `attachDatabase`. */
const serviceFor = (req: Request): QuizService => createQuizService(req.app.locals.db)

const quizIdOf = (req: Request): string =>
  parseOrThrow(quizParamsSchema, req.params, 'Invalid quiz id').id

quizRouter.get('/', async (req, res) => {
  res.json(await serviceFor(req).list())
})

quizRouter.get('/:id', async (req, res) => {
  res.json(await serviceFor(req).get(quizIdOf(req)))
})

quizRouter.post('/', async (req, res) => {
  const input = parseOrThrow(createQuizSchema, req.body, 'Invalid quiz payload')
  const quiz = await serviceFor(req).create(input)

  res.status(201).location(`/quizzes/${quiz.id}`).json(quiz)
})

quizRouter.put('/:id', async (req, res) => {
  const id = quizIdOf(req)
  const input = parseOrThrow(replaceQuizSchema, req.body, 'Invalid quiz payload')

  res.json(await serviceFor(req).replace(id, input))
})

quizRouter.patch('/:id', async (req, res) => {
  const id = quizIdOf(req)
  const input = parseOrThrow(updateQuizSchema, req.body, 'Invalid quiz payload')

  res.json(await serviceFor(req).patch(id, input))
})

quizRouter.delete('/:id', async (req, res) => {
  await serviceFor(req).remove(quizIdOf(req))

  res.status(204).end()
})
