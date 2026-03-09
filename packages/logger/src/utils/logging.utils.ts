import type { IncomingHttpHeaders } from 'node:http';

import { type DateType, createDate } from '@frigdict/date';
import { MESSAGE_EXCEPTION_CONST } from '../core/configs';
import {
  DEFAULT_CORRELATION_ID_HEADER,
  DEFAULT_REDACTED_HEADERS,
  DEFAULT_REQUEST_ID_HEADER,
  DEFAULT_RESPONSE_TIME_HEADER,
  DEFAULT_SPAN_ID_HEADER,
} from '../core/configs/constants';
import { HeaderException } from '../core/exceptions/header.exceptions';
import type {
  HeaderOptions,
  RequestWithIds,
  ResponseWithLoggingFields,
} from '../core/interfaces/logger.interfaces';
import {
  type CustomHttpHeader,
  createCustomHttpHeader,
  toCorrelationId,
  toHttpHeaderValue,
  toRequestId,
  toSpanId,
} from '../core/types/logger.brand.type';
import { redactorFactory } from './redactor';

export const getHeaderName = (
  headerOptions: HeaderOptions | undefined,
  key: keyof HeaderOptions,
): CustomHttpHeader => {
  let headerName: string;
  switch (key) {
    case 'correlationId':
      headerName = headerOptions?.correlationId?.toLowerCase() ?? DEFAULT_CORRELATION_ID_HEADER;
      break;
    case 'requestId':
      headerName = headerOptions?.requestId?.toLowerCase() ?? DEFAULT_REQUEST_ID_HEADER;
      break;
    case 'spanId':
      headerName = headerOptions?.spanId?.toLowerCase() ?? DEFAULT_SPAN_ID_HEADER;
      break;
    default:
      throw new HeaderException(MESSAGE_EXCEPTION_CONST.invalidHeaderKey(key));
  }

  return createCustomHttpHeader(headerName);
};

export const getHeaderValue = (
  headers: IncomingHttpHeaders | Record<string, string | string[] | undefined> | undefined,
  headerName: CustomHttpHeader,
): string | undefined => {
  const headerValue = headers?.[headerName.toLowerCase()];
  if (Array.isArray(headerValue)) {
    return headerValue[0];
  }

  return headerValue;
};

export const getRequestIdentifiers = (
  req: RequestWithIds,
  headerOptions?: HeaderOptions,
): HeaderOptions => {
  const correlationHeader = getHeaderName(headerOptions, 'correlationId');
  const requestHeader = getHeaderName(headerOptions, 'requestId');
  const spanHeader = getHeaderName(headerOptions, 'spanId');

  const requestIdFromRequest =
    typeof req.id === 'string' || typeof req.id === 'number' ? String(req.id) : undefined;

  return {
    correlationId:
      req.correlationId ??
      toCorrelationId(getHeaderValue(req.headers, correlationHeader)) ??
      toCorrelationId(getHeaderValue(req.headers, requestHeader)),
    requestId:
      req.requestId ??
      toRequestId(requestIdFromRequest) ??
      toRequestId(getHeaderValue(req.headers, requestHeader)),
    spanId: req.spanId ?? toSpanId(getHeaderValue(req.headers, spanHeader)),
  };
};

export const sanitizeHeaders = (
  headers: IncomingHttpHeaders | Record<string, unknown> | undefined,
  redactedHeaders: CustomHttpHeader[] = [...DEFAULT_REDACTED_HEADERS],
): Record<string, string> => {
  if (!headers) {
    return {};
  }

  const output: Record<string, string> = {};
  const redactedHeaderSet = new Set(redactedHeaders.map((headerName) => headerName.toLowerCase()));

  for (const [headerName, headerValue] of Object.entries(headers)) {
    const normalizedHeaderName = headerName.toLowerCase();
    if (redactedHeaderSet.has(normalizedHeaderName)) {
      const hName = createCustomHttpHeader(normalizedHeaderName);
      const hValue = toHttpHeaderValue(headerValue as string | undefined);

      output[normalizedHeaderName] = redactorFactory(hName, hValue);
      continue;
    }

    if (Array.isArray(headerValue)) {
      output[normalizedHeaderName] = headerValue.join(', ');
      continue;
    }

    output[normalizedHeaderName] = String(headerValue ?? '');
  }

  return output;
};

export const getExecutionTime = (
  startedAt?: DateType,
  res?: ResponseWithLoggingFields,
): number | null => {
  if (typeof res?.responseTime === 'number') {
    return res.responseTime;
  }

  const responseHeader = res?.getHeader?.(DEFAULT_RESPONSE_TIME_HEADER);
  if (typeof responseHeader === 'number') {
    return responseHeader;
  }

  if (typeof responseHeader === 'string') {
    const parsedResponseTime = Number.parseInt(responseHeader, 10);
    return Number.isFinite(parsedResponseTime) ? parsedResponseTime : null;
  }

  if (startedAt) {
    const currentDate = createDate();
    return currentDate.diff(startedAt, 'millisecond');
  }

  return null;
};

export const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  return Object.getPrototypeOf(value) === Object.prototype;
};

export const serializeError = (error: Error): Record<string, string | undefined> => {
  return {
    message: error.message,
    stack: error.stack,
    type: error.constructor?.name ?? 'Error',
  };
};
