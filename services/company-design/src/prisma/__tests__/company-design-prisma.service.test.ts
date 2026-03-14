import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { CompanyDesignPrismaService } from '../company-design-prisma.service'

describe('CompanyDesignPrismaService', () => {
  let service: CompanyDesignPrismaService

  beforeEach(() => {
    service = new CompanyDesignPrismaService()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should extend PrismaClient', () => {
    expect(service.$connect).toBeDefined()
    expect(service.$disconnect).toBeDefined()
  })

  describe('onModuleInit', () => {
    it('should call $connect', async () => {
      await service.onModuleInit()
      expect(service.$connect).toHaveBeenCalledOnce()
    })
  })

  describe('onModuleDestroy', () => {
    it('should call $disconnect', async () => {
      await service.onModuleDestroy()
      expect(service.$disconnect).toHaveBeenCalledOnce()
    })
  })
})
