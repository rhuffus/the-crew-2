import { describe, it, expect } from 'vitest'
import { Proposal } from './proposal'

function makeProposal(overrides: Partial<Parameters<typeof Proposal.create>[0]> = {}) {
  return Proposal.create({
    id: 'prop-1',
    projectId: 'proj-1',
    proposalType: 'create-department',
    title: 'Create Engineering',
    description: 'Engineering department',
    motivation: 'Need engineering capacity',
    problemDetected: 'No tech team exists',
    expectedBenefit: 'Ship product faster',
    proposedByAgentId: 'ceo-agent',
    ...overrides,
  })
}

describe('Proposal', () => {
  describe('create', () => {
    it('should create in draft status', () => {
      const p = makeProposal()
      expect(p.status).toBe('draft')
      expect(p.title).toBe('Create Engineering')
      expect(p.proposalType).toBe('create-department')
      expect(p.proposedByAgentId).toBe('ceo-agent')
    })

    it('should emit ProposalCreated event', () => {
      const p = makeProposal()
      expect(p.domainEvents).toHaveLength(1)
      expect(p.domainEvents[0]!.eventType).toBe('ProposalCreated')
    })

    it('should throw on empty title', () => {
      expect(() => makeProposal({ title: '' })).toThrow('title cannot be empty')
    })

    it('should throw on empty proposedByAgentId', () => {
      expect(() => makeProposal({ proposedByAgentId: '' })).toThrow('proposedByAgentId')
    })
  })

  describe('status transitions', () => {
    it('draft -> proposed via submit()', () => {
      const p = makeProposal()
      p.submit()
      expect(p.status).toBe('proposed')
    })

    it('proposed -> approved via approve()', () => {
      const p = makeProposal()
      p.submit()
      p.approve('user-1')
      expect(p.status).toBe('approved')
      expect(p.approvedByUserId).toBe('user-1')
    })

    it('proposed -> under-review -> approved', () => {
      const p = makeProposal()
      p.submit()
      p.markUnderReview('user-1')
      expect(p.status).toBe('under-review')
      p.approve('user-1')
      expect(p.status).toBe('approved')
    })

    it('proposed -> rejected', () => {
      const p = makeProposal()
      p.submit()
      p.reject('Not viable')
      expect(p.status).toBe('rejected')
      expect(p.rejectionReason).toBe('Not viable')
    })

    it('approved -> implemented', () => {
      const p = makeProposal()
      p.submit()
      p.approve('user-1')
      p.markImplemented()
      expect(p.status).toBe('implemented')
      expect(p.implementedAt).toBeInstanceOf(Date)
    })

    it('any -> superseded', () => {
      const p = makeProposal()
      p.submit()
      p.supersede('prop-2')
      expect(p.status).toBe('superseded')
    })

    it('should throw on invalid transition', () => {
      const p = makeProposal()
      expect(() => p.approve('user-1')).toThrow("Cannot transition from 'draft' to 'approved'")
    })

    it('should throw on approve rejected', () => {
      const p = makeProposal()
      p.submit()
      p.reject('No')
      expect(() => p.approve('user-1')).toThrow("Cannot transition from 'rejected' to 'approved'")
    })
  })

  describe('update', () => {
    it('should update title in draft', () => {
      const p = makeProposal()
      p.update({ title: 'Renamed' })
      expect(p.title).toBe('Renamed')
    })

    it('should update in proposed status', () => {
      const p = makeProposal()
      p.submit()
      p.update({ description: 'Updated description' })
      expect(p.description).toBe('Updated description')
    })

    it('should throw on update after approval', () => {
      const p = makeProposal()
      p.submit()
      p.approve('user-1')
      expect(() => p.update({ title: 'Too late' })).toThrow('draft or proposed')
    })

    it('should throw on empty title update', () => {
      const p = makeProposal()
      expect(() => p.update({ title: '' })).toThrow('title cannot be empty')
    })
  })

  describe('reconstitute', () => {
    it('should not emit events', () => {
      const p = Proposal.reconstitute('prop-1', {
        projectId: 'proj-1',
        proposalType: 'create-department',
        title: 'Test',
        description: '',
        motivation: '',
        problemDetected: '',
        expectedBenefit: '',
        estimatedCost: '',
        contextToAssign: '',
        affectedContractIds: [],
        affectedWorkflowIds: [],
        requiredApproval: 'founder',
        status: 'proposed',
        proposedByAgentId: 'ceo',
        reviewedByUserId: null,
        approvedByUserId: null,
        rejectionReason: null,
        implementedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      expect(p.domainEvents).toHaveLength(0)
      expect(p.status).toBe('proposed')
    })
  })

  describe('domain events', () => {
    it('should emit ProposalSubmitted on submit', () => {
      const p = makeProposal()
      p.clearEvents()
      p.submit()
      expect(p.domainEvents).toHaveLength(1)
      expect(p.domainEvents[0]!.eventType).toBe('ProposalSubmitted')
    })

    it('should emit ProposalApproved on approve', () => {
      const p = makeProposal()
      p.submit()
      p.clearEvents()
      p.approve('user-1')
      expect(p.domainEvents).toHaveLength(1)
      expect(p.domainEvents[0]!.eventType).toBe('ProposalApproved')
    })

    it('should emit ProposalRejected on reject', () => {
      const p = makeProposal()
      p.submit()
      p.clearEvents()
      p.reject('Reason')
      expect(p.domainEvents).toHaveLength(1)
      expect(p.domainEvents[0]!.eventType).toBe('ProposalRejected')
    })

    it('should emit ProposalImplemented on markImplemented', () => {
      const p = makeProposal()
      p.submit()
      p.approve('user-1')
      p.clearEvents()
      p.markImplemented()
      expect(p.domainEvents).toHaveLength(1)
      expect(p.domainEvents[0]!.eventType).toBe('ProposalImplemented')
    })
  })

  describe('STRUCTURAL_PROPOSAL_TYPES', () => {
    it('should include structural types and exclude non-structural', async () => {
      const { STRUCTURAL_PROPOSAL_TYPES } = await import('./proposal')
      expect(STRUCTURAL_PROPOSAL_TYPES).toContain('create-department')
      expect(STRUCTURAL_PROPOSAL_TYPES).toContain('create-team')
      expect(STRUCTURAL_PROPOSAL_TYPES).toContain('create-specialist')
      expect(STRUCTURAL_PROPOSAL_TYPES).toContain('split-team')
      expect(STRUCTURAL_PROPOSAL_TYPES).toContain('merge-teams')
      expect(STRUCTURAL_PROPOSAL_TYPES).toContain('retire-unit')
      expect(STRUCTURAL_PROPOSAL_TYPES).not.toContain('revise-contract')
    })
  })
})
