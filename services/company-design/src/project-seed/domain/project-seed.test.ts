import { describe, it, expect } from 'vitest'
import { ProjectSeed } from './project-seed'

describe('ProjectSeed', () => {
  const validProps = {
    name: 'Acme Corp',
    mission: 'Build great widgets',
    companyType: 'saas-startup',
  }

  describe('create', () => {
    it('should create with minimal required fields', () => {
      const seed = ProjectSeed.create('proj-1', validProps)

      expect(seed.projectId).toBe('proj-1')
      expect(seed.name).toBe('Acme Corp')
      expect(seed.mission).toBe('Build great widgets')
      expect(seed.companyType).toBe('saas-startup')
      expect(seed.maturityPhase).toBe('seed')
    })

    it('should default optional fields', () => {
      const seed = ProjectSeed.create('proj-1', validProps)

      expect(seed.description).toBe('')
      expect(seed.vision).toBe('')
      expect(seed.restrictions).toEqual([])
      expect(seed.principles).toEqual([])
      expect(seed.initialObjectives).toEqual([])
      expect(seed.aiBudget.maxMonthlyTokens).toBeNull()
      expect(seed.founderPreferences.approvalLevel).toBe('all-changes')
      expect(seed.founderPreferences.communicationStyle).toBe('detailed')
      expect(seed.founderPreferences.growthPace).toBe('moderate')
    })

    it('should trim name and mission', () => {
      const seed = ProjectSeed.create('proj-1', {
        ...validProps,
        name: '  Acme  ',
        mission: '  Build great  ',
      })

      expect(seed.name).toBe('Acme')
      expect(seed.mission).toBe('Build great')
    })

    it('should throw if name is empty', () => {
      expect(() => ProjectSeed.create('proj-1', { ...validProps, name: '' })).toThrow(
        'ProjectSeed name is required',
      )
    })

    it('should throw if mission is empty', () => {
      expect(() => ProjectSeed.create('proj-1', { ...validProps, mission: '  ' })).toThrow(
        'ProjectSeed mission is required',
      )
    })

    it('should emit ProjectSeedCreated event', () => {
      const seed = ProjectSeed.create('proj-1', validProps)

      expect(seed.domainEvents).toHaveLength(1)
      expect(seed.domainEvents[0]!.eventType).toBe('ProjectSeedCreated')
      expect(seed.domainEvents[0]!.aggregateId).toBe('proj-1')
    })

    it('should accept optional fields', () => {
      const seed = ProjectSeed.create('proj-1', {
        ...validProps,
        description: 'desc',
        vision: 'vision',
        restrictions: ['no debt'],
        principles: ['quality first'],
        initialObjectives: ['launch mvp'],
        aiBudget: { maxConcurrentAgents: 10 },
        founderPreferences: { growthPace: 'aggressive' },
      })

      expect(seed.description).toBe('desc')
      expect(seed.vision).toBe('vision')
      expect(seed.restrictions).toEqual(['no debt'])
      expect(seed.principles).toEqual(['quality first'])
      expect(seed.initialObjectives).toEqual(['launch mvp'])
      expect(seed.aiBudget.maxConcurrentAgents).toBe(10)
      expect(seed.founderPreferences.growthPace).toBe('aggressive')
    })
  })

  describe('reconstitute', () => {
    it('should not emit events', () => {
      const seed = ProjectSeed.reconstitute('proj-1', {
        name: 'Test',
        description: '',
        mission: 'Test',
        vision: '',
        companyType: 'custom',
        restrictions: [],
        principles: [],
        aiBudget: { maxMonthlyTokens: null, maxConcurrentAgents: null, costAlertThreshold: null },
        initialObjectives: [],
        founderPreferences: { approvalLevel: 'none', communicationStyle: 'minimal', growthPace: 'conservative' },
        maturityPhase: 'formation',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      expect(seed.domainEvents).toHaveLength(0)
      expect(seed.maturityPhase).toBe('formation')
    })
  })

  describe('update', () => {
    it('should update name', () => {
      const seed = ProjectSeed.create('proj-1', validProps)
      seed.update({ name: 'New Name' })

      expect(seed.name).toBe('New Name')
    })

    it('should throw on empty name update', () => {
      const seed = ProjectSeed.create('proj-1', validProps)

      expect(() => seed.update({ name: '' })).toThrow('ProjectSeed name is required')
    })

    it('should throw on empty mission update', () => {
      const seed = ProjectSeed.create('proj-1', validProps)

      expect(() => seed.update({ mission: '' })).toThrow('ProjectSeed mission is required')
    })

    it('should emit ProjectSeedUpdated event', () => {
      const seed = ProjectSeed.create('proj-1', validProps)
      seed.clearEvents()
      seed.update({ vision: 'New vision' })

      expect(seed.domainEvents).toHaveLength(1)
      expect(seed.domainEvents[0]!.eventType).toBe('ProjectSeedUpdated')
    })

    it('should preserve fields not in update', () => {
      const seed = ProjectSeed.create('proj-1', {
        ...validProps,
        vision: 'original',
      })
      seed.update({ name: 'Updated' })

      expect(seed.vision).toBe('original')
      expect(seed.mission).toBe('Build great widgets')
    })
  })

  describe('advancePhase', () => {
    it('should advance from seed to formation', () => {
      const seed = ProjectSeed.create('proj-1', validProps)
      seed.advancePhase('formation')

      expect(seed.maturityPhase).toBe('formation')
    })

    it('should emit MaturityPhaseAdvanced event', () => {
      const seed = ProjectSeed.create('proj-1', validProps)
      seed.clearEvents()
      seed.advancePhase('formation')

      expect(seed.domainEvents).toHaveLength(1)
      const event = seed.domainEvents[0]!
      expect(event.eventType).toBe('MaturityPhaseAdvanced')
      expect(event.payload).toEqual({ from: 'seed', to: 'formation' })
    })

    it('should throw when trying to go backward', () => {
      const seed = ProjectSeed.create('proj-1', validProps)
      seed.advancePhase('formation')

      expect(() => seed.advancePhase('seed')).toThrow('phase must move forward')
    })

    it('should throw when trying to stay at the same phase', () => {
      const seed = ProjectSeed.create('proj-1', validProps)

      expect(() => seed.advancePhase('seed')).toThrow('phase must move forward')
    })

    it('should allow skipping phases forward', () => {
      const seed = ProjectSeed.create('proj-1', validProps)
      seed.advancePhase('structured')

      expect(seed.maturityPhase).toBe('structured')
    })
  })

  describe('defensive copies', () => {
    it('should return copies of arrays', () => {
      const seed = ProjectSeed.create('proj-1', {
        ...validProps,
        restrictions: ['no debt'],
      })

      const restrictions = seed.restrictions
      expect(restrictions).toEqual(['no debt'])
      // Mutation should not affect aggregate
      ;(restrictions as string[]).push('mutated')
      expect(seed.restrictions).toEqual(['no debt'])
    })

    it('should return copy of aiBudget', () => {
      const seed = ProjectSeed.create('proj-1', validProps)
      const budget = seed.aiBudget
      budget.maxConcurrentAgents = 999
      expect(seed.aiBudget.maxConcurrentAgents).toBeNull()
    })

    it('should return copy of founderPreferences', () => {
      const seed = ProjectSeed.create('proj-1', validProps)
      const prefs = seed.founderPreferences
      ;(prefs as { growthPace: string }).growthPace = 'mutated'
      expect(seed.founderPreferences.growthPace).toBe('moderate')
    })
  })
})
