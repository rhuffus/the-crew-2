import { describe, it, expect } from 'vitest'
import type { VisualNodeDto, VisualEdgeDto } from '@the-crew/shared-types'
import {
  getNodeContextMenuSections,
  getEdgeContextMenuSections,
  getPaneContextMenuSections,
  getMultiSelectContextMenuSections,
  resolveEdgeForDeletion,
} from '@/lib/context-menu-actions'

function makeNode(overrides: Partial<VisualNodeDto> = {}): VisualNodeDto {
  return {
    id: 'node-1',
    nodeType: 'department',
    entityId: 'dept-1',
    label: 'Engineering',
    sublabel: null,
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['organization'],
    parentId: null,
    ...overrides,
  }
}

function makeEdge(overrides: Partial<VisualEdgeDto> = {}): VisualEdgeDto {
  return {
    id: 'edge-1',
    edgeType: 'owns',
    sourceId: 'node-1',
    targetId: 'node-2',
    label: 'Owns',
    style: 'solid',
    layerIds: ['organization'],
    ...overrides,
  }
}

describe('getNodeContextMenuSections', () => {
  it('returns inspect and drill-in for drillable node types', () => {
    const nodes = [makeNode({ id: 'n1', nodeType: 'department' })]
    const sections = getNodeContextMenuSections('n1', nodes, [], false)
    const allIds = sections.flatMap((s) => s.items.map((i) => i.id))
    expect(allIds).toContain('inspect')
    expect(allIds).toContain('drill-in')
  })

  it('does not include drill-in for non-drillable types', () => {
    const nodes = [makeNode({ id: 'n1', nodeType: 'role' })]
    const sections = getNodeContextMenuSections('n1', nodes, [], false)
    const allIds = sections.flatMap((s) => s.items.map((i) => i.id))
    expect(allIds).toContain('inspect')
    expect(allIds).not.toContain('drill-in')
  })

  it('includes edit and create-relationship in edit mode', () => {
    const nodes = [makeNode({ id: 'n1', nodeType: 'role' })]
    const sections = getNodeContextMenuSections('n1', nodes, [], false)
    const allIds = sections.flatMap((s) => s.items.map((i) => i.id))
    expect(allIds).toContain('edit')
    expect(allIds).toContain('create-relationship')
  })

  it('hides edit actions in diff mode', () => {
    const nodes = [makeNode({ id: 'n1', nodeType: 'role' })]
    const sections = getNodeContextMenuSections('n1', nodes, [], true)
    const allIds = sections.flatMap((s) => s.items.map((i) => i.id))
    expect(allIds).not.toContain('edit')
    expect(allIds).not.toContain('create-relationship')
    expect(allIds).not.toContain('delete-node')
  })

  it('includes delete for deletable types', () => {
    const nodes = [makeNode({ id: 'n1', nodeType: 'capability' })]
    const sections = getNodeContextMenuSections('n1', nodes, [], false)
    const allIds = sections.flatMap((s) => s.items.map((i) => i.id))
    expect(allIds).toContain('delete-node')
  })

  it('does not include delete for company', () => {
    const nodes = [makeNode({ id: 'n1', nodeType: 'company' })]
    const sections = getNodeContextMenuSections('n1', nodes, [], false)
    const allIds = sections.flatMap((s) => s.items.map((i) => i.id))
    expect(allIds).not.toContain('delete-node')
  })

  it('does not include delete for workflow-stage', () => {
    const nodes = [makeNode({ id: 'n1', nodeType: 'workflow-stage' })]
    const sections = getNodeContextMenuSections('n1', nodes, [], false)
    const allIds = sections.flatMap((s) => s.items.map((i) => i.id))
    expect(allIds).not.toContain('delete-node')
  })

  it('includes collapse for container nodes', () => {
    const nodes = [
      makeNode({ id: 'parent', nodeType: 'department' }),
      makeNode({ id: 'child', nodeType: 'role', parentId: 'parent' }),
    ]
    const sections = getNodeContextMenuSections('parent', nodes, [], false)
    const allIds = sections.flatMap((s) => s.items.map((i) => i.id))
    expect(allIds).toContain('collapse')
  })

  it('includes expand for collapsed containers', () => {
    const nodes = [
      makeNode({ id: 'parent', nodeType: 'department' }),
      makeNode({ id: 'child', nodeType: 'role', parentId: 'parent' }),
    ]
    const sections = getNodeContextMenuSections('parent', nodes, ['parent'], false)
    const allIds = sections.flatMap((s) => s.items.map((i) => i.id))
    expect(allIds).toContain('expand')
    expect(allIds).not.toContain('collapse')
  })

  it('returns empty for unknown node', () => {
    const sections = getNodeContextMenuSections('unknown', [], [], false)
    expect(sections).toEqual([])
  })

  it('marks delete as danger', () => {
    const nodes = [makeNode({ id: 'n1', nodeType: 'role' })]
    const sections = getNodeContextMenuSections('n1', nodes, [], false)
    const deleteItem = sections.flatMap((s) => s.items).find((i) => i.id === 'delete-node')
    expect(deleteItem?.danger).toBe(true)
  })
})

