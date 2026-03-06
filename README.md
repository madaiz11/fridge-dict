# Frigdict Monorepo

Monorepo with Next.js (restock) and NestJS (order-core, replenishment-engine). Each app has its own PostgreSQL database and .env. Redis is shared between replenishment-engine and restock (container: `redis-restock-replenishment`).

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
   pnpm --filter order-core prisma:generate
   pnpm --filter order-core prisma:migrate
   pnpm --filter replenishment-engine prisma:generate
   pnpm --filter replenishment-engine prisma:migrate
   pnpm --filter restock prisma:generate
   pnpm --filter restock prisma:migrate
   ```

4. Run apps:
   - All: `pnpm dev`
   - Or individually: `pnpm dev:order-core`, `pnpm dev:replenishment-engine`, `pnpm dev:restock`

## Docker services

| Service                    | Port | Purpose                    |
|---------------------------|------|----------------------------|
| order-core-db             | 5433 | PostgreSQL for order-core |
| replenishment-engine-db   | 5434 | PostgreSQL for replenishment-engine |
| restock-db                | 5435 | PostgreSQL for restock    |
| redis-restock-replenishment | 6379 | Shared Redis (replenishment-engine + restock) |

## Apps

- **order-core** (NestJS) – port 3000, Postgres only
- **replenishment-engine** (NestJS) – port 3001, Postgres + Redis
- **restock** (Next.js) – port 3002, Postgres + Redis

.env files use `localhost` and the ports above for local development with Dockerized DBs and Redis.
