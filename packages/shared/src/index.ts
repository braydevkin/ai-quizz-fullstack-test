/**
 * Public entry point of `@quiz/shared`.
 *
 * Everything both the API and the web app need to agree on lives here:
 * types, zod schemas, constants and framework-agnostic utilities.
 *
 * Intentionally empty in the infrastructure phase — the barrels below exist so
 * feature code has an obvious, non-breaking place to land.
 */
export * from './constants/index.js'
export * from './schemas/index.js'
export * from './types/index.js'
export * from './utils/index.js'
