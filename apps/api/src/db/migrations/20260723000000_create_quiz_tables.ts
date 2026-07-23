/* eslint-disable @typescript-eslint/no-explicit-any -- a migration is a frozen
   artifact: it must keep running against the schema as it was the day it was
   written, so it is typed against `Kysely<any>` rather than today's `Database`. */
import { type Kysely, sql } from 'kysely'

/**
 * Quiz content tables.
 *
 * `quiz.id` is the authored slug (`agent-fundamentals`) rather than a generated
 * key: it is what URLs and JSON content files address a quiz by.
 *
 * Question ids are unique *within* their quiz, not across the catalogue, so the
 * primary key is composite. `position` records the authored order independently
 * of the ids, and the questions of a quiz are always read back ordered by it.
 */
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('quiz')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('title', 'text', (col) => col.notNull())
    .addColumn('description', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute()

  await db.schema
    .createTable('question')
    .addColumn('quiz_id', 'text', (col) =>
      col.notNull().references('quiz.id').onDelete('cascade').onUpdate('cascade'),
    )
    .addColumn('id', 'integer', (col) => col.notNull())
    .addColumn('position', 'integer', (col) => col.notNull())
    .addColumn('question', 'text', (col) => col.notNull())
    .addColumn('options', sql`text[]`, (col) => col.notNull())
    .addColumn('correct_answer', 'integer', (col) => col.notNull())
    .addColumn('explanation', 'text', (col) => col.notNull())
    .addPrimaryKeyConstraint('question_pkey', ['quiz_id', 'id'])
    .addUniqueConstraint('question_quiz_id_position_key', ['quiz_id', 'position'])
    // The structural invariant behind the JSON contract: `correctAnswer` is a
    // zero-based index into `options`. Editorial limits (how many options a
    // question may have) stay in zod, where they can change without a migration.
    .addCheckConstraint(
      'question_correct_answer_indexes_options',
      sql`correct_answer >= 0 and correct_answer < cardinality(options)`,
    )
    .execute()

  await db.schema.createIndex('question_quiz_id_idx').on('question').column('quiz_id').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  // `question` first: it holds the foreign key into `quiz`.
  await db.schema.dropTable('question').execute()
  await db.schema.dropTable('quiz').execute()
}
