import { type DynamicModule, Global, Module } from '@nestjs/common'
import { DiscoveryModule } from '@nestjs/core'
import Redis from 'ioredis'
import { REDIS_STREAMS_CLIENT, REDIS_STREAMS_OPTIONS } from './redis-streams.constants'
import { StreamPublisher } from './stream-publisher'
import { StreamConsumer, type RedisStreamsModuleOptions } from './stream-consumer'

@Global()
@Module({})
export class RedisStreamsModule {
  static forRoot(options: RedisStreamsModuleOptions): DynamicModule {
    return {
      module: RedisStreamsModule,
      imports: [DiscoveryModule],
      providers: [
        {
          provide: REDIS_STREAMS_OPTIONS,
          useValue: options,
        },
        {
          provide: REDIS_STREAMS_CLIENT,
          useFactory: () => new Redis(options.url),
        },
        StreamPublisher,
        StreamConsumer,
      ],
      exports: [REDIS_STREAMS_CLIENT, StreamPublisher, StreamConsumer],
      global: true,
    }
  }
}
