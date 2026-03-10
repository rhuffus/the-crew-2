import { Entity } from './entity.js'
import type { DomainEvent } from './domain-event.js'

export abstract class AggregateRoot<TId> extends Entity<TId> {
  private _domainEvents: DomainEvent[] = []

  get domainEvents(): ReadonlyArray<DomainEvent> {
    return [...this._domainEvents]
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event)
  }

  clearEvents(): void {
    this._domainEvents = []
  }
}
