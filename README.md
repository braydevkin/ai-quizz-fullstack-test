# AI Development Quiz App

An educational quiz platform where users test and reinforce their knowledge of
AI software development concepts — agent design, prompt engineering, model
selection and workflow automation.

> **Status: domain phase, in progress.**
> The monorepo foundation is complete, and the first slice of domain logic has
> landed: quiz content is persisted in PostgreSQL and the API exposes a full
> CRUD surface at `/quizzes` (see [API](#api) below), seeded from JSON with
> `pnpm db:seed`. There is no authentication yet, and the web app still serves a
> single "it works" page — the quiz UI is the next slice. The test harness
> (Jest + Playwright) is wired up and now covers the quiz module too.

---

## Monorepo structure

```
.
├── apps/
│   ├── api/                  # Express + Kysely backend (port 3333)
│   └── web/                  # Next.js App Router frontend (port 3000)
├── packages/
│   ├── shared/               # types, zod schemas, constants, utils shared by both apps
│   └── config/               # base tsconfig / ESLint / Prettier consumed by every workspace
├── docker/
│   ├── api.Dockerfile
│   └── web.Dockerfile
├── docker-compose.yml        # postgres + api + web
├── turbo.json                # task graph
├── pnpm-workspace.yaml
└── .env.example
```

Workspaces are published under the `@quiz/*` scope: `@quiz/api`, `@quiz/web`,
`@quiz/shared`, `@quiz/config`.

---

## Tech stack

| Area            | Choice                                                                           |
| --------------- | -------------------------------------------------------------------------------- |
| Package manager | pnpm 11 (workspaces)                                                             |
| Monorepo        | Turborepo 2                                                                      |
| Language        | TypeScript 5.9 (strict, `verbatimModuleSyntax`, ESM everywhere)                  |
| Frontend        | Next.js 16 (App Router), React 19, TailwindCSS 4, shadcn/ui, Lucide, next-themes |
| Backend         | Node.js 22, Express 5, zod 4, dotenv, pino (pino-http)                           |
| Database        | PostgreSQL 17 via Kysely 0.29 (`pg` driver)                                      |
| Testing         | Jest 30 (unit, both apps), Testing Library + jsdom, Playwright 1.61 (web e2e)    |
| Quality         | ESLint 9 (flat config), Prettier 3, EditorConfig, Husky, lint-staged, Commitlint |
| Containers      | Docker Compose, `node:22-alpine`, `postgres:17-alpine`                           |

---

## Requirements

- **Node.js >= 20.9** (the repo pins **22** in `.nvmrc` — run `nvm use`)
- **pnpm >= 10** (`corepack enable` picks up the version from `packageManager`)
- **Docker** (only for the containerised workflow)

---

## Running locally

```bash
nvm use                 # Node 22
cp .env.example .env    # required — nothing has a built-in default
pnpm install
pnpm dev
```

`pnpm dev` starts the API and the web app together through Turborepo:

| Service | URL                   |
| ------- | --------------------- |
| Web     | http://localhost:3000 |
| API     | http://localhost:3333 |

```bash
curl http://localhost:3333/
# {"status":"ok"}
```

Local development expects a PostgreSQL instance reachable at `DATABASE_URL`.
The quickest way to get one is the compose service on its own:

```bash
docker compose up -d postgres
pnpm db:migrate         # create the quiz + question tables
pnpm db:seed            # load the starter quizzes from apps/api/src/db/seeds
```

> The API boots without a live database — `pg` connects lazily — so the health
> endpoint works even before Postgres is up.

---

## API

`GET /` is the health endpoint (`{"status":"ok"}`). Quiz content is served under
`/quizzes`:

| Method   | Path           | Body                 | Success                 |
| -------- | -------------- | -------------------- | ----------------------- |
| `GET`    | `/quizzes`     | —                    | `200` quiz summaries    |
| `GET`    | `/quizzes/:id` | —                    | `200` full quiz         |
| `POST`   | `/quizzes`     | quiz without ids     | `201` quiz + `Location` |
| `PUT`    | `/quizzes/:id` | full quiz            | `200` quiz (replaced)   |
| `PATCH`  | `/quizzes/:id` | any subset of fields | `200` quiz (updated)    |
| `DELETE` | `/quizzes/:id` | —                    | `204`                   |

A quiz is `{ id, title, description, questions[] }`, each question
`{ id, question, options[], correctAnswer, explanation }` where `correctAnswer`
is the zero-based index into `options`. Payload ids are optional — the API
derives a quiz id from the title (`Agent Fundamentals` → `agent-fundamentals`)
and numbers questions `1..n` — and the shape is validated by the shared zod
schemas in `@quiz/shared`. Errors come back as
`{ statusCode, error, message, details? }`.

Content is data-driven: drop a `*.json` quiz into `apps/api/src/db/seeds/` and
`pnpm db:seed` upserts it — no code change, and re-running is idempotent.

```bash
curl http://localhost:3333/quizzes
curl http://localhost:3333/quizzes/agent-fundamentals
```

---

## Running with Docker

```bash
cp .env.example .env
docker compose up
```

This builds and starts three services on a dedicated bridge network:

| Service    | Image / build           | Port   | Notes                                                       |
| ---------- | ----------------------- | ------ | ----------------------------------------------------------- |
| `postgres` | `postgres:17-alpine`    | `5432` | persistent `postgres-data` volume, `pg_isready` healthcheck |
| `api`      | `docker/api.Dockerfile` | `3333` | starts after Postgres is healthy, own healthcheck           |
| `web`      | `docker/web.Dockerfile` | `3000` | starts after the API is healthy, Next.js standalone output  |

Useful variations:

```bash
docker compose up -d          # detached
docker compose logs -f api    # follow one service
docker compose down           # stop
docker compose down -v        # stop and drop the database volume
```

`NEXT_PUBLIC_API_URL` is baked into the browser bundle at image build time, so
it must be an address the **browser** can reach (`http://localhost:3333` by
default), not the in-network `http://api:3333`.

---

## Scripts

### Root

| Script                                                  | Description                                 |
| ------------------------------------------------------- | ------------------------------------------- |
| `pnpm dev`                                              | Run every app in watch mode (Turborepo)     |
| `pnpm build`                                            | Build every workspace in dependency order   |
| `pnpm start`                                            | Run the production builds                   |
| `pnpm lint`                                             | ESLint across all workspaces                |
| `pnpm lint:fix`                                         | ESLint with `--fix`                         |
| `pnpm typecheck`                                        | `tsc --noEmit` across all workspaces        |
| `pnpm format`                                           | Prettier write                              |
| `pnpm format:check`                                     | Prettier check (CI-friendly)                |
| `pnpm clean`                                            | Remove build artefacts                      |
| `pnpm test`                                             | Jest unit tests across all workspaces       |
| `pnpm test:coverage`                                    | Unit tests with coverage reports            |
| `pnpm test:e2e` / `test:e2e:ui`                         | Playwright integration tests (`@quiz/web`)  |
| `pnpm test:e2e:install`                                 | Download the Playwright browsers (once)     |
| `pnpm db:migrate` / `db:migrate:up` / `db:migrate:down` | Kysely migrations for `@quiz/api`           |
| `pnpm db:seed`                                          | Load `apps/api/src/db/seeds/*.json` quizzes |
| `pnpm docker:up` / `docker:down` / `docker:reset`       | Compose shortcuts                           |

### Per app (`apps/api`, `apps/web`)

`dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:watch`,
`test:coverage` — plus `db:*` in the API and `test:e2e*` in the web app.

Target a single workspace with a filter:

```bash
pnpm --filter @quiz/api dev
pnpm --filter @quiz/web build
```

---

## Folder structure

### `apps/api` — Express

```
src/
├── server.ts            # process entry point: listen + graceful shutdown
├── app.ts               # composition root: builds a wired Express app
├── routes/              # routing table (health.route.ts → GET / → { status: "ok" })
├── middleware/          # cross-cutting middleware (logger, cors, json, db, errors)
├── lib/                 # env validation (zod), logger, Kysely instance (db.ts)
├── db/                  # schema.ts (Kysely types), migrate.ts (CLI), migrations/
├── modules/             # feature modules — one folder per feature (empty for now)
├── services/            # external integrations (empty for now)
└── utils/               # local helpers
```

### `apps/web` — Next.js App Router

```
src/
├── app/                 # routes, layouts (root layout wires fonts + theme)
├── components/          # shared components; components/ui holds shadcn/ui primitives
├── features/            # feature-sliced UI (empty for now)
├── hooks/               # reusable React hooks
├── lib/                 # utils (cn), public env parsing
├── services/            # API clients
├── styles/              # globals.css — Tailwind v4 + shadcn theme tokens
└── types/               # web-only types
```

Path alias `@/*` maps to `src/*`. Dark mode is class-based via `next-themes`,
with the shadcn "new-york" / neutral token set defined in `styles/globals.css`.

### `packages/shared`

Compiled to `dist/` and consumed as `@quiz/shared`. Barrels for `types/`,
`schemas/`, `constants/` and `utils/` are in place and intentionally empty —
anything both apps must agree on (quiz contracts, zod schemas) lands here
instead of being duplicated.

### `packages/config`

Single source of truth for tooling, consumed through subpath exports:

```jsonc
// tsconfig.json
{ "extends": "@quiz/config/tsconfig/node.json" } // or nextjs.json / base.json
```

```js
// eslint.config.mjs
import nodeConfig from '@quiz/config/eslint/node' // or /eslint/next
export default nodeConfig
```

```js
// jest.config.mjs
import { createNodeConfig } from '@quiz/config/jest/node' // or /jest/react
export default createNodeConfig()
```

---

## Testing

| Layer                  | Tool                                            | Location                     |
| ---------------------- | ----------------------------------------------- | ---------------------------- |
| Unit (frontend)        | Jest + Testing Library + jsdom, via `next/jest` | `apps/web/src/**/*.test.tsx` |
| Integration (frontend) | Playwright                                      | `apps/web/e2e/*.spec.ts`     |
| Unit (backend)         | Jest + ts-jest (native ESM)                     | `apps/api/src/**/*.test.ts`  |

Unit tests sit next to the code they cover; `testMatch` is scoped to `src/`, so
Playwright specs never run under Jest and vice versa.

```bash
pnpm test                            # every unit suite, through Turborepo
pnpm --filter @quiz/api test:watch   # one workspace, watch mode
pnpm test:e2e:install                # once: download the browsers
pnpm test:e2e                        # Playwright, boots the web app itself
```

Playwright's `webServer` starts `pnpm dev` on port 3000 and reuses an already
running dev server, so local runs don't fight over the port. In CI it always
starts its own, retries twice and records a trace on the first retry.

The backend is unit-tested only, by design: no HTTP-level or database-backed
suites. `apps/api/jest.setup.ts` assigns the environment tests run with, so
`lib/env.ts` validates successfully and a developer's real `DATABASE_URL` is
never picked up.

---

## Continuous integration and releases

Two workflows, shaped around the branch model — feature branch → `develop` → `main`.

| Workflow                                    | Runs on                                                     | Does                                                                                                       |
| ------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `CI` — `.github/workflows/ci.yml`           | pull requests into `develop` or `main`, pushes to `develop` | Commitlint (pull requests only), `format:check`, `lint`, `typecheck`, `test:coverage`, `build`, Playwright |
| `Release` — `.github/workflows/release.yml` | pushes to `main`, i.e. `develop` merged in                  | runs `CI` first, then versions, tags and publishes the release                                             |

`CI` is also a reusable workflow (`workflow_call`) and `Release` calls it, so
nothing is ever released without passing exactly the checks a pull request
gets. Its verification steps carry `if: !cancelled()`: one red step still
reports the others instead of hiding them behind the first failure. Coverage
and the Playwright report are uploaded as artifacts.

### How the version is chosen

`Release` reads the Conventional Commits added since the last `v*` tag:

| Commits in the range          | Bump                                     |
| ----------------------------- | ---------------------------------------- |
| `feat!:` / `BREAKING CHANGE:` | major — minor while the version is `0.x` |
| `feat:`                       | minor                                    |
| anything else                 | patch                                    |

Every merge into `main` therefore produces a release, a docs-only one included.
The first release publishes the version `package.json` already declares rather
than bumping it.

The job then makes one commit — `chore(repo): release vX.Y.Z [skip ci]` — that:

1. sets the new version on the root and on every workspace `package.json`,
2. prepends the grouped notes to `CHANGELOG.md`,
3. runs Prettier over both, so the commit meets the same bar as a handwritten one,
4. tags `vX.Y.Z`, pushes it and publishes a GitHub release carrying those notes,
5. fast-forwards `develop` so it picks the bump up too — a warning, not a
   failure, when `develop` has already moved on.

The logic sits in three small scripts under `.github/scripts/`
(`release-version.sh`, `release-notes.sh`, `changelog-update.sh`) instead of a
release toolchain, so the dependency set is unchanged.

### Repository settings this expects

- **Settings → Actions → General → Workflow permissions** set to
  _Read and write_, so the release job's `contents: write` can push the commit
  and the tag.
- If `main` is a protected branch, `github-actions[bot]` needs permission to
  push to it — otherwise the release commit is rejected and no release is cut.

---

## Environment variables

Copy `.env.example` to `.env` at the repository root — it is read by the API in
local development and by `docker compose`.

| Variable                                              | Purpose                                   | Default                 |
| ----------------------------------------------------- | ----------------------------------------- | ----------------------- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Compose Postgres credentials — required   | _none_                  |
| `POSTGRES_PORT`                                       | Host port the compose Postgres publishes  | `5432`                  |
| `DATABASE_URL`                                        | Connection string used by the API         | _none_                  |
| `PORT`                                                | API port                                  | `3333`                  |
| `HOST`                                                | API bind address                          | `0.0.0.0`               |
| `NODE_ENV`                                            | `development` \| `test` \| `production`   | `development`           |
| `LOG_LEVEL`                                           | pino level                                | `info`                  |
| `CORS_ORIGIN`                                         | Allowed origins (comma-separated, or `*`) | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL`                                 | API base URL used by the browser          | `http://localhost:3333` |

No credential carries a default. `docker-compose.yml` declares the three
`POSTGRES_*` variables as required (`${VAR:?…}`), so compose stops with a
readable error instead of falling back to a well-known user and password; the
API container's `DATABASE_URL` is assembled from those same variables, so the
credentials have a single source. The API validates its own environment with
zod at boot (`apps/api/src/lib/env.ts`) and fails fast the same way.

Everything in `.env.example` is throwaway local-development scaffolding. Real
secrets belong in the environment (CI secrets, deploy platform, secret
manager), never in a file in the repository.

---

## Conventions

- **Commits** follow [Conventional Commits](https://www.conventionalcommits.org/),
  enforced by Commitlint on the `commit-msg` hook:
  `feat(web): add results screen`, `fix(api): handle malformed payload`.
  Allowed scopes: `api`, `web`, `shared`, `config`, `docker`, `repo`, `deps`, `ci`.
- **Pre-commit** runs `lint-staged` (Prettier on staged files) via Husky.
- **Formatting** is Prettier-only; ESLint never fights it (`eslint-config-prettier`).
- **Files stay small and single-purpose**; features are modules, not layers
  sprinkled across the tree.

---

## Roadmap

The base is deliberately shaped so the product slots in without refactors:

1. ✅ Quiz content tables in `apps/api/src/db/migrations`, typed in
   `src/db/schema.ts`, contracts in `@quiz/shared`.
2. ✅ `apps/api/src/modules/quiz` — routes, service, repository.
3. `apps/web/src/features/quiz` — category list, question flow, results.
4. Attempt history and progress persistence.
5. Stretch: profiles, dashboard, leaderboard, daily challenge, Learn Mode.
