import { Inject, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { LOGGER_MODULE_OPTIONS } from '../core/configs/constants';
import type { LoggerModuleOptions } from '../core/interfaces/logger.interfaces';
import { isPlainObject, serializeError } from '../utils/logging.utils';

type LogLevel = 'debug' | 'error' | 'fatal' | 'info' | 'trace' | 'warn';

@Injectable()
export class FrigdictLoggerService {
  private context?: string;
  private persistentBindings: Record<string, unknown> = {};

  constructor(
    @Inject(PinoLogger)
    private readonly pinoLogger: PinoLogger,
    @Inject(LOGGER_MODULE_OPTIONS)
    private readonly options: LoggerModuleOptions,
  ) {}

  setContext(context: string): void {
    this.context = context;
    this.pinoLogger.setContext(context);
  }

  assign(bindings: Record<string, unknown>): void {
    this.persistentBindings = {
      ...this.persistentBindings,
      ...bindings,
    };
    this.pinoLogger.assign(bindings);
  }

  trace(message: string, ...args: unknown[]): void {
    this.write('trace', message, args);
  }

  debug(message: string, ...args: unknown[]): void {
    this.write('debug', message, args);
  }

  info(message: string, ...args: unknown[]): void {
    this.write('info', message, args);
  }

  log(message: string, ...args: unknown[]): void {
    this.write('info', message, args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.write('warn', message, args);
  }

  error(message: string, ...args: unknown[]): void {
    this.write('error', message, args);
  }

  fatal(message: string, ...args: unknown[]): void {
    this.write('fatal', message, args);
  }

  verbose(message: string, ...args: unknown[]): void {
    this.write('trace', message, args);
  }

  get serviceName(): string {
    return this.options.serviceName;
  }

  private write(level: LogLevel, message: string, args: unknown[]): void {
    const payload = this.normalizePayload(args);
    const logObject = {
      ...this.persistentBindings,
      ...(this.context ? { context: this.context } : {}),
      ...payload,
    };

    this.pinoLogger[level](logObject, message);
  }

  private normalizePayload(args: unknown[]): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    const details: unknown[] = [];

    for (const arg of args) {
      if (arg instanceof Error) {
        payload.err = serializeError(arg);
        continue;
      }

      if (isPlainObject(arg)) {
        Object.assign(payload, arg);
        continue;
      }

      details.push(arg);
    }

    payload.details = details.length === 1 ? details[0] : details;

    return payload;
  }
}
