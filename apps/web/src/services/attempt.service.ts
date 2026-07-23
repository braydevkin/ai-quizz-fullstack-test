import type { Attempt, AttemptSummary, CreateAttemptInput } from '@quiz/shared'

import { apiFetch } from '@/services/api-client'

/**
 * Attempt calls against `@quiz/api`. The client submits only the chosen
 * options; the API grades and returns the scored attempt.
 */

export function submitAttempt(input: CreateAttemptInput): Promise<Attempt> {
  return apiFetch<Attempt>('/attempts', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

/** A user's attempt history, newest first. */
export function listAttempts(userId: string): Promise<AttemptSummary[]> {
  return apiFetch<AttemptSummary[]>(`/attempts?userId=${encodeURIComponent(userId)}`)
}

/** A single attempt with its per-question answers, for review. */
export function getAttempt(id: string): Promise<Attempt> {
  return apiFetch<Attempt>(`/attempts/${id}`)
}
