import { Router } from 'express'

/**
 * Liveness endpoint — the only route exposed in the infrastructure phase.
 *
 * `GET /` -> `{ "status": "ok" }`
 */
export const healthRouter: Router = Router()

healthRouter.get('/', (_req, res) => {
  res.json({ status: 'ok' })
})
