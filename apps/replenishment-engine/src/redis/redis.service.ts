import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;

  onModuleInit() {
    const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
    this.client = new Redis(url, { maxRetriesPerRequest: 3 });
  }

  onModuleDestroy() {
    this.client?.disconnect();
    this.client = null;
  }

  getClient(): Redis {
    if (!this.client) throw new Error('Redis not connected');
    return this.client;
  }
}
