import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';

const DEFAULT_FILENAMES = ['.env'] as const;

export interface LoadEnvOptions {
  cwd?: string;
  filenames?: readonly string[];
}

export interface LoadEnvResult {
  loadedPath?: string;
}

export const loadEnv = (options: LoadEnvOptions = {}): LoadEnvResult => {
  const cwd = options.cwd ?? process.cwd();
  const filenames = options.filenames ?? DEFAULT_FILENAMES;
  const loadedPath = filenames
    .map((filename) => resolve(cwd, filename))
    .find((candidatePath) => existsSync(candidatePath));

  if (!loadedPath) {
    return {};
  }

  config({ path: loadedPath, quiet: true });

  return { loadedPath };
};
