import type { IdentifyUserInput, User } from '@quiz/shared'

import { apiFetch } from '@/services/api-client'

/**
 * Identity calls against `@quiz/api`.
 *
 * Built on `apiFetch`, like every feature service, so error handling and the
 * base URL stay in one place.
 */

/** Sign in / sign up — the API upserts on email and returns the user. */
export function identify(input: IdentifyUserInput): Promise<User> {
  return apiFetch<User>('/users', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

/** Rehydrate a remembered session by id. */
export function getUser(id: string): Promise<User> {
  return apiFetch<User>(`/users/${id}`)
}
