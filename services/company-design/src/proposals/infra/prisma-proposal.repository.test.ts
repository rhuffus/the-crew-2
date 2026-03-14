import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaProposalRepository } from './prisma-proposal.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { Proposal } from '../domain/proposal'

interface MockDelegate {
  findUnique: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'proposal', {
    value: { findUnique: vi.fn(), findMany: vi.fn(), upsert: vi.fn(), delete: vi.fn() },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { proposal: MockDelegate }
}

const now = new Date('2026-01-01T00:00:00Z')
const sampleRow = {
  id: 'prop-1',
  projectId: 'proj-1',
  proposalType: 'create-department',
  title: 'Create Engineering',
  description: 'New engineering department',
  motivation: 'Growth',
  problemDetected: '',
  expectedBenefit: 'Better delivery',
  estimatedCost: 'Low',
  contextToAssign: '',
  affectedContractIds: [],
  affectedWorkflowIds: [],
  requiredApproval: 'founder',
  status: 'draft',
  proposedByAgentId: 'agent-1',
  reviewedByUserId: null,
  approvedByUserId: null,
  rejectionReason: null,
  implementedAt: null,
  createdAt: now,
  updatedAt: now,
}

describe('PrismaProposalRepository', () => {
  let repo: PrismaProposalRepository
  let prisma: CompanyDesignPrismaService & { proposal: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaProposalRepository(prisma)
  })

  it('findById returns domain entity', async () => {
    prisma.proposal.findUnique.mockResolvedValue(sampleRow)
    const result = await repo.findById('prop-1')
    expect(result).not.toBeNull()
    expect(result!.title).toBe('Create Engineering')
  })

  it('findById returns null when not found', async () => {
    prisma.proposal.findUnique.mockResolvedValue(null)
    expect(await repo.findById('missing')).toBeNull()
  })

  it('findByProjectId returns array', async () => {
    prisma.proposal.findMany.mockResolvedValue([sampleRow])
    const results = await repo.findByProjectId('proj-1')
    expect(results).toHaveLength(1)
  })

  it('findByProjectId applies status filter', async () => {
    prisma.proposal.findMany.mockResolvedValue([])
    await repo.findByProjectId('proj-1', { status: 'approved' as const })
    expect(prisma.proposal.findMany).toHaveBeenCalledWith({
      where: { projectId: 'proj-1', status: 'approved' },
    })
  })

  it('findByProjectId applies proposalType filter', async () => {
    prisma.proposal.findMany.mockResolvedValue([])
    await repo.findByProjectId('proj-1', { proposalType: 'create-department' as const })
    expect(prisma.proposal.findMany).toHaveBeenCalledWith({
      where: { projectId: 'proj-1', proposalType: 'create-department' },
    })
  })

  it('save upserts the proposal', async () => {
    prisma.proposal.upsert.mockResolvedValue(sampleRow)
    const proposal = Proposal.reconstitute('prop-1', {
      ...sampleRow,
      proposalType: 'create-department' as const,
      status: 'draft' as const,
    })
    await repo.save(proposal)
    expect(prisma.proposal.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'prop-1' } }),
    )
  })

  it('delete removes by id', async () => {
    prisma.proposal.delete.mockResolvedValue(sampleRow)
    await repo.delete('prop-1')
    expect(prisma.proposal.delete).toHaveBeenCalledWith({ where: { id: 'prop-1' } })
  })
})
