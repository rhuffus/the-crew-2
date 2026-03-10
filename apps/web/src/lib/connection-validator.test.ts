import { describe, it, expect } from 'vitest'
import { CONNECTION_RULES } from '@the-crew/shared-types'
import type { NodeType, VisualEdgeDto, EdgeType } from '@the-crew/shared-types'
import {
  validateConnection,
  getValidTargetTypes,
  getValidSourceTypes,
  isSelfLoop,
  isAmbiguousConnection,
  checkDuplicate,
  wouldCreateCycle,
} from './connection-validator'

// --- Helper to build a minimal VisualEdgeDto ---
function makeEdge(
  edgeType: EdgeType,
  sourceId: string,
  targetId: string,
): VisualEdgeDto {
  return {
    id: `${edgeType}-${sourceId}-${targetId}`,
    edgeType,
    sourceId,
    targetId,
    label: null,
    style: 'solid',
    layerIds: [],
  }
}

// ============================================================
// validateConnection
// ============================================================

describe('validateConnection', () => {
  it('returns valid with single edge type for dept → dept (reports_to)', () => {
    const result = validateConnection('department', 'department', CONNECTION_RULES)
    expect(result.valid).toBe(true)
    expect(result.possibleEdgeTypes).toEqual(['reports_to'])
  })

  it('returns valid with single edge type for dept → capability (owns)', () => {
    const result = validateConnection('department', 'capability', CONNECTION_RULES)
    expect(result.valid).toBe(true)
    expect(result.possibleEdgeTypes).toEqual(['owns'])
  })

  it('returns valid for dept → workflow with ambiguity (owns + participates_in)', () => {
    const result = validateConnection('department', 'workflow', CONNECTION_RULES)
    expect(result.valid).toBe(true)
    expect(result.possibleEdgeTypes).toContain('owns')
    expect(result.possibleEdgeTypes).toContain('participates_in')
    expect(result.possibleEdgeTypes).toHaveLength(2)
  })

  it('returns valid for dept → contract with ambiguity (provides + consumes)', () => {
    const result = validateConnection('department', 'contract', CONNECTION_RULES)
    expect(result.valid).toBe(true)
    expect(result.possibleEdgeTypes).toContain('provides')
    expect(result.possibleEdgeTypes).toContain('consumes')
    expect(result.possibleEdgeTypes).toHaveLength(2)
  })

  it('returns valid for capability → contract with ambiguity (provides + consumes)', () => {
    const result = validateConnection('capability', 'contract', CONNECTION_RULES)
    expect(result.valid).toBe(true)
    expect(result.possibleEdgeTypes).toContain('provides')
    expect(result.possibleEdgeTypes).toContain('consumes')
    expect(result.possibleEdgeTypes).toHaveLength(2)
  })

  it('returns valid for agent-archetype → role (assigned_to)', () => {
    const result = validateConnection('agent-archetype', 'role', CONNECTION_RULES)
    expect(result.valid).toBe(true)
    expect(result.possibleEdgeTypes).toEqual(['assigned_to'])
  })

  it('returns valid for role → capability (contributes_to)', () => {
    const result = validateConnection('role', 'capability', CONNECTION_RULES)
    expect(result.valid).toBe(true)
    expect(result.possibleEdgeTypes).toEqual(['contributes_to'])
  })

  it('returns valid for agent-archetype → skill (has_skill)', () => {
    const result = validateConnection('agent-archetype', 'skill', CONNECTION_RULES)
    expect(result.valid).toBe(true)
    expect(result.possibleEdgeTypes).toEqual(['has_skill'])
  })

  it('returns valid for skill → role (compatible_with)', () => {
    const result = validateConnection('skill', 'role', CONNECTION_RULES)
    expect(result.valid).toBe(true)
    expect(result.possibleEdgeTypes).toEqual(['compatible_with'])
  })

  it('returns valid for workflow → contract (bound_by)', () => {
    const result = validateConnection('workflow', 'contract', CONNECTION_RULES)
    expect(result.valid).toBe(true)
    expect(result.possibleEdgeTypes).toEqual(['bound_by'])
  })

  it('returns valid for role → workflow (participates_in)', () => {
    const result = validateConnection('role', 'workflow', CONNECTION_RULES)
    expect(result.valid).toBe(true)
    expect(result.possibleEdgeTypes).toEqual(['participates_in'])
  })

  it('returns valid for policy → department (governs)', () => {
    const result = validateConnection('policy', 'department', CONNECTION_RULES)
    expect(result.valid).toBe(true)
    expect(result.possibleEdgeTypes).toEqual(['governs'])
  })

  it('returns valid for policy → company (governs)', () => {
    const result = validateConnection('policy', 'company', CONNECTION_RULES)
    expect(result.valid).toBe(true)
    expect(result.possibleEdgeTypes).toEqual(['governs'])
  })

  it('excludes hands_off_to from results (non-creatable)', () => {
    const result = validateConnection('workflow-stage', 'workflow-stage', CONNECTION_RULES)
    expect(result.valid).toBe(false)
    expect(result.possibleEdgeTypes).toEqual([])
  })

  it('returns invalid for company → department (no rule)', () => {
    const result = validateConnection('company', 'department', CONNECTION_RULES)
    expect(result.valid).toBe(false)
    expect(result.possibleEdgeTypes).toEqual([])
  })

  it('returns invalid for role → department (no rule)', () => {
    const result = validateConnection('role', 'department', CONNECTION_RULES)
    expect(result.valid).toBe(false)
    expect(result.possibleEdgeTypes).toEqual([])
  })

  it('returns invalid for contract → workflow (reversed direction)', () => {
    const result = validateConnection('contract', 'workflow', CONNECTION_RULES)
    expect(result.valid).toBe(false)
    expect(result.possibleEdgeTypes).toEqual([])
  })

  it('returns invalid for skill → department (no rule)', () => {
    const result = validateConnection('skill', 'department', CONNECTION_RULES)
    expect(result.valid).toBe(false)
  })

  it('works with empty rules', () => {
    const result = validateConnection('department', 'department', [])
    expect(result.valid).toBe(false)
    expect(result.possibleEdgeTypes).toEqual([])
  })
})

