import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import { type Observable, finalize } from 'rxjs';

import { DEFAULT_RESPONSE_TIME_HEADER } from '../core/configs/constants';
import { getRequestContext } from '../core/request-context';
import { getExecutionTime } from '../utils/logging.utils';

interface ResponseWithTime extends Response {
  responseTime?: number;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const httpContext = context.switchToHttp();
    const res = httpContext.getResponse<ResponseWithTime>();

    return next.handle().pipe(
      finalize(() => {
        const requestContext = getRequestContext();
        const executionTime = getExecutionTime(requestContext?.startedAt, res);
        if (executionTime === null) {
          return;
        }

        res.responseTime = executionTime;

        if (!res.headersSent) {
          res.setHeader(DEFAULT_RESPONSE_TIME_HEADER, String(executionTime));
        }
      }),
    );
  }
}
