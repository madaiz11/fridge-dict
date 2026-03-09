import { createCustomHttpHeader } from '../types/logger.brand.type';

export const DEFAULT_CORRELATION_ID_HEADER = createCustomHttpHeader('x-correlation-id');
export const DEFAULT_REQUEST_ID_HEADER = createCustomHttpHeader('x-request-id');
export const DEFAULT_RESPONSE_TIME_HEADER = createCustomHttpHeader('x-response-time');
export const DEFAULT_SPAN_ID_HEADER = createCustomHttpHeader('x-span-id');

export const LOG_FIELD = {
  correlationId: 'correlation_id',
  executionTime: 'execution_time',
  httpHeaders: 'http_headers',
  requestId: 'request_id',
  serviceName: 'service_name',
  statusCode: 'status_code',
  timestamp: '@timestamp',
  spanId: 'span_id',
} as const;

export const DEFAULT_REDACTED_HEADERS = [
  createCustomHttpHeader('authorization'),
  createCustomHttpHeader('cookie'),
  createCustomHttpHeader('proxy-authorization'),
  createCustomHttpHeader('set-cookie'),
  createCustomHttpHeader('x-api-key'),
] as const;

export const LOGGER_MODULE_OPTIONS = Symbol('LOGGER_MODULE_OPTIONS');
