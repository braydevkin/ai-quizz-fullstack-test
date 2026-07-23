# CLAUDE.md

This file guides Claude Code when working in this repository.

## Project

**AI Development Quiz App** — an educational quiz platform where users test and
reinforce their knowledge of AI software development concepts (agent design,
prompt engineering, model selection, workflow automation).

The repository is built in phases. The **infrastructure phase is complete**: the
monorepo, tooling, Docker setup and a working web/API skeleton exist. Domain
work has **not** started.

## Rules

- **Never run database migrations.** Do not execute `pnpm db:migrate`,
  `db:migrate:up`, `db:migrate:down` or any equivalent — not to verify a change,
  not against a local database, not inside a container. Write migration files
  when asked; running them is the developer's call, always.

## Current phase guardrails

The quiz domain has started. The **quiz CRUD is built**: `quiz` + `question`
tables (`src/db/migrations/20260723000000_create_quiz_tables.ts`, typed in
`src/db/schema.ts`), the `src/modules/quiz` module (routes/service/repository/
schema) behind `/quizzes`, and a JSON seed (`src/db/seeds/*.json`, run with
`pnpm db:seed`). Contracts live in `@quiz/shared`.

Still not built, so do **not** create unless explicitly asked: authentication
and users; attempts, scoring or progress persistence; any `apps/web` domain UI
(it still serves one "it works" page). Follow the established quiz module layout
when extending the API, and never run migrations (see Rules above).

The test harness (Jest + Playwright) covers the quiz module and the
infrastructure. Don't write domain tests for features that don't exist yet.

### The `/quizzes` surface

| Method | Path           | Body (from `@quiz/shared`) | Success               |
| ------ | -------------- | -------------------------- | --------------------- |
| GET    | `/quizzes`     | —                          | 200 `QuizSummary[]`   |
| GET    | `/quizzes/:id` | —                          | 200 `Quiz`            |
| POST   | `/quizzes`     | `createQuizSchema`         | 201 `Quiz` + Location |
| PUT    | `/quizzes/:id` | `replaceQuizSchema`        | 200 `Quiz`            |
| PATCH  | `/quizzes/:id` | `updateQuizSchema`         | 200 `Quiz`            |
| DELETE | `/quizzes/:id` | —                          | 204                   |

Ids are optional on create: the service derives the quiz id from the title via
`utils/slug.ts` and numbers questions `1..n`. Column names stay snake_case;
`quiz.repository.ts`'s `toQuiz` / `toQuestionRows` are the camelCase boundary.
Validation failures and domain errors are thrown as `HttpError`
(`utils/http-error.ts`) and rendered by the existing `errorHandler`.

## Product scope (later phases — do not build yet)

- Landing page listing quiz categories (Agent Fundamentals, Prompt Engineering,
  Model Selection, …).
- Quiz flow: select category → multiple-choice questions (≥5) → immediate
  correct/incorrect feedback with explanation → progress indicator
  ("Question 3 of 10") → results screen with score + performance feedback →
  review / retake.
- Scoring, attempt history and progress persistence (localStorage acceptable;
  database for quiz content and progress).
- Content is data-driven — new quizzes/questions must be addable without code
  changes. Quiz JSON shape:
  `{ id, title, description, questions: [{ id, question, options[], correctAnswer, explanation }] }`
  (`correctAnswer` is the zero-based index into `options`).
- Stretch: profiles/username, dashboard, leaderboard, daily challenge,
  randomised order, "Learn Mode", "Create Your Own Quiz".

Keep the architecture modular so these slot in without refactors.

## Stack (pinned, exact versions in each `package.json`)

pnpm 11 workspaces · Turborepo 2 · TypeScript 5.9 (strict, ESM,
`verbatimModuleSyntax`) · Next.js 16 App Router + React 19 + TailwindCSS 4 +
shadcn/ui + Lucide + next-themes · Express 5 + zod 4 + dotenv + pino 10 /
pino-http 11 · Kysely 0.29 + `pg` 8 + PostgreSQL 17 · ESLint 9 flat config +
Prettier 3 · Docker Compose on `node:22-alpine` / `postgres:17-alpine`.

