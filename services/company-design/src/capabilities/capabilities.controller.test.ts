import { describe, it, expect, beforeEach } from 'vitest'
import { CapabilitiesController } from './capabilities.controller'
import { CapabilityService } from './application/capability.service'
import { InMemoryCapabilityRepository } from './infra/in-memory-capability.repository'

describe('CapabilitiesController', () => {
  let controller: CapabilitiesController

  beforeEach(() => {
    const repo = new InMemoryCapabilityRepository()
    const service = new CapabilityService(repo)
    controller = new CapabilitiesController(service)
  })

  it('should list empty capabilities', async () => {
    expect(await controller.list('p1')).toEqual([])
  })

  it('should create and list', async () => {
    await controller.create('p1', { name: 'Billing', description: '' })
    const result = await controller.list('p1')
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('Billing')
  })

  it('should get a capability', async () => {
    const created = await controller.create('p1', { name: 'Auth', description: '' })
    const found = await controller.get(created.id)
    expect(found.name).toBe('Auth')
  })

  it('should update a capability', async () => {
    const created = await controller.create('p1', { name: 'Old', description: '' })
    const updated = await controller.update(created.id, { name: 'New' })
    expect(updated.name).toBe('New')
  })

  it('should delete a capability', async () => {
    const created = await controller.create('p1', { name: 'Temp', description: '' })
    await controller.remove(created.id)
    expect(await controller.list('p1')).toHaveLength(0)
  })
})