describe('getEdgeContextMenuSections', () => {
  it('includes inspect for any edge', () => {
    const edges = [makeEdge({ id: 'e1' })]
    const nodes = [
      makeNode({ id: 'node-1', nodeType: 'department' }),
      makeNode({ id: 'node-2', nodeType: 'capability' }),
    ]
    const sections = getEdgeContextMenuSections('e1', edges, nodes, false)
    const allIds = sections.flatMap((s) => s.items.map((i) => i.id))
    expect(allIds).toContain('inspect-edge')
  })

  it('includes focus-source and focus-target', () => {
    const edges = [makeEdge({ id: 'e1' })]
    const nodes = [
      makeNode({ id: 'node-1', label: 'Engineering' }),
      makeNode({ id: 'node-2', label: 'Payments' }),
    ]
    const sections = getEdgeContextMenuSections('e1', edges, nodes, false)
    const allItems = sections.flatMap((s) => s.items)
    expect(allItems.find((i) => i.id === 'focus-source')?.label).toBe('Focus Source: Engineering')
    expect(allItems.find((i) => i.id === 'focus-target')?.label).toBe('Focus Target: Payments')
  })

  it('includes delete for creatable edge types', () => {
    const edges = [makeEdge({ id: 'e1', edgeType: 'owns' })]
    const nodes = [makeNode({ id: 'node-1' }), makeNode({ id: 'node-2' })]
    const sections = getEdgeContextMenuSections('e1', edges, nodes, false)
    const allIds = sections.flatMap((s) => s.items.map((i) => i.id))
    expect(allIds).toContain('delete-edge')
  })

  it('excludes delete for hands_off_to edge type', () => {
    const edges = [makeEdge({ id: 'e1', edgeType: 'hands_off_to' })]
    const nodes = [makeNode({ id: 'node-1' }), makeNode({ id: 'node-2' })]
    const sections = getEdgeContextMenuSections('e1', edges, nodes, false)
    const allIds = sections.flatMap((s) => s.items.map((i) => i.id))
    expect(allIds).not.toContain('delete-edge')
  })

  it('hides delete in diff mode', () => {
    const edges = [makeEdge({ id: 'e1', edgeType: 'owns' })]
    const nodes = [makeNode({ id: 'node-1' }), makeNode({ id: 'node-2' })]
    const sections = getEdgeContextMenuSections('e1', edges, nodes, true)
    const allIds = sections.flatMap((s) => s.items.map((i) => i.id))
    expect(allIds).not.toContain('delete-edge')
  })

  it('returns empty for unknown edge', () => {
    const sections = getEdgeContextMenuSections('unknown', [], [], false)
    expect(sections).toEqual([])
  })
})