Node **>= 20.9** is required (`.nvmrc` pins 22). Dependency versions are pinned
exactly — bump them deliberately, not incidentally.

## Layout

```
apps/api        @quiz/api    Express + Kysely, port 3333
apps/web        @quiz/web    Next.js App Router, port 3000
packages/shared @quiz/shared types / schemas / constants / utils (compiled to dist/)
packages/config @quiz/config tsconfig, ESLint, Prettier consumed by every workspace
docker/         api.Dockerfile, web.Dockerfile   (docker-compose.yml is at the root)
```

### `apps/api`

```
src/server.ts     process entry point — listen + graceful shutdown (also closes the pool)
src/app.ts        composition root — createApp() returns a wired, unstarted Express app
src/routes/       routing table; index.ts mounts feature routers behind prefixes
src/middleware/   cross-cutting middleware (logger, cors, json, db, errors), wired in middleware/index.ts
src/lib/          env.ts (zod-validated config), logger.ts (pino), db.ts (Kysely instance)
src/db/           schema.ts (Database types), migrate.ts + seed.ts (CLIs), migrations/, seeds/
src/modules/      one folder per feature: <f>.routes.ts / .service.ts / .repository.ts / .schema.ts
src/services/     external integrations not owned by a feature
src/utils/        local helpers (http-error, slug, validation)
```

Routes: `GET /` → `{ "status": "ok" }` (`routes/health.route.ts`), and the
`/quizzes` CRUD from `modules/quiz` (see the guardrails section above).

### `apps/web`

```
src/app/          routes and layouts; layout.tsx wires next/font + ThemeProvider
src/components/   shared components; components/ui/ holds shadcn/ui primitives
src/features/     feature-sliced UI — one folder per feature
src/hooks/        reusable hooks
src/lib/          utils.ts (cn), env.ts (NEXT_PUBLIC_* parsing)
src/services/     API clients built on services/api-client.ts
src/styles/       globals.css — Tailwind v4 + shadcn tokens
src/types/        web-only types
```

Alias `@/*` → `src/*`. Dark mode is class-based (`next-themes`, `.dark`
selector, `@custom-variant dark` in `globals.css`). shadcn config lives in
`components.json` (style `new-york`, base colour `neutral`, CSS variables).

## Conventions

- **Shared code goes in `@quiz/shared`.** Never duplicate a type or schema
  between `apps/api` and `apps/web`.
- **Shared tooling goes in `@quiz/config`.** Apps extend its tsconfigs by
  **relative path** (`../../packages/config/tsconfig/node.json`) — deliberately
  not by package specifier, so `extends` resolves without `node_modules` and the
  editor never reports a phantom "file not found" on a fresh clone. ESLint
  configs are imported as `@quiz/config/eslint/{base,node,next}`: those load
  through Node at lint time, when the workspace is installed anyway. Don't
  inline tsconfig/ESLint options into an app when the rule belongs to every
  workspace.
- **ESM with NodeNext** in `apps/api` and `packages/shared`: relative imports
  need the `.js` extension (`./lib/env.js`). `apps/web` uses bundler resolution
  and does not.
- **ESLint stays type-unaware** on purpose (speed + uniformity); TypeScript's
  `strict` + `verbatimModuleSyntax` cover what typed rules would.
- **Prettier owns formatting** — no formatting rules in ESLint.
- **Small, single-responsibility files.** Prefer another module over another
  hundred lines. Register new middleware in `middleware/index.ts` and new routers
  in `routes/index.ts` so `app.ts` stays a thin composition root.
- **All configuration through env vars**, validated with zod at boot. Add new
  variables to `.env.example`, to `apps/api/src/lib/env.ts` (or
  `apps/web/src/lib/env.ts`), to `turbo.json`'s `build.env`, and to
  `docker-compose.yml`.
