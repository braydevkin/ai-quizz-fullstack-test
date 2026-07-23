/**
 * Quiz domain limits.
 *
 * They live here rather than inline in the schemas so the API, the web forms
 * and any future content tooling all validate against the same numbers.
 */

/** Quiz ids are authored slugs (`agent-fundamentals`), not generated keys. */
export const QUIZ_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const QUIZ_ID_MAX_LENGTH = 64
export const QUIZ_TITLE_MAX_LENGTH = 120
export const QUIZ_DESCRIPTION_MAX_LENGTH = 500

/**
 * A quiz needs one question to be playable. The product target of five or more
 * is editorial guidance for content authors, not a rule the model enforces —
 * raising this would reject any quiz mid-authoring.
 */
export const QUIZ_MIN_QUESTIONS = 1
export const QUIZ_MAX_QUESTIONS = 50

export const QUESTION_TEXT_MAX_LENGTH = 500
export const QUESTION_EXPLANATION_MAX_LENGTH = 1000

/** Multiple choice needs at least two options to choose between. */
export const QUESTION_MIN_OPTIONS = 2
export const QUESTION_MAX_OPTIONS = 6
export const QUESTION_OPTION_MAX_LENGTH = 200
