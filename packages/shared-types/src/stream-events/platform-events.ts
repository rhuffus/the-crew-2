import type { StreamEventEnvelope } from './stream-envelope.js'

// --- Project events ---

export interface ProjectCreatedPayload {
  name: string
  description: string
  status: 'active' | 'archived'
}

export interface ProjectUpdatedPayload {
  name?: string
  description?: string
}

export interface ProjectArchivedPayload {
  previousStatus: string
}

// --- Execution events ---

export interface ExecutionCreatedPayload {
  projectId: string
  runMode: string
  taskType: string
}

export interface ExecutionStartedPayload {
  startedAt: string
}

export interface ExecutionCompletedPayload {
  completedAt: string
  resultStatus: string
}

export interface ExecutionFailedPayload {
  failedAt: string
  errorMessage: string
}

export interface ExecutionTimedOutPayload {
  timedOutAt: string
}

export interface ExecutionCancelledPayload {
  cancelledAt: string
}

export interface ExecutionRetryingPayload {
  retryCount: number
}

// --- Union type for all platform events ---

export type PlatformEventType =
  | 'ProjectCreated'
  | 'ProjectUpdated'
  | 'ProjectArchived'
  | 'ExecutionCreated'
  | 'ExecutionStarted'
  | 'ExecutionCompleted'
  | 'ExecutionFailed'
  | 'ExecutionTimedOut'
  | 'ExecutionCancelled'
  | 'ExecutionRetrying'

export type PlatformEventEnvelope =
  | StreamEventEnvelope<ProjectCreatedPayload>
  | StreamEventEnvelope<ProjectUpdatedPayload>
  | StreamEventEnvelope<ProjectArchivedPayload>
  | StreamEventEnvelope<ExecutionCreatedPayload>
  | StreamEventEnvelope<ExecutionStartedPayload>
  | StreamEventEnvelope<ExecutionCompletedPayload>
  | StreamEventEnvelope<ExecutionFailedPayload>
  | StreamEventEnvelope<ExecutionTimedOutPayload>
  | StreamEventEnvelope<ExecutionCancelledPayload>
  | StreamEventEnvelope<ExecutionRetryingPayload>
