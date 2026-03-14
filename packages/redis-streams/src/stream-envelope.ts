export interface StreamEnvelope<T = Record<string, unknown>> {
  readonly eventId: string
  readonly eventType: string
  readonly aggregateId: string
  readonly serviceName: string
  readonly timestamp: string
  readonly version: number
  readonly correlationId?: string
  readonly payload: T
}

export function createEnvelope<T>(
  params: Omit<StreamEnvelope<T>, 'eventId' | 'timestamp'>,
): StreamEnvelope<T> {
  return {
    eventId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...params,
  }
}
