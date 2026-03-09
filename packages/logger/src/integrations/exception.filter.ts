import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

import { LOGGER_MODULE_OPTIONS, LOG_FIELD } from '../core/configs/constants';
import type { LoggerModuleOptions } from '../core/interfaces/logger.interfaces';
import { getRequestContext } from '../core/request-context';
import { createCustomHttpHeader } from '../core/types/logger.brand.type';
import { getExecutionTime, sanitizeHeaders, serializeError } from '../utils/logging.utils';

@Catch()
export class LoggerExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(PinoLogger)
    private readonly logger: PinoLogger,
    @Inject(LOGGER_MODULE_OPTIONS)
    private readonly options: LoggerModuleOptions,
  ) {
    this.logger.setContext(LoggerExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const redactedHeaders = this.options.redactedHeaders?.map(createCustomHttpHeader);

    if (host.getType() !== 'http') {
      throw exception;
    }

    const httpContext = host.switchToHttp();
    const req = httpContext.getRequest<Request>();
    const res = httpContext.getResponse<Response>();

    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : {
            message: exception instanceof Error ? exception.message : 'Internal server error',
            statusCode,
          };
    const requestContext = getRequestContext();

    this.logger.error(
      {
        context: LoggerExceptionFilter.name,
        err: exception instanceof Error ? serializeError(exception) : undefined,
        [LOG_FIELD.executionTime]: getExecutionTime(requestContext?.startedAt),
        [LOG_FIELD.httpHeaders]: sanitizeHeaders(req.headers, redactedHeaders),
        request: {
          method: req.method,
          params: req.params ?? {},
          query: req.query ?? {},
          [LOG_FIELD.requestId]: req.requestId ?? null,
          url: req.originalUrl ?? req.url,
        },
        response: {
          headers: sanitizeHeaders(res.getHeaders?.(), redactedHeaders),
          [LOG_FIELD.statusCode]: statusCode,
        },
      },
      exception instanceof Error ? exception.message : 'Unhandled exception',
    );

    if (res.headersSent) {
      return;
    }

    res.status(statusCode).json(
      typeof errorResponse === 'object' && errorResponse !== null
        ? errorResponse
        : {
            message: String(errorResponse),
            statusCode,
          },
    );
  }
}
