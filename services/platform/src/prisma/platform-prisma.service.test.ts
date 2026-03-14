import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('.prisma/platform-client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PlatformPrismaService } from './platform-prisma.service'

describe('PlatformPrismaService', () => {
  let service: PlatformPrismaService

  beforeEach(() => {
    service = new PlatformPrismaService()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should have PrismaClient methods', () => {
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
