import type { Question, Quiz, QuizSummary } from '@quiz/shared'
import type { Kysely } from 'kysely'

import type {
  Database,
  NewQuestionRow,
  QuestionRow,
  QuizRow,
  QuizRowUpdate,
} from '../../db/schema.js'

/**
 * Every database access for the quiz module.
 *
 * The Kysely instance is passed in rather than imported so a transaction can be
 * threaded through the same functions (`Transaction<Database>` is a
 * `Kysely<Database>`), and so the layer above stays testable without a server.
 */

/** A patch with its question ids already resolved by the service. */
export interface QuizPatch {
  title?: string
  description?: string
  /** When present, replaces the whole question set rather than patching it. */
  questions?: Question[]
}

type Db = Kysely<Database>

/*
 * Row mapping — the snake_case ↔ camelCase boundary. Pure and exported so the
 * reshaping can be tested without a database.
 */

export function toQuiz(quiz: QuizRow, questions: QuestionRow[]): Quiz {
  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    questions: questions.map((question) => ({
      id: question.id,
      question: question.question,
      options: question.options,
      correctAnswer: question.correct_answer,
      explanation: question.explanation,
    })),
  }
}

/** `position` records the authored order, which is the order of the array. */
export function toQuestionRows(quizId: string, questions: Question[]): NewQuestionRow[] {
  return questions.map((question, index) => ({
    quiz_id: quizId,
    id: question.id,
    position: index,
    question: question.question,
    options: question.options,
    correct_answer: question.correctAnswer,
    explanation: question.explanation,
  }))
}

async function replaceQuestions(db: Db, quizId: string, questions: Question[]): Promise<void> {
  await db.deleteFrom('question').where('quiz_id', '=', quizId).execute()

  // `values([])` would compile to invalid SQL. The schemas require at least one
  // question, so this only guards against a future caller.
  if (questions.length === 0) return

  await db.insertInto('question').values(toQuestionRows(quizId, questions)).execute()
}

async function loadQuestions(db: Db, quizId: string): Promise<QuestionRow[]> {
  return db
    .selectFrom('question')
    .selectAll()
    .where('quiz_id', '=', quizId)
    .orderBy('position')
    .execute()
}

/**
 * Catalogue listing: every quiz with the size of its question set, newest last.
 * The count is a correlated subquery, so a quiz with no questions still shows
 * up (with `questionCount: 0`).
 */
export async function listSummaries(db: Db): Promise<QuizSummary[]> {
  const rows = await db
    .selectFrom('quiz')
    .select((eb) => [
      'quiz.id',
      'quiz.title',
      'quiz.description',
      eb
        .selectFrom('question')
        .whereRef('question.quiz_id', '=', 'quiz.id')
        .select(eb.fn.countAll().as('count'))
        .as('question_count'),
    ])
    .orderBy('quiz.created_at')
    .orderBy('quiz.id')
    .execute()

  // `count(*)` arrives as a string from `pg`: it is a bigint server-side.
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    questionCount: Number(row.question_count ?? 0),
  }))
}

export async function findById(db: Db, id: string): Promise<Quiz | null> {
  const quiz = await db.selectFrom('quiz').selectAll().where('id', '=', id).executeTakeFirst()

  if (!quiz) return null

  return toQuiz(quiz, await loadQuestions(db, id))
}

/**
 * Insert a new quiz and its questions in one transaction.
 *
 * Returns `null` when the id is already taken: `on conflict do nothing` lets
 * the database arbitrate, so two concurrent creates can't both succeed the way
 * a check-then-insert would allow.
 */
export async function insert(db: Db, quiz: Quiz): Promise<Quiz | null> {
  return db.transaction().execute(async (trx) => {
    const result = await trx
      .insertInto('quiz')
      .values({ id: quiz.id, title: quiz.title, description: quiz.description })
      .onConflict((oc) => oc.column('id').doNothing())
      .executeTakeFirst()

    if (Number(result.numInsertedOrUpdatedRows ?? 0) === 0) return null

    await replaceQuestions(trx, quiz.id, quiz.questions)

    return quiz
  })
}

/**
 * Insert or overwrite a quiz wholesale — what the seed runs, so re-seeding the
 * same content files is idempotent.
 */
export async function upsert(db: Db, quiz: Quiz): Promise<Quiz> {
  return db.transaction().execute(async (trx) => {
    await trx
      .insertInto('quiz')
      .values({ id: quiz.id, title: quiz.title, description: quiz.description })
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          title: quiz.title,
          description: quiz.description,
          updated_at: new Date(),
        }),
      )
      .execute()

    await replaceQuestions(trx, quiz.id, quiz.questions)

    return quiz
  })
}

/**
 * Apply a patch, returning the quiz as it now stands — or `null` when there is
 * no such quiz. Everything happens in one transaction so a caller never reads a
 * quiz whose questions are half-replaced.
 */
export async function update(db: Db, id: string, patch: QuizPatch): Promise<Quiz | null> {
  return db.transaction().execute(async (trx) => {
    const existing = await trx
      .selectFrom('quiz')
      .select('id')
      .where('id', '=', id)
      .executeTakeFirst()

    if (!existing) return null

    const fields: QuizRowUpdate = { updated_at: new Date() }

    if (patch.title !== undefined) fields.title = patch.title
    if (patch.description !== undefined) fields.description = patch.description

    await trx.updateTable('quiz').set(fields).where('id', '=', id).execute()

    if (patch.questions) await replaceQuestions(trx, id, patch.questions)

    return findById(trx, id)
  })
}

/** Returns how many quizzes were deleted; the questions cascade. */
export async function remove(db: Db, id: string): Promise<number> {
  const result = await db.deleteFrom('quiz').where('id', '=', id).executeTakeFirst()

  return Number(result.numDeletedRows)
}
