import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EntityFormDialog } from '@/components/visual-shell/entity-form-dialog'
import { KeyboardShortcutsHelp } from '@/components/visual-shell/keyboard-shortcuts-help'
import { EdgeDeleteConfirm } from '@/components/visual-shell/edge-delete-confirm'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { allMockNodes } from './fixtures/visual-graph'

vi.mock('@/hooks/use-entity-form-data', () => ({
  useEntityFormData: () => ({
    optionsMap: {},
    isLoading: false,
  }),
}))

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

describe('EntityFormDialog a11y', () => {
  it('should have role="dialog" and aria-modal', () => {
    renderWithQuery(
      <EntityFormDialog
        nodeType="department"
        projectId="p1"
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    const dialog = screen.getByTestId('entity-form-dialog')
    expect(dialog.getAttribute('role')).toBe('dialog')
    expect(dialog.getAttribute('aria-modal')).toBe('true')
  })

  it('should have aria-labelledby pointing to the title', () => {
    renderWithQuery(
      <EntityFormDialog
        nodeType="department"
        projectId="p1"
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    const dialog = screen.getByTestId('entity-form-dialog')
    const labelledBy = dialog.getAttribute('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    const title = document.getElementById(labelledBy!)
    expect(title).toBeTruthy()
    expect(title!.textContent).toContain('Department')
  })

  it('should have htmlFor on labels linked to input ids', () => {
    renderWithQuery(
      <EntityFormDialog
        nodeType="department"
        projectId="p1"
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    const nameInput = screen.getByTestId('input-name')
    expect(nameInput.id).toBeTruthy()
    const label = document.querySelector(`label[for="${nameInput.id}"]`)
    expect(label).toBeTruthy()
    expect(label!.textContent).toContain('Name')
  })
})

describe('KeyboardShortcutsHelp a11y', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({ showKeyboardHelp: false })
  })

  it('should have role="dialog" and aria-modal when visible', () => {
    useVisualWorkspaceStore.setState({ showKeyboardHelp: true })
    render(<KeyboardShortcutsHelp />)
    const dialog = screen.getByRole('dialog')
    expect(dialog.getAttribute('aria-modal')).toBe('true')
  })

  it('should have aria-labelledby pointing to the title', () => {
    useVisualWorkspaceStore.setState({ showKeyboardHelp: true })
    render(<KeyboardShortcutsHelp />)
    const dialog = screen.getByRole('dialog')
    const labelledBy = dialog.getAttribute('aria-labelledby')
    expect(labelledBy).toBe('keyboard-shortcuts-title')
    const title = document.getElementById(labelledBy!)
    expect(title!.textContent).toBe('Keyboard Shortcuts')
  })
})

describe('EdgeDeleteConfirm a11y', () => {
  const defaultProps = {
    edgeType: 'owns' as const,
    sourceNodeId: 'dept:abc',
    targetNodeId: 'cap:c1',
    allNodes: allMockNodes,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  }

  it('should have role="alertdialog" and aria-modal', () => {
    render(<EdgeDeleteConfirm {...defaultProps} />)
    const dialog = screen.getByTestId('edge-delete-confirm')
    expect(dialog.getAttribute('role')).toBe('alertdialog')
    expect(dialog.getAttribute('aria-modal')).toBe('true')
  })

  it('should have aria-labelledby pointing to the title', () => {
    render(<EdgeDeleteConfirm {...defaultProps} />)
    const dialog = screen.getByTestId('edge-delete-confirm')
    const labelledBy = dialog.getAttribute('aria-labelledby')
    expect(labelledBy).toBe('edge-delete-title')
    const title = document.getElementById(labelledBy!)
    expect(title!.textContent).toBe('Delete relationship?')
  })
})
