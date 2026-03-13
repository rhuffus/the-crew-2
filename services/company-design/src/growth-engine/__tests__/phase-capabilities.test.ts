import { describe, it, expect } from 'vitest'
import {
  PHASE_CAPABILITIES,
  PHASE_GUARDS,
  isPhaseAllowed,
  phaseIndex,
  getPhaseCapabilities,
} from '../domain/phase-capabilities'

describe('phase-capabilities', () => {
  describe('PHASE_CAPABILITIES', () => {
    it('seed: cannot create teams or specialists', () => {
      const cap = PHASE_CAPABILITIES['seed']
      expect(cap.canCreateDepartments).toBe(true)
      expect(cap.canCreateTeams).toBe(false)
      expect(cap.canCreateSpecialists).toBe(false)
      expect(cap.canSplitMerge).toBe(false)
      expect(cap.canAutoApprove).toBe(false)
      expect(cap.approvalOverride).toBe('all-founder')
    })

    it('formation: can create teams and specialists', () => {
      const cap = PHASE_CAPABILITIES['formation']
      expect(cap.canCreateTeams).toBe(true)
      expect(cap.canCreateSpecialists).toBe(true)
      expect(cap.canSplitMerge).toBe(false)
      expect(cap.approvalOverride).toBe('structural-founder')
    })

    it('structured: can split/merge, delegates', () => {
      const cap = PHASE_CAPABILITIES['structured']
      expect(cap.canSplitMerge).toBe(true)
      expect(cap.canDelegateApprovals).toBe(true)
      expect(cap.canAutoApprove).toBe(false)
      expect(cap.approvalOverride).toBe('constitution-rules')
    })

    it('operating: full capabilities including live mode', () => {
      const cap = PHASE_CAPABILITIES['operating']
      expect(cap.canToggleLiveMode).toBe(true)
      expect(cap.canAutoApprove).toBe(true)
    })
  })

  describe('PHASE_GUARDS', () => {
    it('create-department allowed from seed', () => {
      expect(PHASE_GUARDS['create-department']).toBe('seed')
    })

    it('create-team requires formation', () => {
      expect(PHASE_GUARDS['create-team']).toBe('formation')
    })

    it('split-team requires structured', () => {
      expect(PHASE_GUARDS['split-team']).toBe('structured')
    })
  })

  describe('isPhaseAllowed', () => {
    it('allows create-department in seed', () => {
      expect(isPhaseAllowed('seed', 'create-department')).toBe(true)
    })

    it('denies create-team in seed', () => {
      expect(isPhaseAllowed('seed', 'create-team')).toBe(false)
    })

    it('allows create-team in formation', () => {
      expect(isPhaseAllowed('formation', 'create-team')).toBe(true)
    })

    it('allows split-team in structured', () => {
      expect(isPhaseAllowed('structured', 'split-team')).toBe(true)
    })

    it('allows all types in operating', () => {
      expect(isPhaseAllowed('operating', 'split-team')).toBe(true)
      expect(isPhaseAllowed('operating', 'create-department')).toBe(true)
    })
  })

  describe('phaseIndex', () => {
    it('returns correct order', () => {
      expect(phaseIndex('seed')).toBe(0)
      expect(phaseIndex('formation')).toBe(1)
      expect(phaseIndex('structured')).toBe(2)
      expect(phaseIndex('operating')).toBe(3)
      expect(phaseIndex('scaling')).toBe(4)
      expect(phaseIndex('optimizing')).toBe(5)
    })
  })

  describe('getPhaseCapabilities', () => {
    it('returns capabilities for a given phase', () => {
      const cap = getPhaseCapabilities('formation')
      expect(cap.phase).toBe('formation')
      expect(cap.canCreateTeams).toBe(true)
    })
  })
})
