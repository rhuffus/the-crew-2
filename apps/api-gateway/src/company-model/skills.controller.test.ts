import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SkillsController } from './skills.controller'
import type { CompanyDesignClient } from './company-design.client'

const mockClient = {
  listSkills: vi.fn(),
  getSkill: vi.fn(),
  createSkill: vi.fn(),
  updateSkill: vi.fn(),
  deleteSkill: vi.fn(),
}

describe('SkillsController (gateway)', () => {
  let controller: SkillsController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new SkillsController(mockClient as unknown as CompanyDesignClient)
  })

  it('should list skills', async () => {
    mockClient.listSkills.mockResolvedValue([{ id: '1', name: 'Deploy' }])
    const result = await controller.list('p1')
    expect(result).toEqual([{ id: '1', name: 'Deploy' }])
    expect(mockClient.listSkills).toHaveBeenCalledWith('p1')
  })

  it('should get a skill', async () => {
    mockClient.getSkill.mockResolvedValue({ id: '1', name: 'Deploy' })
    const result = await controller.get('1', 'p1')
    expect(result).toEqual({ id: '1', name: 'Deploy' })
  })

  it('should create a skill', async () => {
    const dto = { name: 'Deploy', description: 'Deploys', category: 'DevOps' }
    mockClient.createSkill.mockResolvedValue({ id: '1', ...dto })
    const result = await controller.create('p1', dto)
    expect(result).toEqual({ id: '1', ...dto })
  })

  it('should update a skill', async () => {
    mockClient.updateSkill.mockResolvedValue({ id: '1', name: 'Updated' })
    const result = await controller.update('1', 'p1', { name: 'Updated' })
    expect(result).toEqual({ id: '1', name: 'Updated' })
  })

  it('should delete a skill', async () => {
    mockClient.deleteSkill.mockResolvedValue(undefined)
    await controller.remove('1', 'p1')
    expect(mockClient.deleteSkill).toHaveBeenCalledWith('1', 'p1')
  })
})
