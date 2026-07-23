/**
 * Database schema — the single source of truth for Kysely's types.
 *
 * Every table introduced by a migration gets an interface here and an entry on
 * `Database`; `Kysely<Database>` then type-checks every query end to end.
 *
 * Deliberately empty during the infrastructure phase, mirroring the empty
 * `migrations/` folder. Columns are declared with Kysely's `Generated<T>`,
 * `ColumnType<…>` and `Selectable/Insertable/Updateable` helpers, e.g.
 *
 * ```ts
 * export interface QuizTable {
 *   id: Generated<string>
 *   title: string
 *   createdAt: ColumnType<Date, string | undefined, never>
 * }
 *
 * export type Quiz = Selectable<QuizTable>
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- no tables yet; the first migration adds them
export interface Database {}
