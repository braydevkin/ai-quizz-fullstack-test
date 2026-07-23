/* eslint-disable no-console -- CLI script: stdout is its interface */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { quizSchema } from '@quiz/shared'

import { db } from '../lib/db.js'
import * as quizRepository from '../modules/quiz/quiz.repository.js'

/**
 * Seed the database from authored quiz content.
 *
 *   pnpm db:seed
 *
 * Content is data-driven: every `*.json` in `seeds/` is validated against
 * `quizSchema` and upserted, so adding a quiz means adding a file — no code
 * change, no migration. Re-running is idempotent (the quiz row is updated in
 * place and its question set replaced), which also makes this the way to push
 * an edited content file into an existing database.
 *
 * A development tool that runs from source under `tsx`: `tsconfig.json` does
 * not copy JSON into `dist/`, so this is never executed from the build output.
 */
const seedFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), 'seeds')

const files = (await fs.readdir(seedFolder)).filter((file) => file.endsWith('.json')).sort()

if (files.length === 0) {
  console.log(`No seed files found in ${seedFolder}.`)
  await db.destroy()
  process.exit(0)
}

let failed = false

for (const file of files) {
  const raw = await fs.readFile(path.join(seedFolder, file), 'utf8')
  const parsed = quizSchema.safeParse(JSON.parse(raw) as unknown)

  if (!parsed.success) {
    failed = true
    console.error(`✖ ${file} is not a valid quiz:`)
    for (const issue of parsed.error.issues) {
      console.error(`    - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    }
    continue
  }

  const quiz = parsed.data

  await quizRepository.upsert(db, quiz)
  console.log(`✔ ${quiz.id} — ${quiz.questions.length} questions (${file})`)
}

await db.destroy()

if (failed) {
  console.error('\nSeeding finished with errors: some files were skipped.')
  process.exit(1)
}
