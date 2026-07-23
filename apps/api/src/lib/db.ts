import { Kysely, PostgresDialect } from 'kysely'
import pg from 'pg'

import type { Database } from '../db/schema.js'
import { env, isProduction } from './env.js'

const { Pool } = pg

/**
 * Single connection pool and Kysely instance for the process.
 *
 * Cached on `globalThis` so `tsx watch` reloads do not open a new pool on every
 * file change. `pg` connects lazily, so the API still boots without a live
 * database.
 */
const globalForDb = globalThis as unknown as {
  pool?: pg.Pool
  db?: Kysely<Database>
}

const pool = globalForDb.pool ?? new Pool({ connectionString: env.DATABASE_URL })

export const db: Kysely<Database> =
  globalForDb.db ??
  new Kysely<Database>({
    dialect: new PostgresDialect({ pool }),
    log: isProduction ? ['error'] : ['query', 'error'],
  })

if (!isProduction) {
  globalForDb.pool = pool
  globalForDb.db = db
}
