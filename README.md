# AI Development Quiz App

An educational quiz platform where users test and reinforce their knowledge of
AI software development concepts — agent design, prompt engineering, model
selection and workflow automation.

> **Status: infrastructure phase.**
> This repository currently contains the monorepo foundation only — no domain
> logic, no quiz entities, no authentication, no tests. The web app serves a
> single "it works" page and the API exposes a single health endpoint. Product
> features are built on top of this base in the next phase.

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
cp .env.example .env    # local defaults, already pointing at localhost:5432
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
pnpm db:migrate         # apply pending migrations (none yet)
```

> The API boots without a live database — `pg` connects lazily — so the health
> endpoint works even before Postgres is up.

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

| Script                                                  | Description                               |
| ------------------------------------------------------- | ----------------------------------------- |
| `pnpm dev`                                              | Run every app in watch mode (Turborepo)   |
| `pnpm build`                                            | Build every workspace in dependency order |
| `pnpm start`                                            | Run the production builds                 |
| `pnpm lint`                                             | ESLint across all workspaces              |
| `pnpm lint:fix`                                         | ESLint with `--fix`                       |
| `pnpm typecheck`                                        | `tsc --noEmit` across all workspaces      |
| `pnpm format`                                           | Prettier write                            |
| `pnpm format:check`                                     | Prettier check (CI-friendly)              |
| `pnpm clean`                                            | Remove build artefacts                    |
| `pnpm db:migrate` / `db:migrate:up` / `db:migrate:down` | Kysely migrations for `@quiz/api`         |
| `pnpm docker:up` / `docker:down` / `docker:reset`       | Compose shortcuts                         |

### Per app (`apps/api`, `apps/web`)

`dev`, `build`, `start`, `lint`, `typecheck` — plus `db:*` in the API.

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

---

## Environment variables

Copy `.env.example` to `.env` at the repository root — it is read by the API in
local development and by `docker compose`.

| Variable                                                                | Purpose                                   | Default                                      |
| ----------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------- |
| `DATABASE_URL`                                                          | PostgreSQL connection string              | `postgresql://quiz:quiz@localhost:5432/quiz` |
| `PORT`                                                                  | API port                                  | `3333`                                       |
| `HOST`                                                                  | API bind address                          | `0.0.0.0`                                    |
| `NODE_ENV`                                                              | `development` \| `test` \| `production`   | `development`                                |
| `LOG_LEVEL`                                                             | pino level                                | `info`                                       |
| `CORS_ORIGIN`                                                           | Allowed origins (comma-separated, or `*`) | `http://localhost:3000`                      |
| `NEXT_PUBLIC_API_URL`                                                   | API base URL used by the browser          | `http://localhost:3333`                      |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` / `POSTGRES_PORT` | Compose Postgres service                  | `quiz` / `quiz` / `quiz` / `5432`            |

The API validates its environment with zod at boot (`apps/api/src/lib/env.ts`)
and fails fast with a readable message when something is missing.

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

1. Quiz content tables in `apps/api/src/db/migrations`, typed in `src/db/schema.ts`,
   contracts in `@quiz/shared`.
2. `apps/api/src/modules/quiz` — routes, service, repository.
3. `apps/web/src/features/quiz` — category list, question flow, results.
4. Attempt history and progress persistence.
5. Stretch: profiles, dashboard, leaderboard, daily challenge, Learn Mode.
