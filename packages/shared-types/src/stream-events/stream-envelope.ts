export interface StreamEventEnvelope<T = Record<string, unknown>> {
  readonly eventId: string
  readonly eventType: string
  readonly aggregateId: string
  readonly serviceName: string
  readonly timestamp: string
  readonly version: number
  readonly correlationId?: string
  readonly payload: T
}
