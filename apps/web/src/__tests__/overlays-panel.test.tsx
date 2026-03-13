import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OverlaysPanel } from '@/components/visual-shell/explorer/overlays-panel'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')))

describe('OverlaysPanel', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({ activeLayers: ['organization'] })
  })

  it('should render all five overlays', () => {
    render(<OverlaysPanel />)
    expect(screen.getByText('Organization')).toBeInTheDocument()
    expect(screen.getByText('Work')).toBeInTheDocument()
    expect(screen.getByText('Deliverables')).toBeInTheDocument()
    expect(screen.getByText('Rules')).toBeInTheDocument()
    expect(screen.getByText('Live Status')).toBeInTheDocument()
  })

  it('should have Organization checked and disabled (locked)', () => {
    render(<OverlaysPanel />)
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0]).toBeChecked()
    expect(checkboxes[0]).toBeDisabled()
  })

  it('should not toggle Organization overlay on click', async () => {
    render(<OverlaysPanel />)
    const orgCheckbox = screen.getAllByRole('checkbox')[0]!
    await userEvent.click(orgCheckbox)
    expect(useVisualWorkspaceStore.getState().activeLayers).toContain('organization')
  })

  it('should toggle Work overlay on', async () => {
    render(<OverlaysPanel />)
    const workCheckbox = screen.getAllByRole('checkbox')[1]!
    await userEvent.click(workCheckbox)
    expect(useVisualWorkspaceStore.getState().activeLayers).toContain('workflows')
  })

  it('should toggle Work overlay off', async () => {
    useVisualWorkspaceStore.setState({ activeLayers: ['organization', 'workflows'] })
    render(<OverlaysPanel />)
    const workCheckbox = screen.getAllByRole('checkbox')[1]!
    await userEvent.click(workCheckbox)
    expect(useVisualWorkspaceStore.getState().activeLayers).not.toContain('workflows')
  })

  it('should toggle Rules overlay on (activates contracts + governance layers)', async () => {
    render(<OverlaysPanel />)
    const rulesCheckbox = screen.getAllByRole('checkbox')[3]!
    await userEvent.click(rulesCheckbox)
    const layers = useVisualWorkspaceStore.getState().activeLayers
    expect(layers).toContain('contracts')
    expect(layers).toContain('governance')
  })

  it('should use overlays-panel testid', () => {
    render(<OverlaysPanel />)
    expect(screen.getByTestId('overlays-panel')).toBeInTheDocument()
  })

  it('should show heading as Overlays', () => {
    render(<OverlaysPanel />)
    expect(screen.getByText('Overlays')).toBeInTheDocument()
  })
})
