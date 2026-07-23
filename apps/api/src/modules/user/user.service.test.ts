import type { User } from '@quiz/shared'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { Kysely } from 'kysely'

import type { Database } from '../../db/schema.js'
import { HttpError } from '../../utils/http-error.js'
import { createUserService, type UserStore } from './user.service.js'

/** The service never touches the instance — it only threads it to the store. */
const db = {} as Kysely<Database>

const user: User = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'ada@example.com',
  name: 'Ada',
}

let store: UserStore

beforeEach(() => {
  store = {
    findById: jest.fn<UserStore['findById']>(),
    upsertByEmail: jest.fn<UserStore['upsertByEmail']>(),
  }
})

const service = () => createUserService(db, store)

/** Asserts the rejection is an `HttpError` carrying `status`. */
async function expectStatus(promise: Promise<unknown>, status: number): Promise<void> {
  await expect(promise).rejects.toThrow(HttpError)
  await expect(promise).rejects.toMatchObject({ status })
}

describe('identify', () => {
  it('upserts on the email and returns the stored user', async () => {
    jest.mocked(store.upsertByEmail).mockResolvedValue(user)

    await expect(service().identify({ email: 'ada@example.com', name: 'Ada' })).resolves.toEqual(
      user,
    )
    expect(store.upsertByEmail).toHaveBeenCalledWith(db, 'ada@example.com', 'Ada')
  })
})

describe('get', () => {
  it('returns the stored user', async () => {
    jest.mocked(store.findById).mockResolvedValue(user)

    await expect(service().get(user.id)).resolves.toEqual(user)
  })

  it('404s when there is no such user', async () => {
    jest.mocked(store.findById).mockResolvedValue(null)

    await expectStatus(service().get('nope'), 404)
  })
})
