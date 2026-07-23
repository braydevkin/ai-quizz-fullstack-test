# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# @quiz/api — Express + Kysely
# Built from the monorepo root: docker build -f docker/api.Dockerfile .
# ---------------------------------------------------------------------------

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

# --- dependencies ----------------------------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/config/package.json ./packages/config/
RUN pnpm install --frozen-lockfile

# --- build -----------------------------------------------------------------
FROM deps AS build
COPY . .
RUN pnpm --filter @quiz/shared build \
  && pnpm --filter @quiz/api exec tsc -p tsconfig.json

# --- runtime ---------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs express

COPY --from=build --chown=express:nodejs /app /app

USER express
WORKDIR /app/apps/api
EXPOSE 3333

CMD ["node", "dist/server.js"]
