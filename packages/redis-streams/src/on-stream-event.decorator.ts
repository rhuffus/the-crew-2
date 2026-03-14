import { SetMetadata } from '@nestjs/common'
import { STREAM_EVENT_HANDLER } from './redis-streams.constants'

export interface StreamEventHandlerMetadata {
  stream: string
  eventType: string
}

export const OnStreamEvent = (
  stream: string,
  eventType: string,
): MethodDecorator =>
  SetMetadata(STREAM_EVENT_HANDLER, { stream, eventType } satisfies StreamEventHandlerMetadata)
