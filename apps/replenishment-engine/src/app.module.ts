import { CommonLoggerModule, CorrelationIdMiddleware, createServiceName } from '@frigdict/logger';
import { type MiddlewareConsumer, Module, type NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    CommonLoggerModule.forRoot({
      serviceName: createServiceName('replenishment-engine'),
    }),
    PrismaModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
