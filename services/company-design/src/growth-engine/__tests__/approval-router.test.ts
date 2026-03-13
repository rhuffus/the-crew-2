import { describe, it, expect } from 'vitest'
import { computeApprovalRoute } from '../domain/approval-router'
import type { ApprovalCriterionProps } from '../../constitution/domain/company-constitution'

const defaultCriteria: ApprovalCriterionProps[] = [
  { scope: 'create-department', requiredApprover: 'ceo', requiresJustification: true },
  { scope: 'create-team', requiredApprover: 'executive', requiresJustification: true },
  { scope: 'create-specialist', requiredApprover: 'team-lead', requiresJustification: false },
  { scope: 'revise-workflow', requiredApprover: 'auto', requiresJustification: false },
  { scope: 'update-constitution', requiredApprover: 'founder', requiresJustification: true },
]

describe('computeApprovalRoute', () => {
  it('in seed phase: all proposals go to founder (all-founder override)', () => {
    const route = computeApprovalRoute({
      proposalId: 'p-1',
      proposalType: 'create-department',
      phase: 'seed',
      approvalCriteria: defaultCriteria,
    })
    expect(route.requiredApprover).toBe('ceo')
    expect(route.effectiveApprover).toBe('founder')
    expect(route.phaseOverrideApplied).toBe(true)
  })

  it('in seed phase: non-structural also goes to founder', () => {
    const route = computeApprovalRoute({
      proposalId: 'p-2',
      proposalType: 'revise-workflow',
      phase: 'seed',
      approvalCriteria: defaultCriteria,
    })
    expect(route.effectiveApprover).toBe('founder')
    expect(route.phaseOverrideApplied).toBe(true)
  })

  it('in formation phase: structural goes to founder (structural-founder override)', () => {
    const route = computeApprovalRoute({
      proposalId: 'p-3',
      proposalType: 'create-team',
      phase: 'formation',
      approvalCriteria: defaultCriteria,
    })
    expect(route.requiredApprover).toBe('executive')
    expect(route.effectiveApprover).toBe('founder')
    expect(route.phaseOverrideApplied).toBe(true)
  })

  it('in formation phase: non-structural follows constitution', () => {
    const route = computeApprovalRoute({
      proposalId: 'p-4',
      proposalType: 'revise-workflow',
      phase: 'formation',
      approvalCriteria: defaultCriteria,
    })
    expect(route.effectiveApprover).toBe('auto')
    expect(route.phaseOverrideApplied).toBe(false)
  })

  it('in structured phase: follows constitution rules (no override)', () => {
    const route = computeApprovalRoute({
      proposalId: 'p-5',
      proposalType: 'create-specialist',
      phase: 'structured',
      approvalCriteria: defaultCriteria,
    })
    expect(route.requiredApprover).toBe('team-lead')
    expect(route.effectiveApprover).toBe('team-lead')
    expect(route.phaseOverrideApplied).toBe(false)
  })

  it('auto-approvable when effective is auto and phase supports it', () => {
    const route = computeApprovalRoute({
      proposalId: 'p-6',
      proposalType: 'revise-workflow',
      phase: 'operating',
      approvalCriteria: defaultCriteria,
    })
    expect(route.effectiveApprover).toBe('auto')
    expect(route.autoApprovable).toBe(true)
  })

  it('auto not approvable when effective is auto but phase does not support it', () => {
    const route = computeApprovalRoute({
      proposalId: 'p-7',
      proposalType: 'revise-workflow',
      phase: 'structured',
      approvalCriteria: defaultCriteria,
    })
    expect(route.effectiveApprover).toBe('auto')
    expect(route.autoApprovable).toBe(false)
  })

  it('falls back to founder when no matching criterion', () => {
    const route = computeApprovalRoute({
      proposalId: 'p-8',
      proposalType: 'revise-policy',
      phase: 'structured',
      approvalCriteria: defaultCriteria, // no revise-policy criterion
    })
    expect(route.requiredApprover).toBe('founder')
    expect(route.effectiveApprover).toBe('founder')
  })
})
