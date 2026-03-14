import { describe, it, expect } from 'vitest'
import { createEnvelope, type StreamEnvelope } from '../stream-envelope'

describe('StreamEnvelope', () => {
  it('should create an envelope with auto-generated eventId and timestamp', () => {
    const envelope = createEnvelope({
      eventType: 'ProjectCreated',
      aggregateId: 'proj-1',
      serviceName: 'platform',
      version: 1,
      payload: { name: 'Test' },
    })

    expect(envelope.eventId).toBeDefined()
    expect(envelope.eventId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    )
    expect(envelope.timestamp).toBeDefined()
    expect(new Date(envelope.timestamp).getTime()).not.toBeNaN()
    expect(envelope.eventType).toBe('ProjectCreated')
    expect(envelope.aggregateId).toBe('proj-1')
    expect(envelope.serviceName).toBe('platform')
    expect(envelope.version).toBe(1)
    expect(envelope.payload).toEqual({ name: 'Test' })
    expect(envelope.correlationId).toBeUndefined()
  })

  it('should include correlationId when provided', () => {
    const envelope = createEnvelope({
      eventType: 'ProjectCreated',
      aggregateId: 'proj-1',
      serviceName: 'platform',
      version: 1,
      correlationId: 'corr-123',
      payload: {},
    })

    expect(envelope.correlationId).toBe('corr-123')
  })

  it('should generate unique eventIds', () => {
    const e1 = createEnvelope({
      eventType: 'A',
      aggregateId: '1',
      serviceName: 's',
      version: 1,
      payload: {},
    })
    const e2 = createEnvelope({
      eventType: 'A',
      aggregateId: '1',
      serviceName: 's',
      version: 1,
      payload: {},
    })
    expect(e1.eventId).not.toBe(e2.eventId)
  })

  it('should satisfy the StreamEnvelope type', () => {
    const envelope: StreamEnvelope<{ name: string }> = createEnvelope({
      eventType: 'Test',
      aggregateId: '1',
      serviceName: 'test',
      version: 1,
      payload: { name: 'value' },
    })
    expect(envelope.payload.name).toBe('value')
  })
})
