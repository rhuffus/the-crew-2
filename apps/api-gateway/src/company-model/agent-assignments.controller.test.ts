import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AgentAssignmentsController } from './agent-assignments.controller'
import type { CompanyDesignClient } from './company-design.client'

const mockClient = {
  listAgentAssignments: vi.fn(),
  getAgentAssignment: vi.fn(),
  createAgentAssignment: vi.fn(),
  updateAgentAssignment: vi.fn(),
  deleteAgentAssignment: vi.fn(),
}

describe('AgentAssignmentsController (gateway)', () => {
  let controller: AgentAssignmentsController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new AgentAssignmentsController(mockClient as unknown as CompanyDesignClient)
  })

  it('should list agent assignments', async () => {
    mockClient.listAgentAssignments.mockResolvedValue([{ id: '1', name: 'Primary' }])
    const result = await controller.list('p1')
    expect(result).toEqual([{ id: '1', name: 'Primary' }])
    expect(mockClient.listAgentAssignments).toHaveBeenCalledWith('p1')
  })

  it('should get an agent assignment', async () => {
    mockClient.getAgentAssignment.mockResolvedValue({ id: '1', name: 'Primary' })
    const result = await controller.get('1', 'p1')
    expect(result).toEqual({ id: '1', name: 'Primary' })
  })

  it('should create an agent assignment', async () => {
    const dto = { archetypeId: 'a1', name: 'Deployer' }
    mockClient.createAgentAssignment.mockResolvedValue({ id: '1', ...dto })
    const result = await controller.create('p1', dto)
    expect(result).toEqual({ id: '1', ...dto })
  })

  it('should update an agent assignment', async () => {
    mockClient.updateAgentAssignment.mockResolvedValue({ id: '1', name: 'Updated' })
    const result = await controller.update('1', 'p1', { name: 'Updated' })
    expect(result).toEqual({ id: '1', name: 'Updated' })
  })

  it('should delete an agent assignment', async () => {
    mockClient.deleteAgentAssignment.mockResolvedValue(undefined)
    await controller.remove('1', 'p1')
    expect(mockClient.deleteAgentAssignment).toHaveBeenCalledWith('1', 'p1')
  })
})
