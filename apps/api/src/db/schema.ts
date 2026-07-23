import type { GradedAnswer } from '@quiz/shared'
import type { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely'

/**
 * Database schema — the single source of truth for Kysely's types.
 *
 * Every table introduced by a migration gets an interface here and an entry on
 * `Database`; `Kysely<Database>` then type-checks every query end to end. The
 * two are kept in sync by hand: a column added in `db/migrations/` does not
 * exist as far as the query builder is concerned until it is declared here.
 *
 * Columns keep their snake_case database names. The camelCase domain shapes
 * (`Quiz`, `Question` from `@quiz/shared`) are produced at the repository
 * boundary, which has to reshape flat rows into a nested quiz anyway.
 */

/** Added by `20260723000000_create_quiz_tables`. */
export interface QuizTable {
  /** Authored slug, e.g. `agent-fundamentals` — not a generated key. */
  id: string
  title: string
  description: string
  created_at: Generated<Date>
  updated_at: Generated<Date>
}

/** Added by `20260723000000_create_quiz_tables`. */
export interface QuestionTable {
  quiz_id: string
  /** Unique within the quiz, not across the catalogue. */
  id: number
  /** Authored order, independent of `id`. */
  position: number
  question: string
  options: string[]
  /** Zero-based index into `options`; a check constraint enforces it too. */
  correct_answer: number
  explanation: string
}

/** Added by `20260724000000_create_app_user_table`. */
export interface AppUserTable {
  /** Generated key — `gen_random_uuid()` fills it when a row omits it. */
  id: Generated<string>
  /** Unique; the service lowercases before writing, so lookups are canonical. */
  email: string
  name: string
  created_at: Generated<Date>
  updated_at: Generated<Date>
}

/** Added by `20260724000001_create_attempt_table`. */
export interface AttemptTable {
  /** Generated key — `gen_random_uuid()` fills it when a row omits it. */
  id: Generated<string>
  user_id: string
  quiz_id: string
  /** Title snapshot at submit time, so history survives a quiz rename. */
  quiz_title: string
  score: number
  total: number
  /**
   * Graded answers as `jsonb`. `pg` parses it to an array on read; on write it
   * is passed as a JSON string, which is what a `jsonb` parameter expects.
   */
  answers: ColumnType<GradedAnswer[], string, string>
  created_at: Generated<Date>
}

export interface Database {
  quiz: QuizTable
  question: QuestionTable
  app_user: AppUserTable
  attempt: AttemptTable
}

export type QuizRow = Selectable<QuizTable>
export type NewQuizRow = Insertable<QuizTable>
export type QuizRowUpdate = Updateable<QuizTable>

export type QuestionRow = Selectable<QuestionTable>
export type NewQuestionRow = Insertable<QuestionTable>

export type AppUserRow = Selectable<AppUserTable>
export type NewAppUserRow = Insertable<AppUserTable>
export type AppUserRowUpdate = Updateable<AppUserTable>

export type AttemptRow = Selectable<AttemptTable>
export type NewAttemptRow = Insertable<AttemptTable>
