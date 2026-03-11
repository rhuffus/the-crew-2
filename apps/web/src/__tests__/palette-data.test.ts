import { describe, it, expect } from 'vitest'
import { CONNECTION_RULES } from '@the-crew/shared-types'
import {
  getNodePaletteItems,
  getGroupedNodePaletteItems,
  filterNodePaletteItems,
  getCreatableRelationships,
  getGroupedRelationships,
  filterRelationshipItems,
  formatTypeList,
  getEdgeCategoryLabel,
  EDGE_TYPE_LABELS,
} from '@/lib/palette-data'

describe('palette-data — node palette', () => {
  it('should return 2 items for L1 (department + artifact)', () => {
    const items = getNodePaletteItems('L1')
    expect(items).toHaveLength(2)
    expect(items[0]!.nodeType).toBe('department')
    expect(items[1]!.nodeType).toBe('artifact')
  })

  it('should return 9 items for L2', () => {
    const items = getNodePaletteItems('L2')
    expect(items).toHaveLength(9)
    const types = items.map((i) => i.nodeType)
    expect(types).toContain('role')
    expect(types).toContain('capability')
    expect(types).toContain('workflow')
    expect(types).toContain('contract')
    expect(types).toContain('policy')
    expect(types).toContain('skill')
    expect(types).toContain('agent-archetype')
    expect(types).toContain('agent-assignment')
  })

  it('should return empty array for L3 and L4', () => {
    expect(getNodePaletteItems('L3')).toEqual([])
    expect(getNodePaletteItems('L4')).toEqual([])
  })

  it('should include label, description, and category for each item', () => {
    const items = getNodePaletteItems('L2')
    for (const item of items) {
      expect(item.label).toBeTruthy()
      expect(item.description).toBeTruthy()
      expect(item.category).toBeTruthy()
    }
  })

  it('should assign correct categories', () => {
    const items = getNodePaletteItems('L2')
    const roleItem = items.find((i) => i.nodeType === 'role')!
    expect(roleItem.category).toBe('organization')

    const capItem = items.find((i) => i.nodeType === 'capability')!
    expect(capItem.category).toBe('capabilities')

    const wfItem = items.find((i) => i.nodeType === 'workflow')!
    expect(wfItem.category).toBe('workflows')

    const contractItem = items.find((i) => i.nodeType === 'contract')!
    expect(contractItem.category).toBe('contracts')

    const policyItem = items.find((i) => i.nodeType === 'policy')!
    expect(policyItem.category).toBe('governance')
  })
})

describe('palette-data — grouped node palette', () => {
  it('should group L2 items by category', () => {
    const groups = getGroupedNodePaletteItems('L2')
    expect(groups.length).toBeGreaterThan(1)

    const orgGroup = groups.find((g) => g.category === 'organization')!
    expect(orgGroup).toBeDefined()
    expect(orgGroup.label).toBe('Organization')
    const orgTypes = orgGroup.items.map((i) => i.nodeType)
    expect(orgTypes).toContain('role')
    expect(orgTypes).toContain('agent-archetype')
    expect(orgTypes).toContain('agent-assignment')
  })

  it('should maintain category order', () => {
    const groups = getGroupedNodePaletteItems('L2')
    const categories = groups.map((g) => g.category)
    const expectedOrder = ['organization', 'capabilities', 'workflows', 'contracts', 'artifacts', 'governance']
    // Only check categories that appear
    const filteredExpected = expectedOrder.filter((c) => categories.includes(c))
    expect(categories).toEqual(filteredExpected)
  })

  it('should return 2 groups for L1 (organization + artifacts)', () => {
    const groups = getGroupedNodePaletteItems('L1')
    expect(groups).toHaveLength(2)
    expect(groups[0]!.category).toBe('organization')
    expect(groups[0]!.items).toHaveLength(1)
    expect(groups[1]!.category).toBe('artifacts')
    expect(groups[1]!.items).toHaveLength(1)
  })

  it('should return empty for L3', () => {
    const groups = getGroupedNodePaletteItems('L3')
    expect(groups).toEqual([])
  })
})

describe('palette-data — filter node palette items', () => {
  it('should return all items when query is empty', () => {
    const items = getNodePaletteItems('L2')
    expect(filterNodePaletteItems(items, '')).toEqual(items)
    expect(filterNodePaletteItems(items, '  ')).toEqual(items)
  })

  it('should filter by label', () => {
    const items = getNodePaletteItems('L2')
    const result = filterNodePaletteItems(items, 'role')
    expect(result.some((i) => i.nodeType === 'role')).toBe(true)
  })

  it('should filter by description', () => {
    const items = getNodePaletteItems('L2')
    const result = filterNodePaletteItems(items, 'agreement')
    expect(result.some((i) => i.nodeType === 'contract')).toBe(true)
  })

  it('should filter by category', () => {
    const items = getNodePaletteItems('L2')
    const result = filterNodePaletteItems(items, 'governance')
    expect(result.some((i) => i.nodeType === 'policy')).toBe(true)
  })

  it('should be case-insensitive', () => {
    const items = getNodePaletteItems('L2')
    expect(filterNodePaletteItems(items, 'ROLE')).toEqual(filterNodePaletteItems(items, 'role'))
  })

  it('should return empty when no match', () => {
    const items = getNodePaletteItems('L2')
    expect(filterNodePaletteItems(items, 'zzzzz')).toEqual([])
  })
})

