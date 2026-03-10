import { describe, it, expect, beforeEach } from 'vitest'
import { ContractsController } from './contracts.controller'
import { ContractService } from './application/contract.service'
import { InMemoryContractRepository } from './infra/in-memory-contract.repository'

const baseDto = {
  name: 'Interface Contract',
  description: 'API contract',
  type: 'InterfaceContract' as const,
  providerId: 'c1',
  providerType: 'capability' as const,
  consumerId: 'c2',
  consumerType: 'capability' as const,
}

describe('ContractsController', () => {
  let controller: ContractsController

  beforeEach(() => {
    const repo = new InMemoryContractRepository()
    const service = new ContractService(repo)
    controller = new ContractsController(service)
  })

  it('should list empty contracts', async () => {
    expect(await controller.list('p1')).toEqual([])
  })

  it('should create and list', async () => {
    await controller.create('p1', baseDto)
    const result = await controller.list('p1')
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('Interface Contract')
  })

  it('should get a contract', async () => {
    const created = await controller.create('p1', baseDto)
    const found = await controller.get(created.id)
    expect(found.name).toBe('Interface Contract')
  })

  it('should update a contract', async () => {
    const created = await controller.create('p1', baseDto)
    const updated = await controller.update(created.id, { name: 'Updated' })
    expect(updated.name).toBe('Updated')
  })

  it('should delete a contract', async () => {
    const created = await controller.create('p1', baseDto)
    await controller.remove(created.id)
    expect(await controller.list('p1')).toHaveLength(0)
  })
})
