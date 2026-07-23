import type { Attempt, AttemptSummary, GradedAnswer } from '@quiz/shared'
import type { Kysely } from 'kysely'

import type { AttemptRow, Database } from '../../db/schema.js'

/**
 * Every database access for the attempt module.
 *
 * The Kysely instance is passed in rather than imported so the layer above
 * stays testable without a server, mirroring the quiz and user repositories.
 */

/** A graded attempt ready to persist — what the service hands the repository. */
export interface NewAttempt {
  userId: string
  quizId: string
  quizTitle: string
  score: number
  total: number
  answers: GradedAnswer[]
}

type Db = Kysely<Database>

/*
 * Row mapping — the snake_case ↔ camelCase boundary. Pure and exported so it
 * can be tested without a database.
 */

export function toAttempt(row: AttemptRow): Attempt {
  return {
    id: row.id,
    userId: row.user_id,
    quizId: row.quiz_id,
    quizTitle: row.quiz_title,
    score: row.score,
    total: row.total,
    answers: row.answers,
    createdAt: row.created_at.toISOString(),
  }
}

/** The listing shape drops the user id and the per-question answers. */
export function toAttemptSummary(row: AttemptRow): AttemptSummary {
  return {
    id: row.id,
    quizId: row.quiz_id,
    quizTitle: row.quiz_title,
    score: row.score,
    total: row.total,
    createdAt: row.created_at.toISOString(),
  }
}

export async function insert(db: Db, attempt: NewAttempt): Promise<Attempt> {
  const row = await db
    .insertInto('attempt')
    .values({
      user_id: attempt.userId,
      quiz_id: attempt.quizId,
      quiz_title: attempt.quizTitle,
      score: attempt.score,
      total: attempt.total,
      // `jsonb` takes a JSON string parameter; `pg` won't serialise a JS array.
      answers: JSON.stringify(attempt.answers),
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  return toAttempt(row)
}

export async function findById(db: Db, id: string): Promise<Attempt | null> {
  const row = await db.selectFrom('attempt').selectAll().where('id', '=', id).executeTakeFirst()

  return row ? toAttempt(row) : null
}

/** A user's attempts, newest first — the history list. */
export async function listByUser(db: Db, userId: string): Promise<AttemptSummary[]> {
  const rows = await db
    .selectFrom('attempt')
    .selectAll()
    .where('user_id', '=', userId)
    .orderBy('created_at', 'desc')
    .execute()

  return rows.map(toAttemptSummary)
}
