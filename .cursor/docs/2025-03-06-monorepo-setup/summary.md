# Monorepo Setup Summary – 2025-03-06

## What was done

1. **Monorepo root**
   - `pnpm-workspace.yaml` with packages: `apps/order-core`, `apps/replenishment-engine`, `apps/restock`
   - Root `package.json` with scripts: `build`, `dev`, `dev:*`, `docker:up`, `docker:down`
   - `tsconfig.base.json` for shared TS options

2. **Three apps**
   - **order-core** (NestJS) – port 3000, Postgres only, `.env` with `DATABASE_URL`, `PORT`
   - **replenishment-engine** (NestJS) – port 3001, Postgres + Redis, `.env` with `DATABASE_URL`, `REDIS_URL`, `PORT`
   - **restock** (Next.js) – port 3002, Postgres + Redis, `.env` with `DATABASE_URL`, `REDIS_URL`, `PORT`

3. **Docker Compose**
   - **order-core-db**: Postgres 16, port 5433, user `order_core`, db `order_core`
   - **replenishment-engine-db**: Postgres 16, port 5434, user `replenishment`, db `replenishment_engine`
   - **restock-db**: Postgres 16, port 5435, user `restock`, db `restock`
   - **redis-restock-replenishment**: Redis 7, port 6379 (shared by replenishment-engine and restock)
   - Named volumes for each DB and Redis

4. **.env**
   - Each app’s `.env` points to `localhost` and the Docker-exposed ports above (for local dev with Docker).
   - replenishment-engine and restock use the same Redis URL: `redis://localhost:6379`.

5. **Prisma**
   - Each app has its own `prisma/schema.prisma` and `generated/prisma` output (no cross-app overwrite in pnpm).
   - order-core: `PrismaModule` + `PrismaService` (NestJS), extends `PrismaClient`, connects via `DATABASE_URL`.
   - replenishment-engine: same Prisma setup + `RedisModule` / `RedisService` (ioredis).
   - restock: singleton `prisma` and `redis` in `src/lib` for Next.js, using `DATABASE_URL` and `REDIS_URL`.

## Design choices

- **Separate DB per app**: Each service has its own Postgres in Docker to keep boundaries clear.
- **One Redis for “restock replenishment”**: Single Redis container `redis-restock-replenishment` used by both replenishment-engine and restock; namespacing (e.g. key prefix) is left to app code.
- **Prisma client output**: Custom `output = "../generated/prisma"` per app so pnpm doesn’t share one client across different schemas.
- **NestJS**: `experimentalDecorators` and `emitDecoratorMetadata` enabled in each Nest app’s `tsconfig.json`.

## How to run

1. `pnpm install`
2. `pnpm docker:up` (start Postgres and Redis)
3. Per app: `pnpm --filter <app> prisma:generate` and `pnpm --filter <app> prisma:migrate`
4. `pnpm dev` (all apps) or `pnpm dev:order-core` / `pnpm dev:replenishment-engine` / `pnpm dev:restock`

## Files touched/added

- Root: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `docker-compose.yml`, `.gitignore`, `README.md`
- apps/order-core: package.json, .env, .env.example, nest-cli.json, tsconfig.json, src (main, app module/controller/service, prisma module/service), prisma/schema.prisma
- apps/replenishment-engine: same Nest structure + redis module/service, .env with REDIS_URL, prisma/schema.prisma
- apps/restock: package.json, .env, .env.example, next.config.ts, tsconfig.json, src/app (layout, page, api/health), src/lib (prisma, redis), prisma/schema.prisma
