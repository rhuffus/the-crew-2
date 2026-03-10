import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WorkflowsController } from './workflows.controller'
import type { CompanyDesignClient } from './company-design.client'

const mockClient = {
  listWorkflows: vi.fn(),
  getWorkflow: vi.fn(),
  createWorkflow: vi.fn(),
  updateWorkflow: vi.fn(),
  deleteWorkflow: vi.fn(),
}

describe('WorkflowsController (gateway)', () => {
  let controller: WorkflowsController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new WorkflowsController(mockClient as unknown as CompanyDesignClient)
  })

  it('should list workflows', async () => {
    mockClient.listWorkflows.mockResolvedValue([{ id: '1', name: 'Onboarding' }])
    const result = await controller.list('p1')
    expect(result).toEqual([{ id: '1', name: 'Onboarding' }])
    expect(mockClient.listWorkflows).toHaveBeenCalledWith('p1')
  })

  it('should get a workflow', async () => {
    mockClient.getWorkflow.mockResolvedValue({ id: '1', name: 'Onboarding' })
    const result = await controller.get('1', 'p1')
    expect(result).toEqual({ id: '1', name: 'Onboarding' })
  })

  it('should create a workflow', async () => {
    const dto = { name: 'Deploy Pipeline', description: 'CI/CD' }
    mockClient.createWorkflow.mockResolvedValue({ id: '1', ...dto })
    const result = await controller.create('p1', dto)
    expect(result).toEqual({ id: '1', ...dto })
  })

  it('should update a workflow', async () => {
    mockClient.updateWorkflow.mockResolvedValue({ id: '1', name: 'Updated' })
    const result = await controller.update('1', 'p1', { name: 'Updated' })
    expect(result).toEqual({ id: '1', name: 'Updated' })
  })

  it('should delete a workflow', async () => {
    mockClient.deleteWorkflow.mockResolvedValue(undefined)
    await controller.remove('1', 'p1')
    expect(mockClient.deleteWorkflow).toHaveBeenCalledWith('1', 'p1')
  })
})
