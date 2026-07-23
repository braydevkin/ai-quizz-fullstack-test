/* eslint-disable @typescript-eslint/no-explicit-any -- a migration is a frozen
   artifact: it must keep running against the schema as it was the day it was
   written, so it is typed against `Kysely<any>` rather than today's `Database`. */
import { type Kysely, sql } from 'kysely'

/**
 * Attempt table — one row per completed quiz run, graded server-side.
 *
 * `quiz_title` is a snapshot taken at submit time so a user's history survives
 * a later quiz rename or deletion. The graded per-question answers are stored as
 * `jsonb` (`[{ questionId, selectedAnswer, correctAnswer, correct }]`) rather
 * than a second table: an attempt's answers are only ever read back whole, with
 * the attempt, so a nested document is the natural shape.
 */
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('attempt')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) =>
      col.notNull().references('app_user.id').onDelete('cascade'),
    )
    .addColumn('quiz_id', 'text', (col) =>
      col.notNull().references('quiz.id').onDelete('cascade').onUpdate('cascade'),
    )
    .addColumn('quiz_title', 'text', (col) => col.notNull())
    .addColumn('score', 'integer', (col) => col.notNull())
    .addColumn('total', 'integer', (col) => col.notNull())
    .addColumn('answers', 'jsonb', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute()

  // The history list reads a user's attempts newest first.
  await db.schema
    .createIndex('attempt_user_id_created_at_idx')
    .on('attempt')
    .columns(['user_id', 'created_at'])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('attempt').execute()
}