// ============================================================
// getValidTargetTypes
// ============================================================

describe('getValidTargetTypes', () => {
  it('returns [department, capability, workflow, contract] for department source', () => {
    const targets = getValidTargetTypes('department', CONNECTION_RULES)
    expect(targets).toContain('department')
    expect(targets).toContain('capability')
    expect(targets).toContain('workflow')
    expect(targets).toContain('contract')
    expect(targets).not.toContain('company')
  })

  it('returns [role, skill] for agent-archetype source', () => {
    const targets = getValidTargetTypes('agent-archetype', CONNECTION_RULES)
    expect(targets).toContain('role')
    expect(targets).toContain('skill')
    expect(targets).toHaveLength(2)
  })

  it('returns [capability, workflow] for role source', () => {
    const targets = getValidTargetTypes('role', CONNECTION_RULES)
    expect(targets).toContain('capability')
    expect(targets).toContain('workflow')
    expect(targets).toHaveLength(2)
  })

  it('returns [role] for skill source', () => {
    const targets = getValidTargetTypes('skill', CONNECTION_RULES)
    expect(targets).toEqual(['role'])
  })

  it('returns [contract] for workflow source', () => {
    const targets = getValidTargetTypes('workflow', CONNECTION_RULES)
    expect(targets).toEqual(['contract'])
  })

  it('returns [department, company] for policy source', () => {
    const targets = getValidTargetTypes('policy', CONNECTION_RULES)
    expect(targets).toContain('department')
    expect(targets).toContain('company')
    expect(targets).toHaveLength(2)
  })

  it('returns empty for company (no outgoing creatable edges)', () => {
    const targets = getValidTargetTypes('company', CONNECTION_RULES)
    expect(targets).toEqual([])
  })

  it('returns empty for workflow-stage (hands_off_to excluded)', () => {
    const targets = getValidTargetTypes('workflow-stage', CONNECTION_RULES)
    expect(targets).toEqual([])
  })

  it('returns [contract] for capability source', () => {
    const targets = getValidTargetTypes('capability', CONNECTION_RULES)
    expect(targets).toEqual(['contract'])
  })

  it('returns empty for agent-assignment (no outgoing edges)', () => {
    const targets = getValidTargetTypes('agent-assignment', CONNECTION_RULES)
    expect(targets).toEqual([])
  })
})