- **Credentials never get a default.** Secrets are declared required in
  `docker-compose.yml` (`${POSTGRES_USER:?…}`) so compose fails fast rather than
  booting a well-known user/password; the API container's `DATABASE_URL` is
  interpolated from those same variables, keeping one source of truth. Values in
  `.env.example` are local-development scaffolding only.
- **Conventional Commits**, enforced by Commitlint on `commit-msg`. Scopes:
  `api`, `web`, `shared`, `config`, `docker`, `repo`, `deps`, `ci`.
  Husky's `pre-commit` runs `lint-staged` (Prettier on staged files).

## Testing

Jest for unit tests in every workspace; Playwright for integration tests, in
`apps/web` only. The backend is deliberately unit-tested only — no supertest, no
HTTP-level suites.

```
packages/config/jest/base.mjs    options every project shares
packages/config/jest/node.mjs    ts-jest ESM preset (apps/api, packages/shared)
packages/config/jest/react.mjs   jsdom options merged into next/jest (apps/web)
```

- **Unit tests are colocated**: `src/**/*.test.ts(x)`, next to the code they
  cover. `testMatch` is scoped to `src`, so Playwright's specs never leak in.
- **Playwright lives in `apps/web/e2e/*.spec.ts`** and is never run by
  `pnpm test`. Its `webServer` reuses an already-running `pnpm dev`; browsers
  need `pnpm test:e2e:install` once.
- **`apps/api` runs native ESM**, so Jest needs
  `NODE_OPTIONS=--experimental-vm-modules` (already in its `test` script) and
  test files import `describe`/`it`/`expect`/`jest` from `@jest/globals` — those
  globals are not injected under ESM. `@types/jest` is therefore _not_ installed
  there; adding it would double-declare every matcher.
- **`apps/api/tsconfig.json` excludes `*.test.ts`** so tests stay out of `dist`;
  `tsconfig.test.json` type checks them and is what `pnpm typecheck` runs.
- **`apps/api/jest.setup.ts` assigns the test env vars** (`NODE_ENV`,
  `DATABASE_URL`, …) before any module loads, because `lib/env.ts` validates at
  import time. It never reads the developer's `.env`, so a real database can't
  be reached from a test.
- **`apps/web` uses `next/jest`** (SWC transform, `@/*` alias, CSS stubs) with
  Testing Library + jsdom; `jest.setup.ts` pulls in `@testing-library/jest-dom`.
  Globals are injected there, so no `@jest/globals` imports.

## CI and releases

Two GitHub Actions workflows follow the branch model — feature branch →
`develop` → `main`.

- **`.github/workflows/ci.yml`** runs on pull requests into `develop`/`main`
  and on pushes to `develop`: Commitlint over the pull request range,
  `format:check`, `lint`, `typecheck`, `test:coverage`, `build`, then Playwright
  in a separate job. It also declares `workflow_call`, so it is reusable.
- **`.github/workflows/release.yml`** runs on pushes to `main`. It calls `ci.yml`
  first, then derives the next version from the Conventional Commits since the
  last `v*` tag (breaking → major, `feat` → minor, anything else → patch;
  breaking stays a minor while the version is `0.x`), bumps every
  `package.json`, prepends to `CHANGELOG.md`, tags and publishes the release,
  and fast-forwards `develop`.
- **The version logic is three shell scripts** in `.github/scripts/`
  (`release-version.sh`, `release-notes.sh`, `changelog-update.sh`), not a
  release dependency — keep it that way, and keep them executable.
- **`.github/actions/setup`** is the composite action every job starts with
  (pnpm from `packageManager`, Node from `.nvmrc`, cached install). Add a job by
  reusing it, not by repeating the three steps.
- **`CHANGELOG.md` is generated.** Never edit released entries by hand, and keep
  the `<!-- releases -->` anchor — the release script inserts below it.
