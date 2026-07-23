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
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:3000'),
})

export type Env = z.infer<typeof envSchema>

const parsed = envSchema.safeParse(process.env)

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
