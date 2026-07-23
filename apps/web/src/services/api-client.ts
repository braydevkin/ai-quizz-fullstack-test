import { env } from '@/lib/env'

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Thin typed wrapper around `fetch` for talking to `@quiz/api`.
 *
 * Feature-specific services (e.g. `services/quiz.service.ts`) build on top of
 * this instead of calling `fetch` directly.
 */
export async function apiFetch<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  const response = await fetch(new URL(path, env.NEXT_PUBLIC_API_URL), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!response.ok) {
    throw new ApiError(`Request to ${path} failed`, response.status)
  }

  return (await response.json()) as TResponse
}
