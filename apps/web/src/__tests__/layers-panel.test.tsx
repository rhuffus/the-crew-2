import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LayersPanel } from '@/components/visual-shell/explorer/layers-panel'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')))

describe('LayersPanel (deprecated re-export)', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({ activeLayers: ['organization'] })
  })

  it('should render as OverlaysPanel via deprecated alias', () => {
    render(<LayersPanel />)
    expect(screen.getByTestId('overlays-panel')).toBeInTheDocument()
    expect(screen.getByText('Overlays')).toBeInTheDocument()
  })
})
