import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const { loadEnv } = await import('../dist/index.js');

const withTempDir = (callback) => {
  const directoryPath = mkdtempSync(join(tmpdir(), 'frigdict-bootstrap-'));

  try {
    callback(directoryPath);
  } finally {
    rmSync(directoryPath, { force: true, recursive: true });
  }
};

test('loadEnv loads variables from .env in the provided directory', () => {
  withTempDir((directoryPath) => {
    const envKey = 'BOOTSTRAP_TEST_LOADS_ENV';
    const envFilePath = join(directoryPath, '.env');

    delete process.env[envKey];
    writeFileSync(envFilePath, `${envKey}=loaded-value\n`);

    const result = loadEnv({ cwd: directoryPath });

    assert.equal(result.loadedPath, envFilePath);
    assert.equal(process.env[envKey], 'loaded-value');

    delete process.env[envKey];
  });
});

test('loadEnv returns no path when no env file exists', () => {
  withTempDir((directoryPath) => {
    const result = loadEnv({ cwd: directoryPath });

    assert.deepEqual(result, {});
  });
});

test('loadEnv preserves existing process.env values', () => {
  withTempDir((directoryPath) => {
    const envKey = 'BOOTSTRAP_TEST_PRESERVES_ENV';
    const envFilePath = join(directoryPath, '.env');

    process.env[envKey] = 'existing-value';
    writeFileSync(envFilePath, `${envKey}=new-value\n`);

    const result = loadEnv({ cwd: directoryPath });

    assert.equal(result.loadedPath, envFilePath);
    assert.equal(process.env[envKey], 'existing-value');

    delete process.env[envKey];
  });
});
