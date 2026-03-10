import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LayersPanel } from '@/components/visual-shell/explorer/layers-panel'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')))

describe('LayersPanel', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({ activeLayers: ['organization'] })
  })

  it('should render all five layers', () => {
    render(<LayersPanel />)
    expect(screen.getByText('Organization')).toBeInTheDocument()
    expect(screen.getByText('Capabilities')).toBeInTheDocument()
    expect(screen.getByText('Workflows')).toBeInTheDocument()
    expect(screen.getByText('Contracts')).toBeInTheDocument()
    expect(screen.getByText('Governance')).toBeInTheDocument()
  })

  it('should have organization checked by default', () => {
    render(<LayersPanel />)
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0]).toBeChecked()
    expect(checkboxes[1]).not.toBeChecked()
  })

  it('should toggle a layer on click', async () => {
    render(<LayersPanel />)
    const capCheckbox = screen.getAllByRole('checkbox')[1]!
    await userEvent.click(capCheckbox)
    expect(useVisualWorkspaceStore.getState().activeLayers).toContain('capabilities')
  })

  it('should toggle a layer off', async () => {
    render(<LayersPanel />)
    const orgCheckbox = screen.getAllByRole('checkbox')[0]!
    await userEvent.click(orgCheckbox)
    expect(useVisualWorkspaceStore.getState().activeLayers).not.toContain('organization')
  })
})