describe('getPaneContextMenuSections', () => {
  it('includes add-node items at L1 (company)', () => {
    const sections = getPaneContextMenuSections('company', false, true)
    const allItems = sections.flatMap((s) => s.items)
    const addNodeItems = allItems.filter((i) => i.id === 'add-node')
    expect(addNodeItems.length).toBe(2) // department + artifact at L1
  })

  it('includes many add-node items at L2 (department)', () => {
    const sections = getPaneContextMenuSections('department', false, true)
    const allItems = sections.flatMap((s) => s.items)
    const addNodeItems = allItems.filter((i) => i.id === 'add-node')
    expect(addNodeItems.length).toBeGreaterThan(1)
  })

  it('no add-node items at workflow scope', () => {
    const sections = getPaneContextMenuSections('workflow', false, true)
    const allItems = sections.flatMap((s) => s.items)
    const addNodeItems = allItems.filter((i) => i.id === 'add-node')
    expect(addNodeItems.length).toBe(0)
  })

  it('includes fit-view and auto-layout', () => {
    const sections = getPaneContextMenuSections('company', false, true)
    const allIds = sections.flatMap((s) => s.items.map((i) => i.id))
    expect(allIds).toContain('fit-view')
    expect(allIds).toContain('auto-layout')
  })

  it('includes select-all when there are nodes', () => {
    const sections = getPaneContextMenuSections('company', false, true)
    const allIds = sections.flatMap((s) => s.items.map((i) => i.id))
    expect(allIds).toContain('select-all')
  })

  it('excludes select-all when there are no nodes', () => {
    const sections = getPaneContextMenuSections('company', false, false)
    const allIds = sections.flatMap((s) => s.items.map((i) => i.id))
    expect(allIds).not.toContain('select-all')
  })

  it('hides add-node in diff mode', () => {
    const sections = getPaneContextMenuSections('company', true, true)
    const allItems = sections.flatMap((s) => s.items)
    const addNodeItems = allItems.filter((i) => i.id === 'add-node')
    expect(addNodeItems.length).toBe(0)
  })
})

describe('getMultiSelectContextMenuSections', () => {
  it('returns deselect-all and delete-selected', () => {
    const sections = getMultiSelectContextMenuSections(['a', 'b', 'c'], false)
    const allIds = sections.flatMap((s) => s.items.map((i) => i.id))
    expect(allIds).toContain('deselect-all')
    expect(allIds).toContain('delete-selected')
  })

  it('shows count in delete label', () => {
    const sections = getMultiSelectContextMenuSections(['a', 'b', 'c'], false)
    const deleteItem = sections.flatMap((s) => s.items).find((i) => i.id === 'delete-selected')
    expect(deleteItem?.label).toBe('Delete 3 Selected')
  })

  it('hides delete in diff mode', () => {
    const sections = getMultiSelectContextMenuSections(['a', 'b'], true)
    const allIds = sections.flatMap((s) => s.items.map((i) => i.id))
    expect(allIds).not.toContain('delete-selected')
  })

  it('returns empty for less than 2 selected', () => {
    const sections = getMultiSelectContextMenuSections(['a'], false)
    expect(sections).toEqual([])
  })
})

describe('resolveEdgeForDeletion', () => {
  it('returns edge data for deletable edges', () => {
    const edges = [makeEdge({ id: 'e1', edgeType: 'owns', sourceId: 's1', targetId: 't1' })]
    const result = resolveEdgeForDeletion('e1', edges)
    expect(result).toEqual({ edgeType: 'owns', sourceId: 's1', targetId: 't1' })
  })

  it('returns null for non-creatable edges', () => {
    const edges = [makeEdge({ id: 'e1', edgeType: 'hands_off_to' })]
    const result = resolveEdgeForDeletion('e1', edges)
    expect(result).toBeNull()
  })

  it('returns null for unknown edge', () => {
    const result = resolveEdgeForDeletion('unknown', [])
    expect(result).toBeNull()
  })
})
