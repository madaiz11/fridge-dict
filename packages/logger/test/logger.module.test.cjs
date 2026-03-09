jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

const { APP_FILTER, APP_INTERCEPTOR } = require('@nestjs/core');
const {
  CommonLoggerModule,
  CorrelationIdMiddleware,
  FrigdictLoggerService,
  LOGGER_MODULE_OPTIONS,
  LoggerExceptionFilter,
  LoggingInterceptor,
  createServiceName,
} = require('../dist');

const hasProvider = (providers, token, predicate = () => true) => {
  return providers.some((provider) => {
    if (provider === token) {
      return predicate({});
    }

    if (provider?.provide === token) {
      return predicate(provider);
    }

    return false;
  });
};

test('CommonLoggerModule.forRoot exposes logger DI contract', () => {
  const options = {
    serviceName: createServiceName('logger-test-service'),
  };

  const dynamicModule = CommonLoggerModule.forRoot(options);
  const providers = dynamicModule.providers ?? [];
  const exportsList = dynamicModule.exports ?? [];

  expect(dynamicModule.module).toBe(CommonLoggerModule);
  expect(dynamicModule.global).toBe(true);
  expect(dynamicModule.imports?.length).toBeGreaterThan(0);
  expect(
    hasProvider(providers, LOGGER_MODULE_OPTIONS, (provider) => provider.useValue === options),
  ).toBe(true);
  expect(hasProvider(providers, CorrelationIdMiddleware)).toBe(true);
  expect(hasProvider(providers, FrigdictLoggerService)).toBe(true);
  expect(
    hasProvider(providers, APP_INTERCEPTOR, (provider) => provider.useClass === LoggingInterceptor),
  ).toBe(true);
  expect(
    hasProvider(providers, APP_FILTER, (provider) => provider.useClass === LoggerExceptionFilter),
  ).toBe(true);
  expect(exportsList.includes(LOGGER_MODULE_OPTIONS)).toBe(true);
  expect(exportsList.includes(CorrelationIdMiddleware)).toBe(true);
  expect(exportsList.includes(FrigdictLoggerService)).toBe(true);
});

test('CommonLoggerModule.forRootAsync exposes async logger DI contract', async () => {
  const dependencies = ['CONFIG_TOKEN'];
  const useFactory = async (config) => ({
    serviceName: createServiceName(`${config}-logger-service`),
  });

  const dynamicModule = CommonLoggerModule.forRootAsync({
    inject: dependencies,
    useFactory,
  });
  const providers = dynamicModule.providers ?? [];
  const exportsList = dynamicModule.exports ?? [];

  expect(dynamicModule.module).toBe(CommonLoggerModule);
  expect(dynamicModule.global).toBe(true);
  expect(dynamicModule.imports?.length).toBeGreaterThan(0);
  expect(
    hasProvider(
      providers,
      LOGGER_MODULE_OPTIONS,
      (provider) => provider.useFactory === useFactory && provider.inject === dependencies,
    ),
  ).toBe(true);
  expect(hasProvider(providers, CorrelationIdMiddleware)).toBe(true);
  expect(hasProvider(providers, FrigdictLoggerService)).toBe(true);
  expect(exportsList.includes(LOGGER_MODULE_OPTIONS)).toBe(true);
  expect(exportsList.includes(CorrelationIdMiddleware)).toBe(true);

  const optionsProvider = providers.find((provider) => provider?.provide === LOGGER_MODULE_OPTIONS);
  const resolvedOptions = await optionsProvider.useFactory('CONFIG_TOKEN');

  expect(resolvedOptions.serviceName).toBe('CONFIG_TOKEN-logger-service');
});
