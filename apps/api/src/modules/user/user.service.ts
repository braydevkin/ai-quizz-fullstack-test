import type { IdentifyUserInput, User } from '@quiz/shared'
import type { Kysely } from 'kysely'

import type { Database } from '../../db/schema.js'
import { notFound } from '../../utils/http-error.js'
import * as userRepository from './user.repository.js'

/**
 * User orchestration: the domain's error cases and nothing else. The repository
 * stays free of HTTP concerns, the routes stay free of rules.
 */

/** The slice of the repository this service depends on — the seam tests fill. */
export interface UserStore {
  findById(db: Kysely<Database>, id: string): Promise<User | null>
  upsertByEmail(db: Kysely<Database>, email: string, name: string): Promise<User>
}

export interface UserService {
  identify(input: IdentifyUserInput): Promise<User>
  get(id: string): Promise<User>
}

export function createUserService(
  db: Kysely<Database>,
  repository: UserStore = userRepository,
): UserService {
  return {
    // `identifyUserSchema` already lowercased the email, so the upsert keys on a
    // canonical value and a returning visitor lands on the same row.
    identify: (input) => repository.upsertByEmail(db, input.email, input.name),

    get: async (id) => {
      const user = await repository.findById(db, id)

      if (!user) throw notFound(`User "${id}" not found`)

      return user
    },
  }
}
