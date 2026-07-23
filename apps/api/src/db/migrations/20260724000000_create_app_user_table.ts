/* eslint-disable @typescript-eslint/no-explicit-any -- a migration is a frozen
   artifact: it must keep running against the schema as it was the day it was
   written, so it is typed against `Kysely<any>` rather than today's `Database`. */
import { type Kysely, sql } from 'kysely'

/**
 * Identity table for the lightweight, passwordless sign-in.
 *
 * A user is located by `email` alone, so it carries a unique constraint and the
 * service normalises to lowercase before writing — `A@B.com` and `a@b.com` are
 * one person. The table is named `app_user` rather than `user` to avoid the
 * Postgres reserved word (and any raw-SQL that would then need quoting).
 *
 * `gen_random_uuid()` is built into Postgres 13+, so no extension is needed.
 */
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('app_user')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('email', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('app_user').execute()
}
