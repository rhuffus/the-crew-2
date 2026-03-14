import { describe, it, expect, beforeEach, vi } from 'vitest'
import { StreamPublisher } from '../stream-publisher'
import type { StreamEnvelope } from '../stream-envelope'

function createMockRedis() {
  return {
    xadd: vi.fn().mockResolvedValue('1234567890-0'),
    pipeline: vi.fn().mockReturnValue({
      xadd: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([
        [null, '1-0'],
        [null, '2-0'],
      ]),
    }),
  }
}

function makeEnvelope(overrides: Partial<StreamEnvelope> = {}): StreamEnvelope {
  return {
    eventId: 'evt-1',
    eventType: 'ProjectCreated',
    aggregateId: 'proj-1',
    serviceName: 'platform',
    timestamp: '2026-01-01T00:00:00.000Z',
    version: 1,
    payload: { name: 'Test' },
    ...overrides,
  }
}

describe('StreamPublisher', () => {
  let publisher: StreamPublisher
  let mockRedis: ReturnType<typeof createMockRedis>

  beforeEach(() => {
    mockRedis = createMockRedis()
    publisher = new StreamPublisher(mockRedis as never)
  })

  describe('publish', () => {
    it('should XADD event fields to stream', async () => {
      const envelope = makeEnvelope()
      const result = await publisher.publish('stream:platform:events', envelope)

      expect(result).toBe('1234567890-0')
      expect(mockRedis.xadd).toHaveBeenCalledWith(
        'stream:platform:events',
        '*',
        'eventId', 'evt-1',
        'eventType', 'ProjectCreated',
        'aggregateId', 'proj-1',
        'serviceName', 'platform',
        'timestamp', '2026-01-01T00:00:00.000Z',
        'version', '1',
        'payload', '{"name":"Test"}',
      )
    })

    it('should include correlationId when present', async () => {
      const envelope = makeEnvelope({ correlationId: 'corr-42' })
      await publisher.publish('stream:test', envelope)

      expect(mockRedis.xadd).toHaveBeenCalledWith(
        'stream:test',
        '*',
        'eventId', 'evt-1',
        'eventType', 'ProjectCreated',
        'aggregateId', 'proj-1',
        'serviceName', 'platform',
        'timestamp', '2026-01-01T00:00:00.000Z',
        'version', '1',
        'payload', '{"name":"Test"}',
        'correlationId', 'corr-42',
      )
    })
  })

  describe('publishBatch', () => {
    it('should pipeline multiple XADDs', async () => {
      const e1 = makeEnvelope({ eventId: 'e1' })
      const e2 = makeEnvelope({ eventId: 'e2' })

      const ids = await publisher.publishBatch('stream:test', [e1, e2])

      expect(ids).toEqual(['1-0', '2-0'])
      expect(mockRedis.pipeline).toHaveBeenCalled()
    })

    it('should throw if pipeline returns error', async () => {
      mockRedis.pipeline.mockReturnValue({
        xadd: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([
          [new Error('NOSCRIPT'), null],
        ]),
      })

      await expect(
        publisher.publishBatch('stream:test', [makeEnvelope()]),
      ).rejects.toThrow('NOSCRIPT')
    })
  })
})