// ============================================================
// getValidSourceTypes
// ============================================================

describe('getValidSourceTypes', () => {
  it('returns [department, policy] for department target', () => {
    const sources = getValidSourceTypes('department', CONNECTION_RULES)
    expect(sources).toContain('department')
    expect(sources).toContain('policy')
  })

  it('returns [department, role] for capability target', () => {
    const sources = getValidSourceTypes('capability', CONNECTION_RULES)
    expect(sources).toContain('department')
    expect(sources).toContain('role')
    expect(sources).toHaveLength(2)
  })

  it('returns [agent-archetype, skill] for role target', () => {
    const sources = getValidSourceTypes('role', CONNECTION_RULES)
    expect(sources).toContain('agent-archetype')
    expect(sources).toContain('skill')
    expect(sources).toHaveLength(2)
  })

  it('returns [agent-archetype] for skill target', () => {
    const sources = getValidSourceTypes('skill', CONNECTION_RULES)
    expect(sources).toEqual(['agent-archetype'])
  })

  it('returns [department, capability, workflow] for contract target', () => {
    const sources = getValidSourceTypes('contract', CONNECTION_RULES)
    expect(sources).toContain('department')
    expect(sources).toContain('capability')
    expect(sources).toContain('workflow')
  })

  it('returns [department, role] for workflow target', () => {
    const sources = getValidSourceTypes('workflow', CONNECTION_RULES)
    expect(sources).toContain('department')
    expect(sources).toContain('role')
  })

  it('returns [policy] for company target', () => {
    const sources = getValidSourceTypes('company', CONNECTION_RULES)
    expect(sources).toEqual(['policy'])
  })

  it('returns empty for workflow-stage target (hands_off_to excluded)', () => {
    const sources = getValidSourceTypes('workflow-stage', CONNECTION_RULES)
    expect(sources).toEqual([])
  })
})

// ============================================================
// isSelfLoop
// ============================================================

describe('isSelfLoop', () => {
  it('returns true when source and target are the same entity', () => {
    expect(isSelfLoop('dept-1', 'dept-1')).toBe(true)
  })

  it('returns false when source and target differ', () => {
    expect(isSelfLoop('dept-1', 'dept-2')).toBe(false)
  })
})

// ============================================================
// isAmbiguousConnection
// ============================================================

describe('isAmbiguousConnection', () => {
  it('returns true for multiple possible edge types', () => {
    expect(
      isAmbiguousConnection({ valid: true, possibleEdgeTypes: ['owns', 'participates_in'] }),
    ).toBe(true)
  })

  it('returns false for single edge type', () => {
    expect(
      isAmbiguousConnection({ valid: true, possibleEdgeTypes: ['reports_to'] }),
    ).toBe(false)
  })

  it('returns false for empty (invalid connection)', () => {
    expect(isAmbiguousConnection({ valid: false, possibleEdgeTypes: [] })).toBe(false)
  })
})

// ============================================================
// checkDuplicate
// ============================================================

