import { loadEnv } from '@frigdict/bootstrap';
import { FrigdictLoggerService, Logger } from '@frigdict/logger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

loadEnv();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  const logger = app.get(FrigdictLoggerService);
  logger.setContext('Bootstrap');
  logger.info('HTTP server listening', { port: Number(port) });
}

bootstrap();
