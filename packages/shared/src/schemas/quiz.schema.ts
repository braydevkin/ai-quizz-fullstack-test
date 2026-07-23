import { z } from 'zod'

import {
  QUESTION_EXPLANATION_MAX_LENGTH,
  QUESTION_MAX_OPTIONS,
  QUESTION_MIN_OPTIONS,
  QUESTION_OPTION_MAX_LENGTH,
  QUESTION_TEXT_MAX_LENGTH,
  QUIZ_DESCRIPTION_MAX_LENGTH,
  QUIZ_ID_MAX_LENGTH,
  QUIZ_ID_PATTERN,
  QUIZ_MAX_QUESTIONS,
  QUIZ_MIN_QUESTIONS,
  QUIZ_TITLE_MAX_LENGTH,
} from '../constants/quiz.constants.js'

/**
 * Quiz and question models — the single source of truth for the shape quiz
 * content travels in, shared verbatim by the API and the web app.
 *
 * A quiz JSON file parses against `quizSchema` as-is:
 *
 * ```json
 * {
 *   "id": "agent-fundamentals",
 *   "title": "Agent Fundamentals",
 *   "description": "Test your knowledge of AI agent design and implementation",
 *   "questions": [
 *     {
 *       "id": 1,
 *       "question": "What is the primary purpose of an AI agent?",
 *       "options": ["…", "…"],
 *       "correctAnswer": 1,
 *       "explanation": "…"
 *     }
 *   ]
 * }
 * ```
 */

/** Authored slug, e.g. `agent-fundamentals`. Also the value used in URLs. */
export const quizIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(QUIZ_ID_MAX_LENGTH)
  .regex(QUIZ_ID_PATTERN, { error: 'Quiz id must be a lowercase kebab-case slug' })

/** Question ids are unique within their quiz, not across the catalogue. */
export const questionIdSchema = z.int().positive()

const questionFields = {
  question: z.string().trim().min(1).max(QUESTION_TEXT_MAX_LENGTH),
  options: z
    .array(z.string().trim().min(1).max(QUESTION_OPTION_MAX_LENGTH))
    .min(QUESTION_MIN_OPTIONS)
    .max(QUESTION_MAX_OPTIONS),
  /** Zero-based index into `options`. */
  correctAnswer: z.int().min(0),
  explanation: z.string().trim().min(1).max(QUESTION_EXPLANATION_MAX_LENGTH),
}

const quizFields = {
  title: z.string().trim().min(1).max(QUIZ_TITLE_MAX_LENGTH),
  description: z.string().trim().min(1).max(QUIZ_DESCRIPTION_MAX_LENGTH),
}

/*
 * Cross-field rules, declared once and attached at every site that needs them.
 * They can't be baked into the object schemas above because zod refuses
 * `.omit()`/`.partial()` on a schema that already carries refinements — so the
 * shapes stay plain and each exported schema refines last.
 */

const pointsAtAnOption = (question: { options: readonly unknown[]; correctAnswer: number }) =>
  question.correctAnswer < question.options.length

const pointsAtAnOptionIssue = {
  error: 'correctAnswer must be a zero-based index into options',
  path: ['correctAnswer'],
}

const hasDistinctOptions = (question: { options: readonly string[] }) =>
  new Set(question.options).size === question.options.length

const hasDistinctOptionsIssue = {
  error: 'options must not repeat the same answer',
  path: ['options'],
}

const hasDistinctQuestionIds = (quiz: { questions?: readonly { id?: number }[] }) => {
  const ids = (quiz.questions ?? []).map((question) => question.id).filter((id) => id !== undefined)

  return new Set(ids).size === ids.length
}

const hasDistinctQuestionIdsIssue = {
  error: 'question ids must be unique within a quiz',
  path: ['questions'],
}

/** A stored question, answer key included. */
export const questionSchema = z
  .object({ id: questionIdSchema, ...questionFields })
  .refine(pointsAtAnOption, pointsAtAnOptionIssue)
  .refine(hasDistinctOptions, hasDistinctOptionsIssue)

/** A stored quiz with its full question set. */
export const quizSchema = z
  .object({
    id: quizIdSchema,
    ...quizFields,
    questions: z.array(questionSchema).min(QUIZ_MIN_QUESTIONS).max(QUIZ_MAX_QUESTIONS),
  })
  .refine(hasDistinctQuestionIds, hasDistinctQuestionIdsIssue)

/**
 * Listing shape for the catalogue page — everything but the questions, plus the
 * count the card shows ("10 questions").
 */
export const quizSummarySchema = z.object({
  id: quizIdSchema,
  ...quizFields,
  questionCount: z.int().min(0),
})

/**
 * Create payload. Ids are optional: authored content brings its own
 * (`agent-fundamentals`, question `1`), while a client that has no opinion
 * leaves them out for the persistence layer to assign.
 */
export const createQuestionSchema = z
  .object({ id: questionIdSchema.optional(), ...questionFields })
  .refine(pointsAtAnOption, pointsAtAnOptionIssue)
  .refine(hasDistinctOptions, hasDistinctOptionsIssue)

export const createQuizSchema = z
  .object({
    id: quizIdSchema.optional(),
    ...quizFields,
    questions: z.array(createQuestionSchema).min(QUIZ_MIN_QUESTIONS).max(QUIZ_MAX_QUESTIONS),
  })
  .refine(hasDistinctQuestionIds, hasDistinctQuestionIdsIssue)

/**
 * Replace payload — the create shape without the id, which is taken from the
 * URL. Declared here rather than derived from `createQuizSchema`: zod refuses
 * `.omit()` on a schema that already carries refinements, so the shapes are
 * rebuilt from the same fields and refined last, exactly as above.
 */
export const replaceQuizSchema = z
  .object({
    ...quizFields,
    questions: z.array(createQuestionSchema).min(QUIZ_MIN_QUESTIONS).max(QUIZ_MAX_QUESTIONS),
  })
  .refine(hasDistinctQuestionIds, hasDistinctQuestionIdsIssue)

/**
 * Update payload — every field optional, but at least one present.
 *
 * The quiz id is absent on purpose: it is the slug the quiz is addressed by,
 * so changing it is a delete plus a create, not an update. `questions`, when
 * given, replaces the whole set rather than patching individual questions.
 */
export const updateQuizSchema = z
  .object({
    ...quizFields,
    questions: z.array(createQuestionSchema).min(QUIZ_MIN_QUESTIONS).max(QUIZ_MAX_QUESTIONS),
  })
  .partial()
  .refine((quiz) => Object.keys(quiz).length > 0, {
    error: 'an update must change at least one field',
  })
  .refine(hasDistinctQuestionIds, hasDistinctQuestionIdsIssue)
