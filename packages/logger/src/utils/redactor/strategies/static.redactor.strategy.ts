import { type HttpHeaderValue, createHttpHeaderValue } from '../../../core/types/logger.brand.type';

export const staticRedactorStrategy = (): HttpHeaderValue => {
  return createHttpHeaderValue('[REDACTED]');
};
