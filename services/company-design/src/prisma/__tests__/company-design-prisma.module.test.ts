import { describe, it, expect, vi } from 'vitest'

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
import { CompanyDesignPrismaModule } from '../company-design-prisma.module'
import { CompanyDesignPrismaService } from '../company-design-prisma.service'

describe('CompanyDesignPrismaModule', () => {
  describe('forRoot()', () => {
    it('should provide CompanyDesignPrismaService', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [CompanyDesignPrismaModule.forRoot()],
      }).compile()

      const service = moduleRef.get(CompanyDesignPrismaService)
      expect(service).toBeDefined()
      expect(service).toBeInstanceOf(CompanyDesignPrismaService)

      await moduleRef.close()
    })

    it('should accept a custom url', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          CompanyDesignPrismaModule.forRoot({
            url: 'postgresql://localhost:5432/company_design',
          }),
        ],
      }).compile()

      const service = moduleRef.get(CompanyDesignPrismaService)
      expect(service).toBeDefined()
      expect(
        (service as unknown as { _datasources: unknown })._datasources,
      ).toEqual({
        db: { url: 'postgresql://localhost:5432/company_design' },
      })

      await moduleRef.close()
    })

    it('should be global', () => {
      const dynamicModule = CompanyDesignPrismaModule.forRoot()
      expect(dynamicModule.global).toBe(true)
    })

    it('should export CompanyDesignPrismaService', () => {
      const dynamicModule = CompanyDesignPrismaModule.forRoot()
      expect(dynamicModule.exports).toContain(CompanyDesignPrismaService)
    })
  })
})
