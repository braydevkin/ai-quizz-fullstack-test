/**
 * Runs before the module registry of each test file is populated, which is the
 * only place these can be set: `lib/env.ts` validates `process.env` at import
 * time and throws when a required variable is missing.
 *
 * Assigned rather than defaulted through dotenv so a developer's local `.env`
 * (and therefore their real database) can never leak into a test run.
 */
process.env.NODE_ENV = 'test'
process.env.LOG_LEVEL = 'silent'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/quiz_test'
