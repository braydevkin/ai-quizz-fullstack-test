# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# @quiz/web — Next.js (App Router, standalone output)
# Built from the monorepo root: docker build -f docker/web.Dockerfile .
# ---------------------------------------------------------------------------

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
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
ARG NEXT_PUBLIC_API_URL=http://localhost:3333
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN pnpm --filter @quiz/shared build \
  && pnpm --filter @quiz/web build

# --- runtime ---------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs

# `output: 'standalone'` ships only the traced runtime files; static assets and
# `public/` have to be copied alongside it.
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000

CMD ["node", "apps/web/server.js"]
