import { describe, it, expect, beforeEach } from 'vitest'
import { CompanyModelController } from './company-model.controller'
import { CompanyModelService } from './application/company-model.service'
import { InMemoryCompanyModelRepository } from './infra/in-memory-company-model.repository'

describe('CompanyModelController', () => {
  let controller: CompanyModelController

  beforeEach(() => {
    const repo = new InMemoryCompanyModelRepository()
    const service = new CompanyModelService(repo)
    controller = new CompanyModelController(service)
  })

  it('should get an empty company model', async () => {
    const result = await controller.get('proj-1')
    expect(result.projectId).toBe('proj-1')
    expect(result.purpose).toBe('')
  })

  it('should update company model', async () => {
    const result = await controller.update('proj-1', {
      purpose: 'Build products',
      type: 'SaaS',
    })
    expect(result.purpose).toBe('Build products')
    expect(result.type).toBe('SaaS')
  })

  it('should get updated model after update', async () => {
    await controller.update('proj-1', { purpose: 'Test' })
    const result = await controller.get('proj-1')
    expect(result.purpose).toBe('Test')
  })
})
