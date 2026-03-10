import { describe, it, expect } from 'vitest'
import { AggregateRoot } from '../aggregate-root.js'
import type { DomainEvent } from '../domain-event.js'

class TestAggregate extends AggregateRoot<string> {
  constructor(id: string) {
    super(id)
  }

  doSomething(): void {
    this.addDomainEvent({
      eventType: 'TestHappened',
      occurredOn: new Date(),
      aggregateId: this.id,
      payload: { action: 'test' },
    })
  }
}

describe('AggregateRoot', () => {
  it('should start with no domain events', () => {
    const aggregate = new TestAggregate('1')
    expect(aggregate.domainEvents).toHaveLength(0)
  })

  it('should accumulate domain events', () => {
    const aggregate = new TestAggregate('1')
    aggregate.doSomething()
    aggregate.doSomething()
    expect(aggregate.domainEvents).toHaveLength(2)
    expect(aggregate.domainEvents[0]!.eventType).toBe('TestHappened')
  })

  it('should clear events', () => {
    const aggregate = new TestAggregate('1')
    aggregate.doSomething()
    aggregate.clearEvents()
    expect(aggregate.domainEvents).toHaveLength(0)
  })

  it('should return a defensive copy of events', () => {
    const aggregate = new TestAggregate('1')
    aggregate.doSomething()
    const events = aggregate.domainEvents as DomainEvent[]
    events.push({
      eventType: 'Hack',
      occurredOn: new Date(),
      aggregateId: '1',
      payload: {},
    })
    expect(aggregate.domainEvents).toHaveLength(1)
  })
})
