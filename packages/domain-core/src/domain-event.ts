export interface DomainEvent {
  readonly eventType: string
  readonly occurredOn: Date
  readonly aggregateId: string
  readonly payload: Record<string, unknown>
}
