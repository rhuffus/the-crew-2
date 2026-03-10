import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { VisualNodeDto } from '@the-crew/shared-types'
import { CanvasSummary } from '@/components/visual-shell/inspector/canvas-summary'
import {
  allMockNodes,
  allMockEdges,
} from './fixtures/visual-graph'

describe('CanvasSummary', () => {
  it('should render canvas summary', () => {
    render(<CanvasSummary nodes={allMockNodes} edges={allMockEdges} />)
    expect(screen.getByTestId('canvas-summary')).toBeInTheDocument()
  })

  it('should show node count', () => {
    render(<CanvasSummary nodes={allMockNodes} edges={allMockEdges} />)
    expect(screen.getByText(`Nodes (${allMockNodes.length})`)).toBeInTheDocument()
  })

  it('should show edge count', () => {
    render(<CanvasSummary nodes={allMockNodes} edges={allMockEdges} />)
    expect(screen.getByText(`Edges (${allMockEdges.length})`)).toBeInTheDocument()
  })

  it('should show counts by node type', () => {
    render(<CanvasSummary nodes={allMockNodes} edges={allMockEdges} />)
    expect(screen.getByText('Department')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
    expect(screen.getByText('Company')).toBeInTheDocument()
  })

  it('should show counts by edge type', () => {
    render(<CanvasSummary nodes={allMockNodes} edges={allMockEdges} />)
    expect(screen.getByText('Reports To')).toBeInTheDocument()
    expect(screen.getByText('Owns')).toBeInTheDocument()
    expect(screen.getByText('Contributes To')).toBeInTheDocument()
  })

  it('should show validation summary when errors/warnings exist', () => {
    // mockCapabilityNode has status 'warning', mockContractNode has status 'error'
    render(<CanvasSummary nodes={allMockNodes} edges={allMockEdges} />)
    expect(screen.getByText('Validation')).toBeInTheDocument()
    expect(screen.getByText('1 error')).toBeInTheDocument()
    expect(screen.getByText('1 warning')).toBeInTheDocument()
  })

  it('should not show validation section when all normal', () => {
    const normalNodes = allMockNodes.map((n) => ({ ...n, status: 'normal' as const }))
    render(<CanvasSummary nodes={normalNodes} edges={allMockEdges} />)
    expect(screen.queryByText('Validation')).not.toBeInTheDocument()
  })

  it('should show empty state for no nodes', () => {
    render(<CanvasSummary nodes={[]} edges={[]} />)
    expect(screen.getByText('No nodes in view.')).toBeInTheDocument()
    expect(screen.getByText('No edges in view.')).toBeInTheDocument()
  })

  it('should show plural form for multiple errors', () => {
    const errorNodes: VisualNodeDto[] = [
      { ...allMockNodes[0]!, status: 'error' },
      { ...allMockNodes[1]!, status: 'error' },
    ]
    render(<CanvasSummary nodes={errorNodes} edges={[]} />)
    expect(screen.getByText('2 errors')).toBeInTheDocument()
  })
})
