import { create } from 'zustand'

const MAX_STACK_SIZE = 50

export interface UndoEntry {
  description: string
  undo: () => Promise<void>
  redo: () => Promise<void>
  undoOnly?: boolean
}

export interface UndoRedoState {
  undoStack: UndoEntry[]
  redoStack: UndoEntry[]
  isExecuting: boolean

  pushAction(entry: UndoEntry): void
  undo(): Promise<void>
  redo(): Promise<void>
  clear(): void
}

export const useUndoRedoStore = create<UndoRedoState>((set, get) => ({
  undoStack: [],
  redoStack: [],
  isExecuting: false,

  pushAction(entry) {
    set((s) => ({
      undoStack: [...s.undoStack, entry].slice(-MAX_STACK_SIZE),
      redoStack: [],
    }))
  },

  async undo() {
    const { undoStack, isExecuting } = get()
    if (isExecuting || undoStack.length === 0) return

    const entry = undoStack[undoStack.length - 1]!
    set({ isExecuting: true })

    try {
      await entry.undo()
      set((s) => ({
        undoStack: s.undoStack.slice(0, -1),
        redoStack: entry.undoOnly ? s.redoStack : [...s.redoStack, entry],
        isExecuting: false,
      }))
    } catch {
      set({ isExecuting: false })
    }
  },

  async redo() {
    const { redoStack, isExecuting } = get()
    if (isExecuting || redoStack.length === 0) return

    const entry = redoStack[redoStack.length - 1]!
    set({ isExecuting: true })

    try {
      await entry.redo()
      set((s) => ({
        redoStack: s.redoStack.slice(0, -1),
        undoStack: [...s.undoStack, entry],
        isExecuting: false,
      }))
    } catch {
      set({ isExecuting: false })
    }
  },

  clear() {
    set({ undoStack: [], redoStack: [] })
  },
}))
