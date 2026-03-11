import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useUndoRedoStore } from '@/stores/undo-redo-store'

function makeEntry(desc: string, opts?: { undoOnly?: boolean }) {
  return {
    description: desc,
    undo: vi.fn().mockResolvedValue(undefined),
    redo: vi.fn().mockResolvedValue(undefined),
    ...(opts?.undoOnly ? { undoOnly: true } : {}),
  }
}

describe('useUndoRedoStore', () => {
  beforeEach(() => {
    useUndoRedoStore.setState({ undoStack: [], redoStack: [], isExecuting: false })
  })

  it('should start with empty stacks', () => {
    const state = useUndoRedoStore.getState()
    expect(state.undoStack).toEqual([])
    expect(state.redoStack).toEqual([])
    expect(state.isExecuting).toBe(false)
  })

  it('should push action to undo stack', () => {
    const entry = makeEntry('Create edge')
    useUndoRedoStore.getState().pushAction(entry)
    expect(useUndoRedoStore.getState().undoStack).toHaveLength(1)
    expect(useUndoRedoStore.getState().undoStack[0]!.description).toBe('Create edge')
  })

  it('should clear redo stack when pushing new action', () => {
    const e1 = makeEntry('Action 1')
    const e2 = makeEntry('Action 2')
    useUndoRedoStore.getState().pushAction(e1)
    // Manually set redo stack
    useUndoRedoStore.setState({ redoStack: [e2] })
    useUndoRedoStore.getState().pushAction(makeEntry('Action 3'))
    expect(useUndoRedoStore.getState().redoStack).toEqual([])
  })

  it('should limit undo stack to 50 entries', () => {
    for (let i = 0; i < 55; i++) {
      useUndoRedoStore.getState().pushAction(makeEntry(`Action ${i}`))
    }
    expect(useUndoRedoStore.getState().undoStack).toHaveLength(50)
    expect(useUndoRedoStore.getState().undoStack[0]!.description).toBe('Action 5')
  })

  it('should undo last action', async () => {
    const entry = makeEntry('Create edge')
    useUndoRedoStore.getState().pushAction(entry)
    await useUndoRedoStore.getState().undo()
    expect(entry.undo).toHaveBeenCalledOnce()
    expect(useUndoRedoStore.getState().undoStack).toHaveLength(0)
    expect(useUndoRedoStore.getState().redoStack).toHaveLength(1)
  })

  it('should redo last undone action', async () => {
    const entry = makeEntry('Create edge')
    useUndoRedoStore.getState().pushAction(entry)
    await useUndoRedoStore.getState().undo()
    await useUndoRedoStore.getState().redo()
    expect(entry.redo).toHaveBeenCalledOnce()
    expect(useUndoRedoStore.getState().redoStack).toHaveLength(0)
    expect(useUndoRedoStore.getState().undoStack).toHaveLength(1)
  })

  it('should not undo when stack is empty', async () => {
    await useUndoRedoStore.getState().undo()
    expect(useUndoRedoStore.getState().undoStack).toHaveLength(0)
  })

  it('should not redo when stack is empty', async () => {
    await useUndoRedoStore.getState().redo()
    expect(useUndoRedoStore.getState().redoStack).toHaveLength(0)
  })

  it('should handle undo/redo chain correctly', async () => {
    const e1 = makeEntry('Action 1')
    const e2 = makeEntry('Action 2')
    useUndoRedoStore.getState().pushAction(e1)
    useUndoRedoStore.getState().pushAction(e2)

    await useUndoRedoStore.getState().undo()
    expect(e2.undo).toHaveBeenCalledOnce()
    expect(useUndoRedoStore.getState().undoStack).toHaveLength(1)
    expect(useUndoRedoStore.getState().redoStack).toHaveLength(1)

    await useUndoRedoStore.getState().undo()
    expect(e1.undo).toHaveBeenCalledOnce()
    expect(useUndoRedoStore.getState().undoStack).toHaveLength(0)
    expect(useUndoRedoStore.getState().redoStack).toHaveLength(2)

    await useUndoRedoStore.getState().redo()
    expect(e1.redo).toHaveBeenCalledOnce()
    expect(useUndoRedoStore.getState().undoStack).toHaveLength(1)
    expect(useUndoRedoStore.getState().redoStack).toHaveLength(1)
  })

  it('should not push undoOnly entries to redo stack', async () => {
    const entry = makeEntry('Create entity', { undoOnly: true })
    useUndoRedoStore.getState().pushAction(entry)
    await useUndoRedoStore.getState().undo()
    expect(entry.undo).toHaveBeenCalledOnce()
    expect(useUndoRedoStore.getState().redoStack).toHaveLength(0)
  })

  it('should handle undo error gracefully', async () => {
    const entry = {
      description: 'Failing undo',
      undo: vi.fn().mockRejectedValue(new Error('fail')),
      redo: vi.fn().mockResolvedValue(undefined),
    }
    useUndoRedoStore.getState().pushAction(entry)
    await useUndoRedoStore.getState().undo()
    expect(useUndoRedoStore.getState().isExecuting).toBe(false)
    // Entry stays in undo stack on error
    expect(useUndoRedoStore.getState().undoStack).toHaveLength(1)
  })

  it('should handle redo error gracefully', async () => {
    const entry = {
      description: 'Failing redo',
      undo: vi.fn().mockResolvedValue(undefined),
      redo: vi.fn().mockRejectedValue(new Error('fail')),
    }
    useUndoRedoStore.getState().pushAction(entry)
    await useUndoRedoStore.getState().undo()
    await useUndoRedoStore.getState().redo()
    expect(useUndoRedoStore.getState().isExecuting).toBe(false)
  })

  it('should not execute while already executing', async () => {
    const entry = makeEntry('Action')
    useUndoRedoStore.getState().pushAction(entry)
    useUndoRedoStore.setState({ isExecuting: true })
    await useUndoRedoStore.getState().undo()
    expect(entry.undo).not.toHaveBeenCalled()
  })

  it('should clear both stacks', () => {
    useUndoRedoStore.getState().pushAction(makeEntry('A'))
    useUndoRedoStore.setState({ redoStack: [makeEntry('B')] })
    useUndoRedoStore.getState().clear()
    expect(useUndoRedoStore.getState().undoStack).toHaveLength(0)
    expect(useUndoRedoStore.getState().redoStack).toHaveLength(0)
  })
})
