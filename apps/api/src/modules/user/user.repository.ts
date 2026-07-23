import type { User } from '@quiz/shared'
import type { Kysely } from 'kysely'

import type { AppUserRow, Database } from '../../db/schema.js'

/**
 * Every database access for the user module.
 *
 * The Kysely instance is passed in rather than imported so the layer above
 * stays testable without a server, mirroring the quiz repository.
 */

type Db = Kysely<Database>

/** The snake_case ↔ camelCase boundary; pure and exported so it can be tested. */
export function toUser(row: AppUserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
  }
}

export async function findById(db: Db, id: string): Promise<User | null> {
  const row = await db.selectFrom('app_user').selectAll().where('id', '=', id).executeTakeFirst()

  return row ? toUser(row) : null
}

/**
 * Locate a user by email, or create one — the whole of passwordless sign-in.
 *
 * `on conflict (email) do update` refreshes the name and returns the row either
 * way, so the database arbitrates: two concurrent identifies with the same
 * email can't create two users the way a check-then-insert would allow. The
 * caller has already lowercased `email`.
 */
export async function upsertByEmail(db: Db, email: string, name: string): Promise<User> {
  const row = await db
    .insertInto('app_user')
    .values({ email, name })
    .onConflict((oc) => oc.column('email').doUpdateSet({ name, updated_at: new Date() }))
    .returningAll()
    .executeTakeFirstOrThrow()

  return toUser(row)
}
