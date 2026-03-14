import { describe, it, expect, vi } from 'vitest'

vi.mock('@temporalio/client', () => {
  const mockConnection = { close: vi.fn() }
  const mockClient = { connection: mockConnection }
  return {
    Connection: {
      connect: vi.fn().mockResolvedValue(mockConnection),
    },
    WorkflowClient: vi.fn().mockImplementation(() => mockClient),
  }
})

import { TEMPORAL_WORKFLOW_CLIENT } from './temporal-client.module'

describe('TemporalClientModule', () => {
  it('should export TEMPORAL_WORKFLOW_CLIENT token', () => {
    expect(TEMPORAL_WORKFLOW_CLIENT).toBeDefined()
    expect(typeof TEMPORAL_WORKFLOW_CLIENT).toBe('symbol')
    expect(TEMPORAL_WORKFLOW_CLIENT.toString()).toContain('TEMPORAL_WORKFLOW_CLIENT')
  })
})
