import { describe, it, expect, beforeEach } from 'vitest'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

beforeEach(() => {
  useVisualWorkspaceStore.setState({
    contextMenu: null,
  })
})

describe('context menu store', () => {
  it('showContextMenu sets state', () => {
    useVisualWorkspaceStore.getState().showContextMenu(100, 200, 'node', 'n1')
    expect(useVisualWorkspaceStore.getState().contextMenu).toEqual({
      x: 100,
      y: 200,
      type: 'node',
      targetId: 'n1',
    })
  })

  it('showContextMenu for pane (no targetId)', () => {
    useVisualWorkspaceStore.getState().showContextMenu(50, 75, 'pane')
    expect(useVisualWorkspaceStore.getState().contextMenu).toEqual({
      x: 50,
      y: 75,
      type: 'pane',
      targetId: undefined,
    })
  })

  it('showContextMenu for edge', () => {
    useVisualWorkspaceStore.getState().showContextMenu(10, 20, 'edge', 'e1')
    expect(useVisualWorkspaceStore.getState().contextMenu).toEqual({
      x: 10,
      y: 20,
      type: 'edge',
      targetId: 'e1',
    })
  })

  it('showContextMenu for multi-select', () => {
    useVisualWorkspaceStore.getState().showContextMenu(10, 20, 'multi-select', 'n1')
    expect(useVisualWorkspaceStore.getState().contextMenu).toEqual({
      x: 10,
      y: 20,
      type: 'multi-select',
      targetId: 'n1',
    })
  })

  it('dismissContextMenu clears state', () => {
    useVisualWorkspaceStore.getState().showContextMenu(100, 200, 'node', 'n1')
    useVisualWorkspaceStore.getState().dismissContextMenu()
    expect(useVisualWorkspaceStore.getState().contextMenu).toBeNull()
  })

  it('dismissContextMenu is no-op when already null', () => {
    useVisualWorkspaceStore.getState().dismissContextMenu()
    expect(useVisualWorkspaceStore.getState().contextMenu).toBeNull()
  })

  it('showContextMenu replaces previous menu', () => {
    useVisualWorkspaceStore.getState().showContextMenu(100, 200, 'node', 'n1')
    useVisualWorkspaceStore.getState().showContextMenu(300, 400, 'edge', 'e1')
    expect(useVisualWorkspaceStore.getState().contextMenu).toEqual({
      x: 300,
      y: 400,
      type: 'edge',
      targetId: 'e1',
    })
  })
})
