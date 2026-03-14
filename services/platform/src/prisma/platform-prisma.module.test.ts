import { describe, it, expect, vi } from 'vitest'

vi.mock('.prisma/platform-client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { Test } from '@nestjs/testing'
import { PlatformPrismaModule } from './platform-prisma.module'
import { PlatformPrismaService } from './platform-prisma.service'

describe('PlatformPrismaModule', () => {
  it('should provide PlatformPrismaService', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PlatformPrismaModule],
    }).compile()

    const service = moduleRef.get(PlatformPrismaService)
    expect(service).toBeDefined()
    expect(service).toBeInstanceOf(PlatformPrismaService)

    await moduleRef.close()
  })

  it('should be global', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PlatformPrismaModule],
    }).compile()

    // If it's global, we can get it from any module without importing
    const service = moduleRef.get(PlatformPrismaService)
    expect(service).toBeDefined()

    await moduleRef.close()
  })
})
