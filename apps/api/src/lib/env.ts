import { resolve } from 'node:path'

import { config as loadDotenv } from 'dotenv'
import { z } from 'zod'

/**
 * Load environment variables before validation.
 *
 * Local development keeps a single `.env` at the monorepo root; containers and
 * CI inject real environment variables, in which case both files are simply
 * absent and `process.env` already holds everything we need.
 */
loadDotenv({
  path: [resolve(process.cwd(), '.env'), resolve(process.cwd(), '../../.env')],
  quiet: true,
})

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().min(1).default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(3333),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  // `error` rather than a message on `.min()`: an empty value is filtered out
  // below, so it surfaces as a missing key, not as a too-short string.
  DATABASE_URL: z.string({ error: 'DATABASE_URL is required' }).min(1),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:3000'),
})

export type Env = z.infer<typeof envSchema>

/**
 * A variable written but left empty (`LOG_LEVEL=` in `.env`) arrives as `''`,
 * which is a *present* value as far as zod is concerned — enough to defeat
 * every `.default()` above. Dropping blanks makes "declared but empty" mean
 * "not configured", so `.env.example` can ship as a blank template.
 */
const definedEnv = Object.fromEntries(
  Object.entries(process.env).filter(([, value]) => value !== undefined && value !== ''),
)

const parsed = envSchema.safeParse(definedEnv)

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n')

  throw new Error(
    `Invalid environment variables:\n${details}\n\nCopy .env.example to .env at the repository root and fill it in.`,
  )
}

export const env: Env = parsed.data

export const isProduction = env.NODE_ENV === 'production'
export const isDevelopment = env.NODE_ENV === 'development'
