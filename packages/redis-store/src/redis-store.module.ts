import { type DynamicModule, Global, Module } from '@nestjs/common'
import Redis from 'ioredis'
import { REDIS_STORE_CLIENT, REDIS_STORE_OPTIONS } from './redis-store.constants'

export interface RedisStoreModuleOptions {
  url: string
  dbIndex: number
  serviceName: string
}

@Global()
@Module({})
export class RedisStoreModule {
  static forRoot(options: RedisStoreModuleOptions): DynamicModule {
    return {
      module: RedisStoreModule,
      providers: [
        {
          provide: REDIS_STORE_OPTIONS,
          useValue: options,
        },
        {
          provide: REDIS_STORE_CLIENT,
          useFactory: () => new Redis(options.url, { db: options.dbIndex }),
        },
      ],
      exports: [REDIS_STORE_CLIENT, REDIS_STORE_OPTIONS],
      global: true,
    }
  }
}
