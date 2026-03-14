import { describe, it, expect } from 'vitest'
import { TASK_QUEUES, ALL_TASK_QUEUES } from '../task-queues'

describe('task-queues', () => {
  it('should define all four required queues', () => {
    expect(TASK_QUEUES.BOOTSTRAP).toBe('bootstrap')
    expect(TASK_QUEUES.DOCUMENTS).toBe('documents')
    expect(TASK_QUEUES.GROWTH).toBe('growth')
    expect(TASK_QUEUES.AGENT_EXECUTION).toBe('agent-execution')
  })

  it('should have unique queue names', () => {
    const values = Object.values(TASK_QUEUES)
    const unique = new Set(values)
    expect(unique.size).toBe(values.length)
  })

  it('should export ALL_TASK_QUEUES with all values', () => {
    expect(ALL_TASK_QUEUES).toHaveLength(4)
    expect(ALL_TASK_QUEUES).toContain('bootstrap')
    expect(ALL_TASK_QUEUES).toContain('documents')
    expect(ALL_TASK_QUEUES).toContain('growth')
    expect(ALL_TASK_QUEUES).toContain('agent-execution')
  })
})
