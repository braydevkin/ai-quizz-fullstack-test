import { identifyUserSchema } from '@quiz/shared'
import { Router, type Request } from 'express'

import { parseOrThrow } from '../../utils/validation.js'
import { userParamsSchema } from './user.schema.js'
import { createUserService, type UserService } from './user.service.js'

/**
 * `/users` — the lightweight, passwordless identity surface.
 *
 * | Method | Path   | Success            |
 * | ------ | ------ | ------------------ |
 * | POST   | `/`    | 200 `User` (upsert)|
 * | GET    | `/:id` | 200 `User`         |
 *
 * `POST /` is the whole of sign in / sign up: it upserts on email, so it is
 * idempotent and returns 200 rather than 201 — a returning visitor is not a new
 * resource. Express 5 forwards a rejected async handler to `errorHandler`, so
 * nothing here needs try/catch.
 */
export const userRouter: Router = Router()

/** The pool is attached to `app.locals` by `attachDatabase`. */
const serviceFor = (req: Request): UserService => createUserService(req.app.locals.db)

const userIdOf = (req: Request): string =>
  parseOrThrow(userParamsSchema, req.params, 'Invalid user id').id

userRouter.post('/', async (req, res) => {
  const input = parseOrThrow(identifyUserSchema, req.body, 'Invalid user payload')

  res.json(await serviceFor(req).identify(input))
})

userRouter.get('/:id', async (req, res) => {
  res.json(await serviceFor(req).get(userIdOf(req)))
})
