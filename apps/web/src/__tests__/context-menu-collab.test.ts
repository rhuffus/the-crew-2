import { describe, it, expect } from 'vitest'
import { getNodeContextMenuSections, getPaneContextMenuSections } from '@/lib/context-menu-actions'
import type { VisualNodeDto } from '@the-crew/shared-types'

const makeNode = (overrides: Partial<VisualNodeDto> = {}): VisualNodeDto => ({
  id: 'n1',
  label: 'Test',
  sublabel: null,
  nodeType: 'department',
  entityId: 'e1',
  status: 'normal',
  collapsed: false,
  layerIds: ['organization'],
  parentId: null,
  position: null,
  ...overrides,
})

describe('context menu collaboration actions', () => {
  it('node context menu includes "Add Comment" when canComment=true', () => {
    const nodes = [makeNode()]
    const sections = getNodeContextMenuSections('n1', nodes, [], false, { canComment: true })
    const allItems = sections.flatMap((s) => s.items)
    const commentAction = allItems.find((a) => a.id === 'add-comment')
    expect(commentAction).toBeDefined()
    expect(commentAction!.label).toBe('Add Comment')
  })

  it('node context menu excludes "Add Comment" when canComment=false', () => {
    const nodes = [makeNode()]
    const sections = getNodeContextMenuSections('n1', nodes, [], false, { canComment: false })
    const allItems = sections.flatMap((s) => s.items)
    const commentAction = allItems.find((a) => a.id === 'add-comment')
    expect(commentAction).toBeUndefined()
  })

  it('pane context menu includes "Add Comment to Scope" when canComment=true', () => {
    const sections = getPaneContextMenuSections('company', false, true, { canComment: true })
    const allItems = sections.flatMap((s) => s.items)
    const commentAction = allItems.find((a) => a.id === 'add-comment')
    expect(commentAction).toBeDefined()
    expect(commentAction!.label).toBe('Add Comment to Scope')
  })

  it('pane context menu excludes comment action in diff mode', () => {
    const sections = getPaneContextMenuSections('company', true, true, { canComment: true })
    const allItems = sections.flatMap((s) => s.items)
    const commentAction = allItems.find((a) => a.id === 'add-comment')
    expect(commentAction).toBeUndefined()
  })
})
