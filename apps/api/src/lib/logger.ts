import pino, { type Logger, type LoggerOptions } from 'pino'

import { env, type Env } from './env.js'

/**
 * Per-environment logger configuration: human-readable in development, plain
 * JSON (ready for log shipping) in production, silent under test.
 */
const optionsByEnvironment: Record<Env['NODE_ENV'], LoggerOptions> = {
  development: {
    level: env.LOG_LEVEL,
    transport: {
      target: 'pino-pretty',
      options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' },
    },
  },
  production: { level: env.LOG_LEVEL },
  test: { enabled: false },
}

/**
 * Process-wide logger. Request-scoped children are attached to `req.log` by the
 * `pino-http` middleware — prefer those inside handlers so log lines carry the
 * request id.
 */
export const logger: Logger = pino(optionsByEnvironment[env.NODE_ENV])
