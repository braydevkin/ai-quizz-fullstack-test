import type { Express } from 'express'
import type { Kysely } from 'kysely'

import type { Database } from '../db/schema.js'
import { db } from '../lib/db.js'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- the augmentation point Express's types expose
  namespace Express {
    interface Locals {
      db: Kysely<Database>
    }
  }
}

/**
 * Exposes the Kysely instance as `app.locals.db`, reachable from any handler
 * via `req.app.locals.db`. The connection pool is torn down in `server.ts`.
 */
export function attachDatabase(app: Express): void {
  app.locals.db = db
}
