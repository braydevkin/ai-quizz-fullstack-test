/**
 * User domain limits.
 *
 * Kept here, beside the quiz limits, so the API, the identity form and any
 * future tooling all validate names and emails against the same numbers.
 */

export const USER_NAME_MAX_LENGTH = 80

/** RFC 5321 caps an address at 254 characters; nothing longer is deliverable. */
export const USER_EMAIL_MAX_LENGTH = 254
