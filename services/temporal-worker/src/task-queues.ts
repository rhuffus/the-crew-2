export const TASK_QUEUES = {
  BOOTSTRAP: 'bootstrap',
  DOCUMENTS: 'documents',
  GROWTH: 'growth',
  AGENT_EXECUTION: 'agent-execution',
} as const

export type TaskQueue = (typeof TASK_QUEUES)[keyof typeof TASK_QUEUES]

export const ALL_TASK_QUEUES: readonly TaskQueue[] = Object.values(TASK_QUEUES)
