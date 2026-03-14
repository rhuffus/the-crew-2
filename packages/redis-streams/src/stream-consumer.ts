import {
  Inject,
  Injectable,
  Logger,
  type OnModuleInit,
  type OnModuleDestroy,
} from '@nestjs/common'
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core'
import type Redis from 'ioredis'
import { REDIS_STREAMS_CLIENT, REDIS_STREAMS_OPTIONS, STREAM_EVENT_HANDLER } from './redis-streams.constants'
import type { StreamEnvelope } from './stream-envelope'
import type { StreamEventHandlerMetadata } from './on-stream-event.decorator'

export interface RedisStreamsModuleOptions {
  url: string
  consumerGroup: string
  serviceName: string
  blockTimeMs?: number
  batchSize?: number
}

type HandlerFn = (envelope: StreamEnvelope) => Promise<void>

interface StreamHandler {
  stream: string
  eventType: string
  handler: HandlerFn
}

@Injectable()
export class StreamConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(StreamConsumer.name)
  private readonly handlers = new Map<string, StreamHandler[]>()
  private running = false
  private pollPromise: Promise<void> | null = null

  constructor(
    @Inject(REDIS_STREAMS_CLIENT) private readonly redis: Redis,
    @Inject(REDIS_STREAMS_OPTIONS) private readonly options: RedisStreamsModuleOptions,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  async onModuleInit(): Promise<void> {
    this.discoverHandlers()
    await this.ensureConsumerGroups()
    this.start()
  }

  async onModuleDestroy(): Promise<void> {
    this.stop()
    if (this.pollPromise) {
      await this.pollPromise
    }
  }

  private discoverHandlers(): void {
    const wrappers = this.discoveryService.getProviders()

    for (const wrapper of wrappers) {
      const { instance } = wrapper
      if (!instance || typeof instance !== 'object') continue

      const prototype = Object.getPrototypeOf(instance) as object
      const methodNames = this.metadataScanner.getAllMethodNames(prototype)

      for (const methodName of methodNames) {
        const meta = this.reflector.get<StreamEventHandlerMetadata | undefined>(
          STREAM_EVENT_HANDLER,
          (instance as Record<string, unknown>)[methodName] as () => void,
        )

        if (!meta) continue

        const key = meta.stream
        const existing = this.handlers.get(key) ?? []
        existing.push({
          stream: meta.stream,
          eventType: meta.eventType,
          handler: ((instance as Record<string, (...args: unknown[]) => Promise<void>>)[methodName] as HandlerFn).bind(instance),
        })
        this.handlers.set(key, existing)

        this.logger.log(
          `Registered handler for ${meta.eventType} on ${meta.stream}`,
        )
      }
    }
  }

  private async ensureConsumerGroups(): Promise<void> {
    for (const stream of this.handlers.keys()) {
      try {
        await this.redis.xgroup(
          'CREATE',
          stream,
          this.options.consumerGroup,
          '0',
          'MKSTREAM',
        )
        this.logger.log(
          `Created consumer group ${this.options.consumerGroup} on ${stream}`,
        )
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        if (message.includes('BUSYGROUP')) {
          this.logger.debug(
            `Consumer group ${this.options.consumerGroup} already exists on ${stream}`,
          )
        } else {
          throw err
        }
      }
    }
  }

  start(): void {
    if (this.running) return
    this.running = true
    this.pollPromise = this.poll()
  }

  stop(): void {
    this.running = false
  }

  private async poll(): Promise<void> {
    const blockTime = this.options.blockTimeMs ?? 2000
    const batchSize = this.options.batchSize ?? 10
    const consumerName = this.options.serviceName
    const streams = Array.from(this.handlers.keys())

    if (streams.length === 0) return

    while (this.running) {
      try {
        const results = await (this.redis as unknown as {
          xreadgroup(
            ...args: string[]
          ): Promise<[string, [string, string[]][]][] | null>
        }).xreadgroup(
          'GROUP', this.options.consumerGroup, consumerName,
          'COUNT', String(batchSize),
          'BLOCK', String(blockTime),
          'STREAMS', ...streams,
          ...streams.map(() => '>'),
        )

        if (!results) continue

        for (const [stream, messages] of results as [string, [string, string[]][]][]) {
          const streamHandlers = this.handlers.get(stream)
          if (!streamHandlers) continue

          for (const [messageId, fields] of messages) {
            const envelope = this.parseFields(fields)
            if (!envelope) {
              this.logger.warn(`Malformed message ${messageId} on ${stream}`)
              await this.redis.xack(stream, this.options.consumerGroup, messageId)
              continue
            }

            const matchingHandlers = streamHandlers.filter(
              h => h.eventType === '*' || h.eventType === envelope.eventType,
            )

            for (const { handler } of matchingHandlers) {
              try {
                await handler(envelope)
              } catch (err) {
                this.logger.error(
                  `Handler error for ${envelope.eventType} on ${stream}: ${err instanceof Error ? err.message : String(err)}`,
                )
              }
            }

            await this.redis.xack(stream, this.options.consumerGroup, messageId)
          }
        }
      } catch (err) {
        if (this.running) {
          this.logger.error(
            `Poll error: ${err instanceof Error ? err.message : String(err)}`,
          )
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }
  }

  private parseFields(fields: string[]): StreamEnvelope | null {
    const map = new Map<string, string>()
    for (let i = 0; i < fields.length; i += 2) {
      map.set(fields[i]!, fields[i + 1]!)
    }

    const eventId = map.get('eventId')
    const eventType = map.get('eventType')
    const aggregateId = map.get('aggregateId')
    const serviceName = map.get('serviceName')
    const timestamp = map.get('timestamp')
    const versionStr = map.get('version')
    const payloadStr = map.get('payload')

    if (!eventId || !eventType || !aggregateId || !serviceName || !timestamp || !versionStr || !payloadStr) {
      return null
    }

    try {
      return {
        eventId,
        eventType,
        aggregateId,
        serviceName,
        timestamp,
        version: parseInt(versionStr, 10),
        correlationId: map.get('correlationId'),
        payload: JSON.parse(payloadStr) as Record<string, unknown>,
      }
    } catch {
      return null
    }
  }
}
