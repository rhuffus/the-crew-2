import { describe, it, expect } from 'vitest'
import { evaluateProposal, type GrowthEngineContext } from '../domain/growth-engine.service'
import { Proposal } from '../../proposals/domain/proposal'
import { CompanyConstitution } from '../../constitution/domain/company-constitution'
import { OrganizationalUnit } from '../../organizational-units/domain/organizational-unit'

function makeConstitution(overrides: Record<string, unknown> = {}) {
  return CompanyConstitution.create('proj-1', {
    operationalPrinciples: ['Quality first'],
    autonomyLimits: {
      maxDepth: 3,
      maxFanOut: 5,
      maxAgentsPerTeam: 8,
      coordinatorToSpecialistRatio: 0.25,
    },
    budgetConfig: {
      globalBudget: null,
      perUoBudget: null,
      perAgentBudget: null,
      alertThresholds: [50, 80],
    },
    approvalCriteria: [
      { scope: 'create-department', requiredApprover: 'ceo', requiresJustification: true },
      { scope: 'create-team', requiredApprover: 'executive', requiresJustification: true },
      { scope: 'create-specialist', requiredApprover: 'team-lead', requiresJustification: false },
    ],
    namingConventions: [],
    expansionRules: [
      { targetType: 'department', conditions: ['clear mandate'], requiresBudget: false, requiresOwner: true },
      { targetType: 'team', conditions: ['clear function'], requiresBudget: false, requiresOwner: true },
      { targetType: 'specialist', conditions: ['clear skills'], requiresBudget: false, requiresOwner: false },
    ],
    contextMinimizationPolicy: '',
    qualityRules: [],
    deliveryRules: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  })
}

function makeProposal(
  overrides: Partial<Parameters<typeof Proposal.create>[0]> = {},
) {
  const p = Proposal.create({
    id: 'prop-1',
    projectId: 'proj-1',
    proposalType: 'create-department',
    title: 'Engineering',
    description: 'Eng dept',
    motivation: 'Need engineering',
    problemDetected: 'No tech team',
    expectedBenefit: 'Ship faster',
    proposedByAgentId: 'ceo-agent',
    ...overrides,
  })
  p.submit()
  return p
}

function makeUnit(id: string, overrides: Partial<Parameters<typeof OrganizationalUnit.create>[0]> = {}) {
  return OrganizationalUnit.create({
    id,
    projectId: 'proj-1',
    name: `Unit ${id}`,
    description: '',
    uoType: 'department',
    mandate: 'test mandate',
    parentUoId: null,
    ...overrides,
  })
}

