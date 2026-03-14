import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaOrganizationalUnitRepository } from './prisma-organizational-unit.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { OrganizationalUnit } from '../domain/organizational-unit'

interface MockDelegate {
  findUnique: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'organizationalUnit', {
    value: { findUnique: vi.fn(), findMany: vi.fn(), upsert: vi.fn(), delete: vi.fn() },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { organizationalUnit: MockDelegate }
}

const now = new Date('2026-01-01T00:00:00Z')
const sampleRow = {
  id: 'uo-1',
  projectId: 'proj-1',
  name: 'Engineering',
  description: 'Engineering department',
  uoType: 'department',
  mandate: 'Build product',
  purpose: 'Deliver features',
  parentUoId: null,
  coordinatorAgentId: 'agent-1',
  functions: ['development', 'testing'],
  status: 'active',
  createdAt: now,
  updatedAt: now,
}

describe('PrismaOrganizationalUnitRepository', () => {
  let repo: PrismaOrganizationalUnitRepository
  let prisma: CompanyDesignPrismaService & { organizationalUnit: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaOrganizationalUnitRepository(prisma)
  })

  it('findById returns domain entity', async () => {
    prisma.organizationalUnit.findUnique.mockResolvedValue(sampleRow)
    const result = await repo.findById('uo-1')
    expect(result).not.toBeNull()
    expect(result!.name).toBe('Engineering')
    expect(result!.uoType).toBe('department')
  })

  it('findById returns null when not found', async () => {
    prisma.organizationalUnit.findUnique.mockResolvedValue(null)
    expect(await repo.findById('missing')).toBeNull()
  })

  it('findByProjectId returns array', async () => {
    prisma.organizationalUnit.findMany.mockResolvedValue([sampleRow])
    const results = await repo.findByProjectId('proj-1')
    expect(results).toHaveLength(1)
  })

  it('save upserts the unit', async () => {
    prisma.organizationalUnit.upsert.mockResolvedValue(sampleRow)
    const unit = OrganizationalUnit.reconstitute('uo-1', {
      ...sampleRow,
      uoType: 'department' as const,
      status: 'active' as const,
    })
    await repo.save(unit)
    expect(prisma.organizationalUnit.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'uo-1' } }),
    )
  })

  it('delete removes by id', async () => {
    prisma.organizationalUnit.delete.mockResolvedValue(sampleRow)
    await repo.delete('uo-1')
    expect(prisma.organizationalUnit.delete).toHaveBeenCalledWith({ where: { id: 'uo-1' } })
  })
})