describe('palette-data — relationship palette', () => {
  it('should return creatable relationships excluding hands_off_to', () => {
    const items = getCreatableRelationships(CONNECTION_RULES)
    const types = items.map((i) => i.edgeType)
    expect(types).not.toContain('hands_off_to')
    expect(types).toContain('reports_to')
    expect(types).toContain('owns')
    expect(types).toContain('participates_in')
    expect(types).toContain('governs')
  })

  it('should include label, sourceTypes, targetTypes, category, and style', () => {
    const items = getCreatableRelationships(CONNECTION_RULES)
    for (const item of items) {
      expect(item.label).toBeTruthy()
      expect(item.sourceTypes.length).toBeGreaterThan(0)
      expect(item.targetTypes.length).toBeGreaterThan(0)
      expect(item.category).toBeTruthy()
      expect(item.style).toBeTruthy()
    }
  })

  it('should have correct labels from EDGE_TYPE_LABELS', () => {
    const items = getCreatableRelationships(CONNECTION_RULES)
    for (const item of items) {
      expect(item.label).toBe(EDGE_TYPE_LABELS[item.edgeType])
    }
  })
})

describe('palette-data — grouped relationships', () => {
  it('should group relationships by category', () => {
    const groups = getGroupedRelationships(CONNECTION_RULES)
    expect(groups.length).toBeGreaterThan(1)

    const contractGroup = groups.find((g) => g.category === 'contract')!
    expect(contractGroup).toBeDefined()
    expect(contractGroup.label).toBe('Contract')
    const types = contractGroup.items.map((i) => i.edgeType)
    expect(types).toContain('provides')
    expect(types).toContain('consumes')
    expect(types).toContain('bound_by')
  })

  it('should maintain category order', () => {
    const groups = getGroupedRelationships(CONNECTION_RULES)
    const categories = groups.map((g) => g.category)
    const expectedOrder = ['hierarchical', 'ownership', 'assignment', 'capability', 'contract', 'workflow', 'artifact', 'governance']
    const filteredExpected = expectedOrder.filter((c) => categories.includes(c))
    expect(categories).toEqual(filteredExpected)
  })

  it('should not include hands_off_to in any group', () => {
    const groups = getGroupedRelationships(CONNECTION_RULES)
    const allTypes = groups.flatMap((g) => g.items.map((i) => i.edgeType))
    expect(allTypes).not.toContain('hands_off_to')
  })
})

describe('palette-data — filter relationships', () => {
  it('should return all when query is empty', () => {
    const items = getCreatableRelationships(CONNECTION_RULES)
    expect(filterRelationshipItems(items, '')).toEqual(items)
  })

  it('should filter by label', () => {
    const items = getCreatableRelationships(CONNECTION_RULES)
    const result = filterRelationshipItems(items, 'owns')
    expect(result.some((i) => i.edgeType === 'owns')).toBe(true)
  })

  it('should filter by category', () => {
    const items = getCreatableRelationships(CONNECTION_RULES)
    const result = filterRelationshipItems(items, 'governance')
    expect(result.some((i) => i.edgeType === 'governs')).toBe(true)
  })

  it('should filter by source type', () => {
    const items = getCreatableRelationships(CONNECTION_RULES)
    const result = filterRelationshipItems(items, 'policy')
    expect(result.some((i) => i.edgeType === 'governs')).toBe(true)
  })

  it('should filter by target type', () => {
    const items = getCreatableRelationships(CONNECTION_RULES)
    const result = filterRelationshipItems(items, 'contract')
    expect(result.some((i) => i.edgeType === 'provides')).toBe(true)
    expect(result.some((i) => i.edgeType === 'consumes')).toBe(true)
  })
})

describe('palette-data — utility functions', () => {
  it('formatTypeList should join type labels', () => {
    expect(formatTypeList(['department', 'capability'])).toBe('Department, Capability')
  })

  it('formatTypeList should handle single type', () => {
    expect(formatTypeList(['department'])).toBe('Department')
  })

  it('getEdgeCategoryLabel should return human label', () => {
    expect(getEdgeCategoryLabel('hierarchical')).toBe('Hierarchical')
    expect(getEdgeCategoryLabel('governance')).toBe('Governance')
  })
})
