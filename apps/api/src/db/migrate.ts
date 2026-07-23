/* eslint-disable no-console -- CLI script: stdout is its interface */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { FileMigrationProvider, Migrator, type MigrationResultSet } from 'kysely/migration'

import { db } from '../lib/db.js'

/**
 * Migration runner.
 *
 *   pnpm db:migrate          apply every pending migration
 *   pnpm db:migrate up       apply the next pending migration
 *   pnpm db:migrate down     roll the last applied migration back
 *
 * Resolved relative to this file so it works both from `src` (tsx) and from
 * the compiled `dist` output.
 */
const migrationFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations')

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({ fs, path, migrationFolder }),
})

const command = process.argv[2] ?? 'latest'

let outcome: MigrationResultSet

switch (command) {
  case 'latest':
    outcome = await migrator.migrateToLatest()
    break
  case 'up':
    outcome = await migrator.migrateUp()
    break
  case 'down':
    outcome = await migrator.migrateDown()
    break
  default:
    console.error(`Unknown command "${command}". Expected one of: latest, up, down.`)
    process.exit(1)
}

for (const result of outcome.results ?? []) {
  const verb = result.direction === 'Up' ? 'applied' : 'reverted'
  console.log(`${result.status === 'Success' ? '✔' : '✖'} ${verb} ${result.migrationName}`)
}

await db.destroy()

if (outcome.error) {
  console.error('Migration failed:', outcome.error)
  process.exit(1)
}

if (!outcome.results?.length) {
  console.log('No migrations to run.')
}
