import type { DateType } from '@frigdict/date';
import type { HttpStatus } from '@nestjs/common';
import type { Params } from 'nestjs-pino';
import type { Options as PinoHttpOptions } from 'pino-http';
import type { CorrelationId, RequestId, ServiceName, SpanId } from '../types/logger.brand.type';

export interface HeaderOptions {
  correlationId?: CorrelationId;
  requestId?: RequestId;
  spanId?: SpanId;
}

export interface RequestContextStore {
  correlationId: CorrelationId;
  requestId: RequestId;
  spanId: SpanId;
  startedAt: DateType;
}

export interface RequestWithIds {
  correlationId?: CorrelationId;
  headers?: Record<string, string | string[] | undefined>;
  id?: unknown;
  requestId?: RequestId;
  spanId?: SpanId;
}

export interface LoggerModuleOptions {
  autoLogging?: boolean;
  baseBindings?: Record<string, unknown>;
  exclude?: Params['exclude'];
  forRoutes?: Params['forRoutes'];
  headers?: HeaderOptions;
  pinoHttp?: PinoHttpOptions;
  redactedHeaders?: string[];
  renameContext?: Params['renameContext'];
  serviceName: ServiceName;
}

declare global {
  namespace Express {
    interface Request {
      correlationId?: CorrelationId;
      requestId?: RequestId;
      spanId?: SpanId;
    }
  }
}

export interface ResponseWithLoggingFields {
  getHeader?(name: string): number | string | string[] | undefined;
  getHeaders?(): Record<string, number | string | string[] | undefined>;
  responseTime?: number;
  statusCode?: HttpStatus;
}
