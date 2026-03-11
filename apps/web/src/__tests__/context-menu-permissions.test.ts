import { describe, it, expect } from 'vitest'
import type { VisualNodeDto, VisualEdgeDto } from '@the-crew/shared-types'
import {
  getNodeContextMenuSections,
  getEdgeContextMenuSections,
  getPaneContextMenuSections,
  getMultiSelectContextMenuSections,
} from '@/lib/context-menu-actions'

const mockNode: VisualNodeDto = {
  id: 'vis:department:d1',
  nodeType: 'department',
  entityId: 'd1',
  label: 'Engineering',
  sublabel: null,
  position: null,
  collapsed: false,
  status: 'normal',
  layerIds: ['organization'],
  parentId: null,
}

const mockEdge: VisualEdgeDto = {
  id: 'edge-1',
  edgeType: 'owns',
  sourceId: 'vis:department:d1',
  targetId: 'vis:capability:c1',
  label: null,
  style: 'solid',
  layerIds: ['capabilities'],
}

describe('Context menu permission gating', () => {
  describe('getNodeContextMenuSections with permissions', () => {
    it('hides edit and delete sections when canEdit=false', () => {
      const sections = getNodeContextMenuSections(
        mockNode.id,
        [mockNode],
        [],
        false,
        { canEdit: false, canDelete: false },
      )
      const allIds = sections.flatMap(s => s.items.map(i => i.id))
      expect(allIds).toContain('inspect')
      expect(allIds).toContain('drill-in') // viewer can drilldown
      expect(allIds).not.toContain('edit')
      expect(allIds).not.toContain('create-relationship')
      expect(allIds).not.toContain('delete-node')
    })

    it('shows edit but hides delete when canEdit=true canDelete=false', () => {
      const sections = getNodeContextMenuSections(
        mockNode.id,
        [mockNode],
        [],
        false,
        { canEdit: true, canDelete: false },
      )
      const allIds = sections.flatMap(s => s.items.map(i => i.id))
      expect(allIds).toContain('edit')
      expect(allIds).not.toContain('delete-node')
    })

    it('hides create-relationship when canCreateEdges=false', () => {
      const sections = getNodeContextMenuSections(
        mockNode.id,
        [mockNode],
        [],
        false,
        { canEdit: true, canDelete: true, canCreateEdges: false },
      )
      const allIds = sections.flatMap(s => s.items.map(i => i.id))
      expect(allIds).toContain('edit')
      expect(allIds).not.toContain('create-relationship')
    })

    it('shows all items with full permissions', () => {
      const sections = getNodeContextMenuSections(
        mockNode.id,
        [mockNode],
        [],
        false,
        { canEdit: true, canDelete: true, canCreateEdges: true },
      )
      const allIds = sections.flatMap(s => s.items.map(i => i.id))
      expect(allIds).toContain('edit')
      expect(allIds).toContain('create-relationship')
      expect(allIds).toContain('delete-node')
    })

    it('defaults to full permissions when not provided', () => {
      const sections = getNodeContextMenuSections(
        mockNode.id,
        [mockNode],
        [],
        false,
      )
      const allIds = sections.flatMap(s => s.items.map(i => i.id))
      expect(allIds).toContain('edit')
      expect(allIds).toContain('delete-node')
    })
  })

  describe('getEdgeContextMenuSections with permissions', () => {
    it('hides delete when canDelete=false', () => {
      const sections = getEdgeContextMenuSections(
        mockEdge.id,
        [mockEdge],
        [mockNode],
        false,
        { canDelete: false },
      )
      const allIds = sections.flatMap(s => s.items.map(i => i.id))
      expect(allIds).toContain('inspect-edge')
      expect(allIds).not.toContain('delete-edge')
    })

    it('shows delete when canDelete=true', () => {
      const sections = getEdgeContextMenuSections(
        mockEdge.id,
        [mockEdge],
        [mockNode],
        false,
        { canDelete: true },
      )
      const allIds = sections.flatMap(s => s.items.map(i => i.id))
      expect(allIds).toContain('delete-edge')
    })
  })

  describe('getPaneContextMenuSections with permissions', () => {
    it('hides add-node when canEdit=false', () => {
      const sections = getPaneContextMenuSections('company', false, true, { canEdit: false })
      const allIds = sections.flatMap(s => s.items.map(i => i.id))
      expect(allIds).not.toContain('add-node')
      expect(allIds).toContain('fit-view') // always available
    })

    it('shows add-node when canEdit=true', () => {
      const sections = getPaneContextMenuSections('company', false, true, { canEdit: true })
      const allIds = sections.flatMap(s => s.items.map(i => i.id))
      expect(allIds).toContain('add-node')
    })
  })

  describe('getMultiSelectContextMenuSections with permissions', () => {
    it('hides delete-selected when canDelete=false', () => {
      const sections = getMultiSelectContextMenuSections(['a', 'b'], false, { canDelete: false })
      const allIds = sections.flatMap(s => s.items.map(i => i.id))
      expect(allIds).toContain('deselect-all') // always available
      expect(allIds).not.toContain('delete-selected')
    })

    it('shows delete-selected when canDelete=true', () => {
      const sections = getMultiSelectContextMenuSections(['a', 'b'], false, { canDelete: true })
      const allIds = sections.flatMap(s => s.items.map(i => i.id))
      expect(allIds).toContain('delete-selected')
    })
  })
})
