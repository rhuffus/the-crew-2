import { describe, it, expect, beforeEach } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { ContractService } from './contract.service'
import { InMemoryContractRepository } from '../infra/in-memory-contract.repository'

const baseDto = {
  name: 'Data SLA',
  description: 'SLA between teams',
  type: 'SLA' as const,
  providerId: 'd1',
  providerType: 'department' as const,
  consumerId: 'd2',
  consumerType: 'department' as const,
}

describe('ContractService', () => {
  let service: ContractService

  beforeEach(() => {
    const repo = new InMemoryContractRepository()
    service = new ContractService(repo)
  })

  it('should list empty contracts', async () => {
    expect(await service.list('p1')).toEqual([])
  })

  it('should create a contract', async () => {
    const result = await service.create('p1', baseDto)
    expect(result.name).toBe('Data SLA')
    expect(result.projectId).toBe('p1')
    expect(result.status).toBe('draft')
  })

  it('should create with acceptance criteria', async () => {
    const result = await service.create('p1', {
      ...baseDto,
      acceptanceCriteria: ['99.9% uptime'],
    })
    expect(result.acceptanceCriteria).toEqual(['99.9% uptime'])
  })

  it('should list by project', async () => {
    await service.create('p1', baseDto)
    await service.create('p1', { ...baseDto, name: 'Another' })
    await service.create('p2', { ...baseDto, name: 'Other project' })
    expect(await service.list('p1')).toHaveLength(2)
  })

  it('should get by id', async () => {
    const created = await service.create('p1', baseDto)
    const found = await service.get(created.id)
    expect(found.name).toBe('Data SLA')
  })

  it('should throw on get unknown', async () => {
    await expect(service.get('x')).rejects.toThrow(NotFoundException)
  })

  it('should update', async () => {
    const created = await service.create('p1', baseDto)
    const updated = await service.update(created.id, {
      name: 'Updated SLA',
      status: 'active',
    })
    expect(updated.name).toBe('Updated SLA')
    expect(updated.status).toBe('active')
  })

  it('should throw on update unknown', async () => {
    await expect(service.update('x', { name: 'Y' })).rejects.toThrow(NotFoundException)
  })

  it('should remove', async () => {
    const created = await service.create('p1', baseDto)
    await service.remove(created.id)
    await expect(service.get(created.id)).rejects.toThrow(NotFoundException)
  })

  it('should throw on remove unknown', async () => {
    await expect(service.remove('x')).rejects.toThrow(NotFoundException)
  })
})
