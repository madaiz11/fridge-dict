# Shared Packages Setup Guide

This directory contains reusable workspace packages for the `frigdict-monorepo`.

Current examples:

- `@frigdict/types`: shared type contracts and branded types, declaration-only
- `@frigdict/logger`: reusable NestJS logger module built on top of `@frigdict/types`

## Prerequisites

1. Use Node.js `>=20`.
2. Use the workspace package manager from the root: `pnpm`.
3. Keep package names under the `@frigdict/*` scope.

## Recommended Package Patterns

Choose the package style before creating it:

- Types-only package: exports TypeScript types only, should be consumed with `import type`, and should emit declarations without runtime JavaScript. Follow the `@frigdict/types` pattern.
- Utility runtime package: no decorators, small export surface, shared helpers with real runtime behavior.
- NestJS package: uses decorators, modules, middleware, filters, or interceptors. Follow the `@frigdict/logger` pattern.

## Step-by-Step Setup

1. Create the package folder under `packages/<package-name>`.

Example:

```text
packages/
  my-package/
    src/
      index.ts
    package.json
    tsconfig.json
```

1. Register the package in `pnpm-workspace.yaml`.

```yaml
packages:
  - "apps/order-core"
  - "apps/replenishment-engine"
  - "apps/restock-core"
  - "packages/logger"
  - "packages/common"
  - "packages/my-package"
```

1. Create `package.json` for the new shared package.

Use this as the base for a types-only shared package:

```json
{
  "name": "@frigdict/my-package",
  "version": "1.0.0",
  "private": true,
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "pnpm run clean && tsc -p tsconfig.json",
    "clean": "node -e \"require('fs').rmSync('dist', { recursive: true, force: true })\"",
    "prepare": "pnpm run build",
    "test": "node -e \"require('assert').strictEqual(1,1); console.log('pass')\""
  },
  "devDependencies": {
    "typescript": "^5.9.2"
  }
}
```

Use this as the base for a utility runtime shared package:

```json
{
  "name": "@frigdict/my-package",
  "version": "1.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsup src/index.ts --format cjs --dts --clean --minify --out-dir dist",
    "prepare": "pnpm run build",
    "test": "node -e \"require('assert').strictEqual(1,1); console.log('pass')\""
  },
  "devDependencies": {
    "tsup": "^8.5.1",
    "typescript": "^5.9.2"
  }
}
```

Use this as the base for a NestJS-style shared package:

```json
{
  "name": "@frigdict/my-package",
  "version": "1.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "prepare": "pnpm run build",
    "test": "node -e \"require('assert').strictEqual(1,1); console.log('pass')\""
  },
  "devDependencies": {
    "typescript": "^5.9.2"
  }
}
```

1. Create `tsconfig.json` and extend the workspace base config.

Types-only package example:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": "./",
    "rootDir": "./src",
    "outDir": "./dist",
    "emitDeclarationOnly": true,
    "declarationMap": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

Utility runtime package example:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": "./",
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

NestJS package example:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": "./",
    "rootDir": "./src",
    "outDir": "./dist",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

1. Add a clean export entry at `src/index.ts`.

Keep the public API explicit and stable. Re-export only what consumers should use.

Example:

```ts
export * from './types';
export * from './services';
```

1. Add dependencies carefully.

- Use `workspace:*` for internal packages, for example `"@frigdict/types": "workspace:*"`.
- Keep framework dependencies only where needed.
- Avoid leaking implementation-only modules through the public API.

1. Build the new package from the workspace root.

```bash
pnpm --filter @frigdict/my-package run build
```

1. Reference the package from an app or another shared package.

Dependency example:

```json
{
  "dependencies": {
    "@frigdict/my-package": "workspace:*"
  }
}
```

Import example:

```ts
import { someSharedValue } from '@frigdict/my-package';
```

Types-only import example:

```ts
import type { SomeSharedType } from '@frigdict/my-package';
```

1. Verify the full workspace after the package is connected.

```bash
pnpm build
pnpm test
pnpm format:check
pnpm lint
```

## What This Repo Currently Does

- Shared packages live under `packages/`.
- Workspace registration is controlled by `pnpm-workspace.yaml`.
- `@frigdict/types` is the types-only package reference.
- `@frigdict/logger` is the NestJS shared module reference.
- Apps consume internal packages with `workspace:*`.

## Why `@frigdict/types` Is Different

`@frigdict/types` is different from other shared packages because its responsibility is only type contracts, not runtime behavior.

That means:

- consumers should prefer `import type`
- the package should emit `.d.ts` only
- it should not carry runtime helpers unless there is a strong reason
- it should stay dependency-light and stable because many packages can depend on it

This keeps the package lean, avoids unnecessary JavaScript output, and makes its design intent explicit.

## Recommended Checklist

- Folder exists under `packages/`
- Entry added to `pnpm-workspace.yaml`
- Package name uses `@frigdict/*`
- `types` and `files` point to `dist`
- add `main` only when the package has real runtime output
- `src/index.ts` exports the public API only
- `build` and `test` scripts exist
- Internal dependencies use `workspace:*`
- Root verification commands pass

