import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProjectsController } from './projects.controller'
import type { PlatformClient } from './platform.client'

const mockClient = {
  listProjects: vi.fn(),
  getProject: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
}

describe('ProjectsController (gateway)', () => {
  let controller: ProjectsController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new ProjectsController(mockClient as unknown as PlatformClient)
  })

  it('should list projects', async () => {
    mockClient.listProjects.mockResolvedValue([{ id: '1', name: 'Test' }])
    const result = await controller.list()
    expect(result).toEqual([{ id: '1', name: 'Test' }])
    expect(mockClient.listProjects).toHaveBeenCalled()
  })

  it('should get a project', async () => {
    mockClient.getProject.mockResolvedValue({ id: '1', name: 'Test' })
    const result = await controller.get('1')
    expect(result).toEqual({ id: '1', name: 'Test' })
    expect(mockClient.getProject).toHaveBeenCalledWith('1')
  })

  it('should create a project', async () => {
    mockClient.createProject.mockResolvedValue({ id: '1', name: 'New' })
    const result = await controller.create({ name: 'New', description: '' })
    expect(result).toEqual({ id: '1', name: 'New' })
    expect(mockClient.createProject).toHaveBeenCalledWith({ name: 'New', description: '' })
  })

  it('should update a project', async () => {
    mockClient.updateProject.mockResolvedValue({ id: '1', name: 'Updated' })
    const result = await controller.update('1', { name: 'Updated' })
    expect(result).toEqual({ id: '1', name: 'Updated' })
    expect(mockClient.updateProject).toHaveBeenCalledWith('1', { name: 'Updated' })
  })
})
