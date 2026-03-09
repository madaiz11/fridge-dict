import { AsyncLocalStorage } from 'node:async_hooks';

import type { RequestContextStore } from './interfaces/logger.interfaces';

const requestContextStorage = new AsyncLocalStorage<RequestContextStore>();

export function getRequestContext(): RequestContextStore | undefined {
  return requestContextStorage.getStore();
}

export function runWithRequestContext<T>(context: RequestContextStore, callback: () => T): T {
  return requestContextStorage.run(context, callback);
}
