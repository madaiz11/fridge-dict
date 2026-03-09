import {
  type Abstract,
  type DynamicModule,
  type ForwardReference,
  Module,
  type Type,
} from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';

import { LOGGER_MODULE_OPTIONS } from './core/configs/constants';
import { createPinoHttpConfig } from './core/configs/pino-config';
import type { LoggerModuleOptions } from './core/interfaces/logger.interfaces';
import { LoggerExceptionFilter } from './integrations/exception.filter';
import { FrigdictLoggerService } from './integrations/logger.service';
import { LoggingInterceptor } from './integrations/logging.interceptor';

type DynamicImport = DynamicModule | ForwardReference | Promise<DynamicModule> | Type<unknown>;
type FactoryToken = Abstract<unknown> | string | symbol | Type<unknown>;

@Module({})
export class CommonLoggerModule {
  protected readonly moduleName = CommonLoggerModule.name;

  static forRoot(options: LoggerModuleOptions): DynamicModule {
    return {
      module: CommonLoggerModule,
      global: true,
      imports: [
        LoggerModule.forRoot({
          exclude: options.exclude,
          forRoutes: options.forRoutes,
          pinoHttp: createPinoHttpConfig(options),
          renameContext: options.renameContext ?? 'context',
        }),
      ],
      providers: [
        {
          provide: LOGGER_MODULE_OPTIONS,
          useValue: options,
        },
        FrigdictLoggerService,
        {
          provide: APP_INTERCEPTOR,
          useClass: LoggingInterceptor,
        },
        {
          provide: APP_FILTER,
          useClass: LoggerExceptionFilter,
        },
      ],
      exports: [FrigdictLoggerService, LoggerModule],
    };
  }

  static forRootAsync(options: {
    imports?: DynamicImport[];
    inject?: FactoryToken[];
    useFactory: (...args: unknown[]) => LoggerModuleOptions | Promise<LoggerModuleOptions>;
  }): DynamicModule {
    return {
      module: CommonLoggerModule,
      global: true,
      imports: [
        ...(options.imports ?? []),
        LoggerModule.forRootAsync({
          inject: options.inject ?? [],
          useFactory: async (...args) => {
            const loggerOptions = await options.useFactory(...args);

            return {
              pinoHttp: createPinoHttpConfig(loggerOptions),
              renameContext: loggerOptions.renameContext ?? 'context',
              forRoutes: loggerOptions.forRoutes,
              exclude: loggerOptions.exclude,
            };
          },
        }),
      ],
      providers: [
        {
          provide: LOGGER_MODULE_OPTIONS,
          inject: options.inject ?? [],
          useFactory: options.useFactory,
        },
        FrigdictLoggerService,
        {
          provide: APP_INTERCEPTOR,
          useClass: LoggingInterceptor,
        },
        {
          provide: APP_FILTER,
          useClass: LoggerExceptionFilter,
        },
      ],
      exports: [FrigdictLoggerService, LoggerModule],
    };
  }
}