describe('checkDuplicate', () => {
  describe('single-ID edge types (replacement semantics)', () => {
    it('detects duplicate when same source+target exists for reports_to', () => {
      const edges = [makeEdge('reports_to', 'dept-A', 'dept-B')]
      const result = checkDuplicate('reports_to', 'dept-A', 'dept-B', edges)
      expect(result.isDuplicate).toBe(true)
      expect(result.isReplacement).toBe(false)
      expect(result.existingEdge).toBeTruthy()
    })

    it('detects replacement when same source exists with different target for reports_to', () => {
      const edges = [makeEdge('reports_to', 'dept-A', 'dept-B')]
      const result = checkDuplicate('reports_to', 'dept-A', 'dept-C', edges)
      expect(result.isDuplicate).toBe(false)
      expect(result.isReplacement).toBe(true)
      expect(result.existingEdge?.targetId).toBe('dept-B')
    })

    it('returns clean when no existing edge for owns', () => {
      const result = checkDuplicate('owns', 'dept-A', 'cap-1', [])
      expect(result.isDuplicate).toBe(false)
      expect(result.isReplacement).toBe(false)
      expect(result.existingEdge).toBeNull()
    })

    it('detects replacement for assigned_to with different target', () => {
      const edges = [makeEdge('assigned_to', 'arch-1', 'role-A')]
      const result = checkDuplicate('assigned_to', 'arch-1', 'role-B', edges)
      expect(result.isReplacement).toBe(true)
    })

    it('detects duplicate for provides with same source+target', () => {
      const edges = [makeEdge('provides', 'dept-A', 'contract-1')]
      const result = checkDuplicate('provides', 'dept-A', 'contract-1', edges)
      expect(result.isDuplicate).toBe(true)
    })

    it('detects replacement for consumes with different target', () => {
      const edges = [makeEdge('consumes', 'cap-A', 'contract-1')]
      const result = checkDuplicate('consumes', 'cap-A', 'contract-2', edges)
      expect(result.isReplacement).toBe(true)
    })

    it('detects replacement for governs with different target', () => {
      const edges = [makeEdge('governs', 'policy-A', 'dept-1')]
      const result = checkDuplicate('governs', 'policy-A', 'company-1', edges)
      expect(result.isReplacement).toBe(true)
    })
  })

  describe('array edge types (append semantics)', () => {
    it('detects duplicate for contributes_to with exact match', () => {
      const edges = [makeEdge('contributes_to', 'role-A', 'cap-1')]
      const result = checkDuplicate('contributes_to', 'role-A', 'cap-1', edges)
      expect(result.isDuplicate).toBe(true)
      expect(result.isReplacement).toBe(false)
    })

    it('returns clean for contributes_to with different target', () => {
      const edges = [makeEdge('contributes_to', 'role-A', 'cap-1')]
      const result = checkDuplicate('contributes_to', 'role-A', 'cap-2', edges)
      expect(result.isDuplicate).toBe(false)
    })

    it('detects duplicate for has_skill', () => {
      const edges = [makeEdge('has_skill', 'arch-1', 'skill-A')]
      const result = checkDuplicate('has_skill', 'arch-1', 'skill-A', edges)
      expect(result.isDuplicate).toBe(true)
    })

    it('returns clean for has_skill with different target', () => {
      const result = checkDuplicate('has_skill', 'arch-1', 'skill-B', [])
      expect(result.isDuplicate).toBe(false)
    })

    it('detects duplicate for compatible_with', () => {
      const edges = [makeEdge('compatible_with', 'skill-A', 'role-1')]
      const result = checkDuplicate('compatible_with', 'skill-A', 'role-1', edges)
      expect(result.isDuplicate).toBe(true)
    })

    it('detects duplicate for bound_by', () => {
      const edges = [makeEdge('bound_by', 'wf-1', 'contract-A')]
      const result = checkDuplicate('bound_by', 'wf-1', 'contract-A', edges)
      expect(result.isDuplicate).toBe(true)
    })

    it('detects duplicate for participates_in', () => {
      const edges = [makeEdge('participates_in', 'role-A', 'wf-1')]
      const result = checkDuplicate('participates_in', 'role-A', 'wf-1', edges)
      expect(result.isDuplicate).toBe(true)
    })
  })

  it('does not confuse edges of different types', () => {
    const edges = [makeEdge('owns', 'dept-A', 'wf-1')]
    const result = checkDuplicate('participates_in', 'dept-A', 'wf-1', edges)
    expect(result.isDuplicate).toBe(false)
  })
})

// ============================================================
// wouldCreateCycle
// ============================================================

