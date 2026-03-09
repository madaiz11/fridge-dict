import { Inject, Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { createDate } from '@frigdict/date';

import { LOGGER_MODULE_OPTIONS } from '../core/configs/constants';
import type { LoggerModuleOptions } from '../core/interfaces/logger.interfaces';
import { runWithRequestContext } from '../core/request-context';
import {
  createCorrelationId,
  createRequestId,
  createSpanId,
} from '../core/types/logger.brand.type';
import { getHeaderName, getHeaderValue } from '../utils/logging.utils';
import { generateUniqueID } from '../utils/unique-id.util';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(
    @Inject(LOGGER_MODULE_OPTIONS)
    private readonly options: LoggerModuleOptions,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const correlationIdHeaderName = getHeaderName(this.options.headers, 'correlationId');
    const requestIdHeaderName = getHeaderName(this.options.headers, 'requestId');
    const spanIdHeaderName = getHeaderName(this.options.headers, 'spanId');

    const correlationIdHeaderValue = getHeaderValue(req.headers, correlationIdHeaderName);
    const requestIdHeaderValue = getHeaderValue(req.headers, requestIdHeaderName);
    const spanIdHeaderValue = getHeaderValue(req.headers, spanIdHeaderName);

    const correlationId = createCorrelationId(
      correlationIdHeaderValue ?? requestIdHeaderValue ?? generateUniqueID(),
    );
    const requestId = createRequestId(
      requestIdHeaderValue ?? (typeof req.id === 'string' ? req.id : undefined) ?? correlationId,
    );
    const spanId = createSpanId(spanIdHeaderValue ?? generateUniqueID());

    req.correlationId = correlationId;
    req.requestId = requestId;
    req.spanId = spanId;

    res.setHeader(correlationIdHeaderName, correlationId);
    res.setHeader(requestIdHeaderName, requestId);
    res.setHeader(spanIdHeaderName, spanId);

    runWithRequestContext(
      {
        correlationId,
        requestId,
        spanId,
        startedAt: createDate(),
      },
      next,
    );
  }
}
