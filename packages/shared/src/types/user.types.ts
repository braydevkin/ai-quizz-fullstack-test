import type { z } from 'zod'

import type { identifyUserSchema, userSchema } from '../schemas/user.schema.js'

/**
 * User domain types.
 *
 * Inferred from the zod schemas so the model can't drift from the validation
 * that guards it — edit `schemas/user.schema.ts`, not this file.
 */

export type User = z.infer<typeof userSchema>
export type IdentifyUserInput = z.infer<typeof identifyUserSchema>
