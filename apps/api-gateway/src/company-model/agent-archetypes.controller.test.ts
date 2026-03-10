import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AgentArchetypesController } from './agent-archetypes.controller'
import type { CompanyDesignClient } from './company-design.client'

const mockClient = {
  listAgentArchetypes: vi.fn(),
  getAgentArchetype: vi.fn(),
  createAgentArchetype: vi.fn(),
  updateAgentArchetype: vi.fn(),
  deleteAgentArchetype: vi.fn(),
}

describe('AgentArchetypesController (gateway)', () => {
  let controller: AgentArchetypesController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new AgentArchetypesController(mockClient as unknown as CompanyDesignClient)
  })

  it('should list agent archetypes', async () => {
    mockClient.listAgentArchetypes.mockResolvedValue([{ id: '1', name: 'Bot' }])
    const result = await controller.list('p1')
    expect(result).toEqual([{ id: '1', name: 'Bot' }])
    expect(mockClient.listAgentArchetypes).toHaveBeenCalledWith('p1')
  })

  it('should get an agent archetype', async () => {
    mockClient.getAgentArchetype.mockResolvedValue({ id: '1', name: 'Bot' })
    const result = await controller.get('1', 'p1')
    expect(result).toEqual({ id: '1', name: 'Bot' })
  })

  it('should create an agent archetype', async () => {
    const dto = { name: 'Bot', description: 'A bot', roleId: 'r1', departmentId: 'd1' }
    mockClient.createAgentArchetype.mockResolvedValue({ id: '1', ...dto })
    const result = await controller.create('p1', dto)
    expect(result).toEqual({ id: '1', ...dto })
  })

  it('should update an agent archetype', async () => {
    mockClient.updateAgentArchetype.mockResolvedValue({ id: '1', name: 'Updated' })
    const result = await controller.update('1', 'p1', { name: 'Updated' })
    expect(result).toEqual({ id: '1', name: 'Updated' })
  })

  it('should delete an agent archetype', async () => {
    mockClient.deleteAgentArchetype.mockResolvedValue(undefined)
    await controller.remove('1', 'p1')
    expect(mockClient.deleteAgentArchetype).toHaveBeenCalledWith('1', 'p1')
  })
})
