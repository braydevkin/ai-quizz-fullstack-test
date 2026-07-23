import { describe, expect, it } from '@jest/globals'

import type { AppUserRow } from '../../db/schema.js'
import { toUser } from './user.repository.js'

/**
 * The row-mapping boundary only — the query builders are exercised against a
 * real database by hand, not mocked here.
 */

const userRow: AppUserRow = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'ada@example.com',
  name: 'Ada',
  created_at: new Date('2026-07-24T00:00:00Z'),
  updated_at: new Date('2026-07-24T00:00:00Z'),
}

describe('toUser', () => {
  it('maps the row to the domain shape', () => {
    expect(toUser(userRow)).toEqual({
      id: '11111111-1111-4111-8111-111111111111',
      email: 'ada@example.com',
      name: 'Ada',
    })
  })

  it('drops the timestamps from the domain shape', () => {
    const user = toUser(userRow)

    expect(user).not.toHaveProperty('created_at')
    expect(user).not.toHaveProperty('updated_at')
  })
})
