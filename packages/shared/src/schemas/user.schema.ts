import { z } from 'zod'

import { USER_EMAIL_MAX_LENGTH, USER_NAME_MAX_LENGTH } from '../constants/user.constants.js'

/**
 * User models — the single source of truth for the lightweight, passwordless
 * identity the API and the web app agree on.
 *
 * Identity is by email alone: entering a known email returns that user (its
 * name refreshed), a new one creates a user. No password, no session — the web
 * app just remembers the returned id so a returning visitor is recognised.
 */

/** Stored lowercased: `A@B.com` and `a@b.com` are the same person. */
export const emailSchema = z.email().trim().toLowerCase().max(USER_EMAIL_MAX_LENGTH)

export const nameSchema = z.string().trim().min(1).max(USER_NAME_MAX_LENGTH)

/** A stored user, as returned to the client. */
export const userSchema = z.object({
  id: z.uuid(),
  email: emailSchema,
  name: nameSchema,
})

/**
 * Identify payload — the whole of "sign in / sign up". `POST /users` upserts on
 * it: the email locates (or creates) the user, the name is (re)applied.
 */
export const identifyUserSchema = z.object({
  email: emailSchema,
  name: nameSchema,
})
