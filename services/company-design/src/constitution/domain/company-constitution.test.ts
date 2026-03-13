import { describe, it, expect } from 'vitest'
import { CompanyConstitution, type CompanyConstitutionProps } from './company-constitution'

describe('CompanyConstitution', () => {
  const validProps: CompanyConstitutionProps = {
    operationalPrinciples: ['Quality first'],
    autonomyLimits: { maxDepth: 4, maxFanOut: 10, maxAgentsPerTeam: 8, coordinatorToSpecialistRatio: 0.25 },
    budgetConfig: { globalBudget: null, perUoBudget: null, perAgentBudget: null, alertThresholds: [50, 80] },
    approvalCriteria: [{ scope: 'create-department', requiredApprover: 'founder', requiresJustification: true }],
    namingConventions: [],
    expansionRules: [{ targetType: 'department', conditions: ['clear mandate'], requiresBudget: false, requiresOwner: true }],
    contextMinimizationPolicy: '',
    qualityRules: [],
    deliveryRules: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const constitution = CompanyConstitution.create('proj-1', validProps)

      expect(constitution.projectId).toBe('proj-1')
      expect(constitution.operationalPrinciples).toEqual(['Quality first'])
      expect(constitution.autonomyLimits.maxDepth).toBe(4)
    })

    it('should throw if no operational principles', () => {
      expect(() =>
        CompanyConstitution.create('proj-1', { ...validProps, operationalPrinciples: [] }),
      ).toThrow('at least one operational principle')
    })

    it('should emit ConstitutionCreated event', () => {
      const constitution = CompanyConstitution.create('proj-1', validProps)

      expect(constitution.domainEvents).toHaveLength(1)
      expect(constitution.domainEvents[0]!.eventType).toBe('ConstitutionCreated')
    })
  })

  describe('reconstitute', () => {
    it('should not emit events', () => {
      const constitution = CompanyConstitution.reconstitute('proj-1', validProps)

      expect(constitution.domainEvents).toHaveLength(0)
    })
  })

  describe('update', () => {
    it('should update operational principles', () => {
      const constitution = CompanyConstitution.create('proj-1', validProps)
      constitution.update({ operationalPrinciples: ['New principle'] })

      expect(constitution.operationalPrinciples).toEqual(['New principle'])
    })

    it('should throw if principles would become empty', () => {
      const constitution = CompanyConstitution.create('proj-1', validProps)

      expect(() => constitution.update({ operationalPrinciples: [] })).toThrow(
        'at least one operational principle',
      )
    })

    it('should merge partial autonomy limits', () => {
      const constitution = CompanyConstitution.create('proj-1', validProps)
      constitution.update({ autonomyLimits: { maxDepth: 6 } })

      expect(constitution.autonomyLimits.maxDepth).toBe(6)
      expect(constitution.autonomyLimits.maxFanOut).toBe(10)
    })

    it('should merge partial budget config', () => {
      const constitution = CompanyConstitution.create('proj-1', validProps)
      constitution.update({ budgetConfig: { globalBudget: 1000 } })

      expect(constitution.budgetConfig.globalBudget).toBe(1000)
      expect(constitution.budgetConfig.alertThresholds).toEqual([50, 80])
    })

    it('should emit ConstitutionUpdated event', () => {
      const constitution = CompanyConstitution.create('proj-1', validProps)
      constitution.clearEvents()
      constitution.update({ qualityRules: ['test coverage > 80%'] })

      expect(constitution.domainEvents).toHaveLength(1)
      expect(constitution.domainEvents[0]!.eventType).toBe('ConstitutionUpdated')
    })

    it('should preserve fields not in update', () => {
      const constitution = CompanyConstitution.create('proj-1', validProps)
      constitution.update({ contextMinimizationPolicy: 'minimal' })

      expect(constitution.operationalPrinciples).toEqual(['Quality first'])
      expect(constitution.autonomyLimits.maxDepth).toBe(4)
    })
  })

  describe('defensive copies', () => {
    it('should return copies of autonomy limits', () => {
      const constitution = CompanyConstitution.create('proj-1', validProps)
      const limits = constitution.autonomyLimits
      limits.maxDepth = 999
      expect(constitution.autonomyLimits.maxDepth).toBe(4)
    })

    it('should return copies of budget config', () => {
      const constitution = CompanyConstitution.create('proj-1', validProps)
      const config = constitution.budgetConfig
      config.alertThresholds.push(100)
      expect(constitution.budgetConfig.alertThresholds).toEqual([50, 80])
    })

    it('should return copies of approval criteria', () => {
      const constitution = CompanyConstitution.create('proj-1', validProps)
      const criteria = constitution.approvalCriteria
      expect(criteria).toHaveLength(1)
      ;(criteria as unknown as { scope: string }[])[0]!.scope = 'mutated'
      expect(constitution.approvalCriteria[0]!.scope).toBe('create-department')
    })

    it('should return copies of expansion rules', () => {
      const constitution = CompanyConstitution.create('proj-1', validProps)
      const rules = constitution.expansionRules
      ;(rules as unknown as { conditions: string[] }[])[0]!.conditions.push('mutated')
      expect(constitution.expansionRules[0]!.conditions).toEqual(['clear mandate'])
    })
  })
})
