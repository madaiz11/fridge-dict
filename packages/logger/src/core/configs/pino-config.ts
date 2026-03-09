import type { Options as PinoHttpOptions } from 'pino-http';

import {
  getExecutionTime,
  getRequestIdentifiers,
  sanitizeHeaders,
  serializeError,
} from '../../utils/logging.utils';
import { generateUniqueID } from '../../utils/unique-id.util';
import type { LoggerModuleOptions } from '../interfaces/logger.interfaces';
import { getRequestContext } from '../request-context';
import { createCustomHttpHeader } from '../types/logger.brand.type';
import { LOG_FIELD } from './constants';

export function createPinoHttpConfig(options: LoggerModuleOptions): PinoHttpOptions {
  const redactedHeaders = options.redactedHeaders?.map(createCustomHttpHeader);

  const baseConfig: PinoHttpOptions = {
    autoLogging: options.autoLogging ?? true,
    base: null,
    customAttributeKeys: {
      err: 'err',
      req: 'request',
      res: 'response',
      responseTime: 'execution_time',
    },
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) {
        return 'error';
      }

      if (res.statusCode >= 400) {
        return 'warn';
      }

      return 'info';
    },
    customProps: (req, res) => {
      const requestContext = getRequestContext();

      return {
        [LOG_FIELD.httpHeaders]: sanitizeHeaders(req.headers, redactedHeaders),
        [LOG_FIELD.executionTime]: getExecutionTime(requestContext?.startedAt, res),
      };
    },
    customSuccessMessage: (req, res) => `${req.method} ${req.url} completed with ${res.statusCode}`,
    formatters: {
      level: (label) => ({ level: label }),
    },
    genReqId: (req) => {
      const identifiers = getRequestIdentifiers(req, options.headers);
      return identifiers.requestId ?? identifiers.correlationId ?? generateUniqueID();
    },
    messageKey: 'message',
    mixin: () => {
      const requestContext = getRequestContext();

      return {
        ...options.baseBindings,
        [LOG_FIELD.timestamp]: new Date().toISOString(),
        [LOG_FIELD.correlationId]: requestContext?.correlationId ?? null,
        [LOG_FIELD.requestId]: requestContext?.requestId ?? null,
        [LOG_FIELD.serviceName]: options.serviceName,
        [LOG_FIELD.spanId]: requestContext?.spanId ?? null,
      };
    },
    serializers: {
      err: (error) => serializeError(error),
      req: (req) => {
        const identifiers = getRequestIdentifiers(req, options.headers);

        return {
          id: req.id,
          method: req.method,
          params: req.params ?? {},
          query: req.query ?? {},
          [LOG_FIELD.requestId]: identifiers.requestId ?? null,
          url: req.originalUrl ?? req.url,
        };
      },
      res: (res) => ({
        headers: sanitizeHeaders(res.getHeaders?.(), redactedHeaders),
        [LOG_FIELD.statusCode]: res.statusCode,
      }),
    },
  };

  return options.pinoHttp
    ? (deepMerge(
        baseConfig as Record<string, unknown>,
        options.pinoHttp as Record<string, unknown>,
      ) as PinoHttpOptions)
    : baseConfig;
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const output: Record<string, unknown> = { ...target };

  for (const [sourceKey, sourceValue] of Object.entries(source)) {
    const targetValue = output[sourceKey];
    if (isMergeableObject(targetValue) && isMergeableObject(sourceValue)) {
      output[sourceKey] = deepMerge(targetValue, sourceValue);
      continue;
    }

    if (sourceValue !== undefined) {
      output[sourceKey] = sourceValue;
    }
  }

  return output;
}

function isMergeableObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
