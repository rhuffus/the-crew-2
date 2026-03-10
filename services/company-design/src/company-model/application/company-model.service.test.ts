import { describe, it, expect, beforeEach } from 'vitest'
import { CompanyModelService } from './company-model.service'
import { InMemoryCompanyModelRepository } from '../infra/in-memory-company-model.repository'

describe('CompanyModelService', () => {
  let service: CompanyModelService

  beforeEach(() => {
    const repo = new InMemoryCompanyModelRepository()
    service = new CompanyModelService(repo)
  })

  it('should return an empty model for a new project', async () => {
    const result = await service.get('proj-1')
    expect(result.projectId).toBe('proj-1')
    expect(result.purpose).toBe('')
    expect(result.type).toBe('')
    expect(result.scope).toBe('')
    expect(result.principles).toEqual([])
  })

  it('should auto-create model on first get', async () => {
    const first = await service.get('proj-1')
    const second = await service.get('proj-1')
    expect(first.projectId).toBe(second.projectId)
  })

  it('should update purpose and type', async () => {
    const updated = await service.update('proj-1', { purpose: 'Build great products', type: 'SaaS' })
    expect(updated.purpose).toBe('Build great products')
    expect(updated.type).toBe('SaaS')
  })

  it('should update principles', async () => {
    const updated = await service.update('proj-1', {
      principles: ['Quality first', 'Move fast'],
    })
    expect(updated.principles).toEqual(['Quality first', 'Move fast'])
  })

  it('should preserve existing fields on partial update', async () => {
    await service.update('proj-1', { purpose: 'Build', type: 'B2B' })
    const updated = await service.update('proj-1', { scope: 'EMEA' })
    expect(updated.purpose).toBe('Build')
    expect(updated.type).toBe('B2B')
    expect(updated.scope).toBe('EMEA')
  })

  it('should create model on update if not exists', async () => {
    const result = await service.update('new-proj', { purpose: 'Test' })
    expect(result.projectId).toBe('new-proj')
    expect(result.purpose).toBe('Test')
  })
})
