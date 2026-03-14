import { describe, it, expect, vi } from 'vitest'

// Mock @prisma/client before importing the module
vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    _datasources: unknown
    constructor(opts?: { datasources?: unknown }) {
      this._datasources = opts?.datasources
    }
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { Test } from '@nestjs/testing'
import { PrismaModule } from '../prisma.module'
import { PrismaBaseService } from '../prisma-base.service'
import { PRISMA_CLIENT } from '../prisma.constants'

describe('PrismaModule', () => {
  describe('forRoot()', () => {
    it('should provide PrismaBaseService', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [PrismaModule.forRoot()],
      }).compile()

      const service = moduleRef.get(PrismaBaseService)
      expect(service).toBeDefined()
      expect(service).toBeInstanceOf(PrismaBaseService)

      await moduleRef.close()
    })

    it('should provide PRISMA_CLIENT token pointing to the same instance', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [PrismaModule.forRoot()],
      }).compile()

      const service = moduleRef.get(PrismaBaseService)
      const client = moduleRef.get(PRISMA_CLIENT)
      expect(client).toBe(service)

      await moduleRef.close()
    })

    it('should accept a custom url', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [PrismaModule.forRoot({ url: 'postgresql://localhost:5432/test' })],
      }).compile()

      const service = moduleRef.get(PrismaBaseService)
      expect(service).toBeDefined()
      // The mock stores datasources so we can verify it was passed
      expect((service as unknown as { _datasources: unknown })._datasources).toEqual({
        db: { url: 'postgresql://localhost:5432/test' },
      })

      await moduleRef.close()
    })

    it('should be global', async () => {
      const dynamicModule = PrismaModule.forRoot()
      expect(dynamicModule.global).toBe(true)
    })
  })
})
