import { createApp } from './app.js'
import { db } from './lib/db.js'
import { env } from './lib/env.js'
import { logger } from './lib/logger.js'

/**
 * Process entry point: boot the HTTP server and shut it down gracefully.
 */
function main(): void {
  const app = createApp()

  const server = app.listen(env.PORT, env.HOST, () => {
    logger.info(`Server listening at http://${env.HOST}:${env.PORT}`)
  })

  server.on('error', (error) => {
    logger.error(error, 'failed to start server')
    process.exit(1)
  })

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      logger.info({ signal }, 'shutting down')

      // Stop accepting connections, then release the database pool. Express has
      // no lifecycle hooks of its own, so teardown is owned here.
      server.close(() => {
        void db.destroy().finally(() => process.exit(0))
      })
    })
  }
}

main()
