import type { Quiz, QuizSummary } from '@quiz/shared'

import { apiFetch } from '@/services/api-client'

/**
 * Quiz content calls against `@quiz/api`, built on `apiFetch` like every
 * feature service.
 */

/** The catalogue: every quiz with its question count, for the landing page. */
export function listQuizzes(): Promise<QuizSummary[]> {
  return apiFetch<QuizSummary[]>('/quizzes')
}

/** A single quiz with its full question set, for the runner. */
export function getQuiz(id: string): Promise<Quiz> {
  return apiFetch<Quiz>(`/quizzes/${id}`)
}