describe('evaluateProposal', () => {
  it('valid proposal passes evaluation', () => {
    const context: GrowthEngineContext = {
      constitution: makeConstitution(),
      phase: 'seed',
      units: [],
      currentBudgetUsage: null,
    }
    const proposal = makeProposal()
    const result = evaluateProposal(proposal, context)

    expect(result.valid).toBe(true)
    expect(result.violations).toHaveLength(0)
    expect(result.requiredApprover).toBe('founder') // phase override: seed -> all-founder
  })

  it('rejects create-team in seed phase', () => {
    const context: GrowthEngineContext = {
      constitution: makeConstitution(),
      phase: 'seed',
      units: [],
      currentBudgetUsage: null,
    }
    const proposal = makeProposal({ proposalType: 'create-team', title: 'Team A' })
    const result = evaluateProposal(proposal, context)

    expect(result.valid).toBe(false)
    expect(result.violations.some((v) => v.rule === 'phase-guard')).toBe(true)
  })

  it('allows create-team in formation phase', () => {
    const dept = makeUnit('dept-1')
    const context: GrowthEngineContext = {
      constitution: makeConstitution(),
      phase: 'formation',
      units: [dept],
      currentBudgetUsage: null,
    }
    const proposal = makeProposal({ proposalType: 'create-team', title: 'New Team' })
    const result = evaluateProposal(proposal, context)

    expect(result.valid).toBe(true)
  })

  it('rejects when depth limit exceeded', () => {
    // Create a chain: company -> dept1 -> dept2 -> trying to add dept3 (depth 3)
    const company = makeUnit('co', { uoType: 'company', name: 'Company' })
    const dept1 = makeUnit('d1', { parentUoId: 'co', name: 'D1' })
    const dept2 = makeUnit('d2', { parentUoId: 'd1', name: 'D2' })
    const dept3 = makeUnit('d3', { parentUoId: 'd2', name: 'D3' })

    const context: GrowthEngineContext = {
      constitution: makeConstitution(), // maxDepth: 3
      phase: 'formation',
      units: [company, dept1, dept2, dept3],
      currentBudgetUsage: null,
    }
    const proposal = makeProposal({
      proposalType: 'create-department',
      title: 'D4',
    })
    const result = evaluateProposal(proposal, context)

    expect(result.violations.some((v) => v.rule === 'depth-limit')).toBe(true)
  })

  it('rejects when fan-out limit exceeded', () => {
    const company = makeUnit('co', { uoType: 'company', name: 'Company' })
    // 5 departments under company (maxFanOut: 5)
    const depts = Array.from({ length: 5 }, (_, i) =>
      makeUnit(`d${i}`, { parentUoId: 'co', name: `Dept ${i}` }),
    )

    const context: GrowthEngineContext = {
      constitution: makeConstitution(),
      phase: 'formation',
      units: [company, ...depts],
      currentBudgetUsage: null,
    }
    const proposal = makeProposal({
      proposalType: 'create-department',
      title: 'Dept 6',
    })
    const result = evaluateProposal(proposal, context)

    expect(result.violations.some((v) => v.rule === 'fanout-limit')).toBe(true)
  })

  it('rejects duplicate name', () => {
    const existing = makeUnit('d1', { name: 'Engineering' })
    const context: GrowthEngineContext = {
      constitution: makeConstitution(),
      phase: 'seed',
      units: [existing],
      currentBudgetUsage: null,
    }
    const proposal = makeProposal({
      proposalType: 'create-department',
      title: 'engineering', // case-insensitive match
    })
    const result = evaluateProposal(proposal, context)

    expect(result.violations.some((v) => v.rule === 'duplicate-check')).toBe(true)
  })

  it('rejects missing justification when required', () => {
    const context: GrowthEngineContext = {
      constitution: makeConstitution(),
      phase: 'seed',
      units: [],
      currentBudgetUsage: null,
    }
    // Create proposal with empty motivation/problemDetected
    const proposal = Proposal.create({
      id: 'prop-1',
      projectId: 'proj-1',
      proposalType: 'create-department',
      title: 'No Justification',
      description: '',
      motivation: '',
      problemDetected: '',
      expectedBenefit: '',
      proposedByAgentId: 'ceo-agent',
    })
    proposal.submit()

    const result = evaluateProposal(proposal, context)
    expect(result.violations.some((v) => v.rule === 'justification-check')).toBe(true)
  })

  it('no expansion rule violation when rule exists', () => {
    const context: GrowthEngineContext = {
      constitution: makeConstitution(),
      phase: 'seed',
      units: [],
      currentBudgetUsage: null,
    }
    const proposal = makeProposal()
    const result = evaluateProposal(proposal, context)

    expect(result.violations.some((v) => v.rule === 'expansion-rules')).toBe(false)
  })

  it('auto-approvable in operating phase with auto criterion', () => {
    const constitution = CompanyConstitution.create('proj-1', {
      operationalPrinciples: ['Quality'],
      autonomyLimits: { maxDepth: 4, maxFanOut: 10, maxAgentsPerTeam: 8, coordinatorToSpecialistRatio: 0.25 },
      budgetConfig: { globalBudget: null, perUoBudget: null, perAgentBudget: null, alertThresholds: [] },
      approvalCriteria: [
        { scope: 'revise-workflow', requiredApprover: 'auto', requiresJustification: false },
      ],
      namingConventions: [],
      expansionRules: [],
      contextMinimizationPolicy: '',
      qualityRules: [],
      deliveryRules: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const context: GrowthEngineContext = {
      constitution,
      phase: 'operating',
      units: [],
      currentBudgetUsage: null,
    }
    const proposal = makeProposal({ proposalType: 'revise-workflow', title: 'Revise WF' })
    const result = evaluateProposal(proposal, context)

    expect(result.autoApprovable).toBe(true)
    expect(result.requiredApprover).toBe('auto')
  })
})
