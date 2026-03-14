import { describe, it, expect } from 'vitest'
import 'reflect-metadata'
import { STREAM_EVENT_HANDLER } from '../redis-streams.constants'
import { OnStreamEvent } from '../on-stream-event.decorator'

describe('OnStreamEvent decorator', () => {
  it('should set metadata with stream and eventType', () => {
    class TestHandler {
      @OnStreamEvent('stream:platform:events', 'ProjectCreated')
      async handleProjectCreated(): Promise<void> {
        // noop
      }
    }

    const handler = new TestHandler()
    const meta = Reflect.getMetadata(
      STREAM_EVENT_HANDLER,
      handler.handleProjectCreated,
    )

    expect(meta).toEqual({
      stream: 'stream:platform:events',
      eventType: 'ProjectCreated',
    })
  })

  it('should support wildcard event type', () => {
    class TestHandler {
      @OnStreamEvent('stream:all', '*')
      async handleAll(): Promise<void> {
        // noop
      }
    }

    const handler = new TestHandler()
    const meta = Reflect.getMetadata(
      STREAM_EVENT_HANDLER,
      handler.handleAll,
    )

    expect(meta).toEqual({
      stream: 'stream:all',
      eventType: '*',
    })
  })
})
