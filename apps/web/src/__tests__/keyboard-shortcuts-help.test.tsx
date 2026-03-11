import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { KeyboardShortcutsHelp } from '@/components/visual-shell/keyboard-shortcuts-help'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

describe('KeyboardShortcutsHelp', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({ showKeyboardHelp: false })
  })

  it('should not render when showKeyboardHelp is false', () => {
    render(<KeyboardShortcutsHelp />)
    expect(screen.queryByTestId('keyboard-shortcuts-help')).toBeNull()
  })

  it('should render when showKeyboardHelp is true', () => {
    useVisualWorkspaceStore.setState({ showKeyboardHelp: true })
    render(<KeyboardShortcutsHelp />)
    expect(screen.getByTestId('keyboard-shortcuts-help')).toBeTruthy()
    expect(screen.getByText('Keyboard Shortcuts')).toBeTruthy()
  })

  it('should show all shortcut sections', () => {
    useVisualWorkspaceStore.setState({ showKeyboardHelp: true })
    render(<KeyboardShortcutsHelp />)
    expect(screen.getByText('Modes')).toBeTruthy()
    expect(screen.getByText('Navigation')).toBeTruthy()
    expect(screen.getByText('Editing')).toBeTruthy()
    expect(screen.getByText('Panels & View')).toBeTruthy()
    expect(screen.getByText('General')).toBeTruthy()
  })

  it('should show undo/redo shortcuts', () => {
    useVisualWorkspaceStore.setState({ showKeyboardHelp: true })
    render(<KeyboardShortcutsHelp />)
    expect(screen.getByText('Undo')).toBeTruthy()
    expect(screen.getByText('Redo')).toBeTruthy()
    expect(screen.getByText('Select all')).toBeTruthy()
  })

  it('should dismiss on close button click', () => {
    useVisualWorkspaceStore.setState({ showKeyboardHelp: true })
    render(<KeyboardShortcutsHelp />)
    fireEvent.click(screen.getByTestId('close-keyboard-help'))
    expect(useVisualWorkspaceStore.getState().showKeyboardHelp).toBe(false)
  })

  it('should dismiss on backdrop click', () => {
    useVisualWorkspaceStore.setState({ showKeyboardHelp: true })
    render(<KeyboardShortcutsHelp />)
    fireEvent.click(screen.getByTestId('keyboard-shortcuts-help'))
    expect(useVisualWorkspaceStore.getState().showKeyboardHelp).toBe(false)
  })
})
