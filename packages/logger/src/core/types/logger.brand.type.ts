import type { BrandedType } from '@frigdict/types';

export type CorrelationId = BrandedType<string, 'correlationId'>;
export type RequestId = BrandedType<string, 'requestId'>;
export type ServiceName = BrandedType<string, 'serviceName'>;
export type SpanId = BrandedType<string, 'spanId'>;
export type CustomHttpHeader = BrandedType<string, 'customHttpHeader'>;
export type HttpHeaderValue = BrandedType<string, 'httpHeaderValue'>;

export const createCorrelationId = (value: string): CorrelationId => value as CorrelationId;
export const createRequestId = (value: string): RequestId => value as RequestId;
export const createServiceName = (value: string): ServiceName => value as ServiceName;
export const createSpanId = (value: string): SpanId => value as SpanId;
export const createCustomHttpHeader = (value: string): CustomHttpHeader =>
  value as CustomHttpHeader;
export const createHttpHeaderValue = (value: string): HttpHeaderValue => value as HttpHeaderValue;

export const toCorrelationId = (value: string | undefined): CorrelationId | undefined => {
  return value ? createCorrelationId(value) : undefined;
};

export const toRequestId = (value: string | undefined): RequestId | undefined => {
  return value ? createRequestId(value) : undefined;
};

export const toSpanId = (value: string | undefined): SpanId | undefined => {
  return value ? createSpanId(value) : undefined;
};

export const toHttpHeaderValue = (value: string | undefined): HttpHeaderValue | undefined => {
  return value ? createHttpHeaderValue(value) : undefined;
};
