import { Inject, Injectable, Logger } from '@nestjs/common'
import type Redis from 'ioredis'
import { REDIS_STREAMS_CLIENT } from './redis-streams.constants'
import type { StreamEnvelope } from './stream-envelope'

@Injectable()
export class StreamPublisher {
  private readonly logger = new Logger(StreamPublisher.name)

  constructor(
    @Inject(REDIS_STREAMS_CLIENT) private readonly redis: Redis,
  ) {}

  async publish<T>(
    stream: string,
    envelope: StreamEnvelope<T>,
  ): Promise<string> {
    const fields = [
      'eventId', envelope.eventId,
      'eventType', envelope.eventType,
      'aggregateId', envelope.aggregateId,
      'serviceName', envelope.serviceName,
      'timestamp', envelope.timestamp,
      'version', String(envelope.version),
      'payload', JSON.stringify(envelope.payload),
    ]

    if (envelope.correlationId) {
      fields.push('correlationId', envelope.correlationId)
    }

    const messageId = await this.redis.xadd(
      stream, '*',
      ...fields as [string, ...string[]],
    )

    this.logger.debug(
      `Published ${envelope.eventType} to ${stream} [${messageId}]`,
    )

    return messageId!
  }

  async publishBatch<T>(
    stream: string,
    envelopes: StreamEnvelope<T>[],
  ): Promise<string[]> {
    const pipeline = this.redis.pipeline()

    for (const envelope of envelopes) {
      const fields = [
        'eventId', envelope.eventId,
        'eventType', envelope.eventType,
        'aggregateId', envelope.aggregateId,
        'serviceName', envelope.serviceName,
        'timestamp', envelope.timestamp,
        'version', String(envelope.version),
        'payload', JSON.stringify(envelope.payload),
      ]
      if (envelope.correlationId) {
        fields.push('correlationId', envelope.correlationId)
      }
      pipeline.xadd(stream, '*', ...fields)
    }

    const results = await pipeline.exec()
    const ids: string[] = []

    if (results) {
      for (const [err, id] of results) {
        if (err) throw err
        ids.push(id as string)
      }
    }

    this.logger.debug(
      `Published batch of ${envelopes.length} events to ${stream}`,
    )

    return ids
  }
}