describe('wouldCreateCycle', () => {
  it('returns false for simple parent chain without cycle', () => {
    //   A → B → C  (A reports to B, B reports to C)
    //   Proposed: D → A  (D reports to A)
    const edges = [
      makeEdge('reports_to', 'A', 'B'),
      makeEdge('reports_to', 'B', 'C'),
    ]
    expect(wouldCreateCycle('D', 'A', edges)).toBe(false)
  })

  it('detects direct cycle (A→B proposed, B→A exists)', () => {
    const edges = [makeEdge('reports_to', 'B', 'A')]
    expect(wouldCreateCycle('A', 'B', edges)).toBe(true)
  })

  it('detects indirect cycle (A→C proposed, C→B→A exists)', () => {
    const edges = [
      makeEdge('reports_to', 'C', 'B'),
      makeEdge('reports_to', 'B', 'A'),
    ]
    expect(wouldCreateCycle('A', 'C', edges)).toBe(true)
  })

  it('detects self-assignment as cycle (A→A)', () => {
    expect(wouldCreateCycle('A', 'A', [])).toBe(true)
  })

  it('returns false when no reports_to edges exist', () => {
    const edges = [makeEdge('owns', 'A', 'B')]
    expect(wouldCreateCycle('A', 'B', edges)).toBe(false)
  })

  it('returns false for deep chain without cycle', () => {
    //   X → Y → Z → W
    //   Proposed: V → X  (V reports to X, no cycle)
    const edges = [
      makeEdge('reports_to', 'X', 'Y'),
      makeEdge('reports_to', 'Y', 'Z'),
      makeEdge('reports_to', 'Z', 'W'),
    ]
    expect(wouldCreateCycle('V', 'X', edges)).toBe(false)
  })

  it('detects cycle in deep chain', () => {
    //   A → B → C → D
    //   Proposed: D → A  (cycle: D→A→B→C→D)
    //   Check: start at A, follow A→B→C→D, D===source? yes
    const edges = [
      makeEdge('reports_to', 'A', 'B'),
      makeEdge('reports_to', 'B', 'C'),
      makeEdge('reports_to', 'C', 'D'),
    ]
    expect(wouldCreateCycle('D', 'A', edges)).toBe(true)
  })

  it('handles existing broken cycle in data gracefully', () => {
    // Existing data has a cycle B→C→B (broken data)
    // Proposed: A→B
    const edges = [
      makeEdge('reports_to', 'B', 'C'),
      makeEdge('reports_to', 'C', 'B'),
    ]
    // Should not infinite loop — visited set breaks it
    expect(wouldCreateCycle('A', 'B', edges)).toBe(false)
  })

  it('ignores non-reports_to edges', () => {
    const edges = [
      makeEdge('owns', 'B', 'A'),
      makeEdge('participates_in', 'B', 'A'),
    ]
    expect(wouldCreateCycle('A', 'B', edges)).toBe(false)
  })
})

// ============================================================
// Comprehensive coverage: all valid connection pairs
// ============================================================

describe('comprehensive connection validation', () => {
  const validPairs: Array<[NodeType, NodeType, EdgeType[]]> = [
    ['department', 'department', ['reports_to']],
    ['department', 'capability', ['owns']],
    ['department', 'workflow', ['owns', 'participates_in']],
    ['department', 'contract', ['provides', 'consumes']],
    ['agent-archetype', 'role', ['assigned_to']],
    ['agent-archetype', 'skill', ['has_skill']],
    ['role', 'capability', ['contributes_to']],
    ['role', 'workflow', ['participates_in']],
    ['skill', 'role', ['compatible_with']],
    ['workflow', 'contract', ['bound_by']],
    ['capability', 'contract', ['provides', 'consumes']],
    ['policy', 'department', ['governs']],
    ['policy', 'company', ['governs']],
  ]

  it.each(validPairs)(
    '%s → %s should yield %j',
    (source, target, expectedEdgeTypes) => {
      const result = validateConnection(source, target, CONNECTION_RULES)
      expect(result.valid).toBe(true)
      expect(result.possibleEdgeTypes.sort()).toEqual([...expectedEdgeTypes].sort())
    },
  )

  const invalidPairs: Array<[NodeType, NodeType]> = [
    ['company', 'department'],
    ['company', 'capability'],
    ['role', 'department'],
    ['role', 'role'],
    ['capability', 'department'],
    ['capability', 'workflow'],
    ['contract', 'department'],
    ['contract', 'workflow'],
    ['workflow', 'department'],
    ['workflow', 'role'],
    ['skill', 'department'],
    ['skill', 'skill'],
    ['agent-assignment', 'role'],
    ['workflow-stage', 'workflow-stage'], // hands_off_to excluded
  ]

  it.each(invalidPairs)('%s → %s should be invalid', (source, target) => {
    const result = validateConnection(source, target, CONNECTION_RULES)
    expect(result.valid).toBe(false)
  })
})
