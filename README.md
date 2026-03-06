# Frigdict Monorepo

Monorepo with NestJS apps (order-core, replenishment-engine, restock-core). Each app has its own PostgreSQL database and .env. Redis is shared between replenishment-engine and restock-core (container: `redis-restock-replenishment`).

## Prerequisites

- Node.js >= 20
- pnpm 9+
- Docker & Docker Compose

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start databases and Redis:
   ```bash
   pnpm docker:up
   ```

3. Generate Prisma clients and run migrations (per app):
   ```bash
   pnpm -r run prisma:generate
   pnpm --filter order-core prisma:migrate
   pnpm --filter replenishment-engine prisma:migrate
   pnpm --filter restock-core prisma:migrate
   ```

4. Run apps:
   - All: `pnpm dev`
   - Or individually: `pnpm dev:order-core`, `pnpm dev:replenishment-engine`, `pnpm dev:restock-core`

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all apps |
| `pnpm test` | Run tests in all workspaces |
| `pnpm lint` | Biome check (lint + format check) |
| `pnpm lint:fix` | Biome check with auto-fix and format |
| `pnpm format` | Format all files with Biome |
| `pnpm format:check` | Check formatting only |
| `pnpm docker:up` / `pnpm docker:down` | Start/stop Docker services |
| `pnpm version` | Bump versions (changesets) |
| `pnpm release` | Publish (changesets) |

## Pre-commit (Husky + Biome)

On `git commit`, lint-staged runs **Biome** on staged files (`*.ts, tsx, js, jsx, mjs, cjs, json, md, yml, yaml, css`): format + lint with auto-fix. Ensure `pnpm run lint:fix` passes before committing.

## CI / GitHub

- **PR to main/dev:** Build, test, changeset required (when `apps/` or `packages/` change), AI code review (google-github-actions/run-gemini-cli, model gemini-2.5-flash). Add `GEMINI_API_KEY` in repo Secrets for AI review.
- **Push to main:** Release workflow runs build then changesets version/publish.
- Add a changeset when changing `apps/` or `packages/`: `pnpm changeset`, then commit the new file under `.changeset/`.

## Docker services

| Service                    | Port | Purpose                    |
|---------------------------|------|----------------------------|
| order-core-db             | 5433 | PostgreSQL for order-core |
| replenishment-engine-db   | 5434 | PostgreSQL for replenishment-engine |
| restock-db                | 5435 | PostgreSQL for restock-core |
| redis-restock-replenishment | 6379 | Shared Redis (replenishment-engine + restock-core) |

## Apps

- **order-core** (NestJS) – port 3000, Postgres only
- **replenishment-engine** (NestJS) – port 3001, Postgres + Redis
- **restock-core** (NestJS) – port 3002, Postgres (+ Redis when needed)

`.env` files use `localhost` and the ports above for local development with Dockerized DBs and Redis.