- **The release commit is `chore(repo): release vX.Y.Z [skip ci]`.** Both the
  `[skip ci]` marker and the `if:` guard on the release job exist to stop it
  from releasing itself; changing that message means changing the guard.

## Commands

```bash
nvm use && pnpm install         # Node 22 + workspace install
cp .env.example .env            # required before pnpm dev / docker compose up
pnpm dev                        # turbo: api (3333) + web (3000) together
pnpm build | lint | typecheck | format
pnpm --filter @quiz/api dev     # single workspace
pnpm db:migrate | db:migrate:up | db:migrate:down   # Kysely migrations
pnpm db:seed                    # load apps/api/src/db/seeds/*.json into the database
docker compose up               # postgres + api + web
docker compose up -d postgres   # just the database, for local dev

pnpm test                       # turbo: Jest unit tests in every workspace
pnpm test:coverage              # same, with coverage reports
pnpm --filter @quiz/web test:watch
pnpm test:e2e:install           # one-off: download the Playwright browsers
pnpm test:e2e | test:e2e:ui     # Playwright integration tests (web only)
```

Before calling work done, run `pnpm lint` and `pnpm typecheck` (and `pnpm build`
when touching build config, Docker or dependencies).

## Gotchas

- Kysely types are hand-written: a migration in `src/db/migrations/` and the
  matching table interface in `src/db/schema.ts` must be kept in sync. Migration
  files are picked up by filename order — prefix them with a timestamp.
- `Migrator` and `FileMigrationProvider` are imported from `kysely/migration`,
  not from the `kysely` root.
- Express 5 forwards rejected async handlers to the error middleware on its own
  — handlers don't need try/catch. `notFoundHandler` and `errorHandler` must
  stay registered _after_ the routing table, and `errorHandler` must keep its
  four parameters or Express won't recognise it.
- The Kysely instance hangs off `app.locals.db` (typed by the `Express.Locals`
  augmentation in `middleware/db.middleware.ts`); reach it from a handler with
  `req.app.locals.db`. Express has no lifecycle hooks, so `server.ts` owns
  `db.destroy()` on shutdown.
- `NEXT_PUBLIC_API_URL` is inlined into the browser bundle at build time, so in
  Docker it must be host-reachable (`http://localhost:3333`), not `http://api:3333`.
- The API boots without a live database — `pg` connects lazily.
- `packages/shared` is compiled; `turbo` builds it before anything that depends
  on it. Its `dev` script watches, so `pnpm dev` picks changes up automatically.
- The project root is **not** the git root — this workspace lives in
  `quizapp-fullstack-test/` inside the `assessments` repo. Husky therefore runs
  from `..` (`prepare` script) and the hooks `cd` back into the project before
  invoking `commitlint` / `lint-staged`. Run every `pnpm` command from here.
  Open the editor on **this** folder, not on `assessments/`, or the relative
  paths in `.vscode/settings.json` won't line up.
- The repo lives on the **WSL** filesystem and `node_modules` is mostly pnpm
  symlinks, which Windows cannot follow over `\\wsl.localhost`. Open the folder
  through the WSL extension (`code .` from a WSL shell) — a Windows-side editor
  shows `node_modules/@quiz` and `@types` as empty and reports every dependency
  as missing, while the CLI stays green. If the editor and `pnpm typecheck`
  disagree, check `ls ~/.vscode-server` before suspecting the repo.
- Don't "tidy" the tsconfig `extends` back to `@quiz/config/tsconfig/*.json`.
  That form resolves only once `pnpm install` has linked `node_modules`, so
  editors report `File '@quiz/config/tsconfig/node.json' not found` on a fresh
  clone, and again whenever a reinstall relinks node_modules under a running TS
  server. The relative path is immune to both. Verify any change with
  `pnpm --filter @quiz/api exec tsc -p tsconfig.json --showConfig`.
