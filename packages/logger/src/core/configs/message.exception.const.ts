import type { HeaderOptions } from '../interfaces/logger.interfaces';
import type { CustomHttpHeader, HttpHeaderValue } from '../types/logger.brand.type';

export const MESSAGE_EXCEPTION_CONST = {
  invalidHeaderKey: (key: keyof HeaderOptions) => `Invalid header key: ${key}`,
  invalidHeaderValue: (headerName: CustomHttpHeader, value: HttpHeaderValue | undefined) =>
    `Invalid header value: ${value ?? 'undefined'} for header: ${headerName}`,
  headerValueOutOfBounds: (headerName: CustomHttpHeader, value: HttpHeaderValue | undefined) =>
    `Invalid header value length: ${value?.length ?? 0} is out of bounds for header: ${headerName}`,
};
