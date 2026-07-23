import {
  quizIdSchema,
  type CreateQuestionInput,
  type CreateQuizInput,
  type Question,
  type Quiz,
  type QuizSummary,
  type ReplaceQuizInput,
  type UpdateQuizInput,
} from '@quiz/shared'
import type { Kysely } from 'kysely'

import type { Database } from '../../db/schema.js'
import { badRequest, conflict, notFound } from '../../utils/http-error.js'
import { slugify } from '../../utils/slug.js'
import * as quizRepository from './quiz.repository.js'
import type { QuizPatch } from './quiz.repository.js'

/**
 * Quiz orchestration: identifier assignment and the domain's error cases. The
 * repository stays free of HTTP concerns, and the routes stay free of rules.
 */

/** The slice of the repository this service depends on — the seam tests fill. */
export interface QuizStore {
  listSummaries(db: Kysely<Database>): Promise<QuizSummary[]>
  findById(db: Kysely<Database>, id: string): Promise<Quiz | null>
  insert(db: Kysely<Database>, quiz: Quiz): Promise<Quiz | null>
  update(db: Kysely<Database>, id: string, patch: QuizPatch): Promise<Quiz | null>
  remove(db: Kysely<Database>, id: string): Promise<number>
}

export interface QuizService {
  list(): Promise<QuizSummary[]>
  get(id: string): Promise<Quiz>
  create(input: CreateQuizInput): Promise<Quiz>
  replace(id: string, input: ReplaceQuizInput): Promise<Quiz>
  patch(id: string, input: UpdateQuizInput): Promise<Quiz>
  remove(id: string): Promise<void>
}

/**
 * Give every question an id, keeping the ones the payload already chose.
 *
 * Authored content brings its own ids (`1`…`5`); a client that has no opinion
 * omits them and gets `1..n`. When only some are given, the gaps are filled
 * with the lowest positive integers still free, so ids never collide inside a
 * quiz — which is exactly what the composite primary key requires.
 */
export function assignQuestionIds(questions: CreateQuestionInput[]): Question[] {
  const taken = new Set(questions.map((question) => question.id).filter((id) => id !== undefined))
  let next = 1

  return questions.map((question) => {
    if (question.id !== undefined) return { ...question, id: question.id }

    while (taken.has(next)) next++
    taken.add(next)

    return { ...question, id: next }
  })
}

/**
 * Derive the quiz id from the title when the payload omits one.
 *
 * A title of nothing but punctuation slugifies to an empty string, which is not
 * a usable id — better a 400 telling the client to send one than a row keyed by
 * `''`.
 */
function resolveQuizId(input: CreateQuizInput): string {
  const id = input.id ?? slugify(input.title)

  if (!quizIdSchema.safeParse(id).success) {
    throw badRequest(`Could not derive a quiz id from "${input.title}" — send an explicit id`)
  }

  return id
}

export function createQuizService(
  db: Kysely<Database>,
  repository: QuizStore = quizRepository,
): QuizService {
  const load = async (id: string): Promise<Quiz> => {
    const quiz = await repository.findById(db, id)

    if (!quiz) throw notFound(`Quiz "${id}" not found`)

    return quiz
  }

  return {
    list: () => repository.listSummaries(db),

    get: load,

    create: async (input) => {
      const id = resolveQuizId(input)

      const created = await repository.insert(db, {
        id,
        title: input.title,
        description: input.description,
        questions: assignQuestionIds(input.questions),
      })

      // `insert` reports the conflict rather than throwing: the id is the one
      // thing a client can collide on, and it is not an exceptional outcome.
      if (!created) throw conflict(`Quiz "${id}" already exists`)

      return created
    },

    replace: async (id, input) => {
      const replaced = await repository.update(db, id, {
        title: input.title,
        description: input.description,
        questions: assignQuestionIds(input.questions),
      })

      if (!replaced) throw notFound(`Quiz "${id}" not found`)

      return replaced
    },

    patch: async (id, input) => {
      const patched = await repository.update(db, id, {
        title: input.title,
        description: input.description,
        questions: input.questions && assignQuestionIds(input.questions),
      })

      if (!patched) throw notFound(`Quiz "${id}" not found`)

      return patched
    },

    remove: async (id) => {
      if ((await repository.remove(db, id)) === 0) throw notFound(`Quiz "${id}" not found`)
    },
  }
}
