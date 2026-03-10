import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RelationsTab } from '@/components/visual-shell/inspector/relations-tab'
import {
  mockDeptNode,
  mockRoleNode,
  mockCapabilityNode,
  mockCompanyNode,
  allMockNodes,
  mockOwnsEdge,
  mockReportsToEdge,
  mockContributesToEdge,
  mockHandsOffToEdge,
} from './fixtures/visual-graph'

describe('RelationsTab', () => {
  it('should render relations tab', () => {
    render(
      <RelationsTab node={mockDeptNode} relatedEdges={[mockOwnsEdge]} allNodes={allMockNodes} />,
    )
    expect(screen.getByTestId('relations-tab')).toBeInTheDocument()
  })

  it('should show no relations message when empty', () => {
    render(
      <RelationsTab node={mockCompanyNode} relatedEdges={[]} allNodes={allMockNodes} />,
    )
    expect(screen.getByText('No relations found.')).toBeInTheDocument()
  })

  it('should show outgoing relations', () => {
    render(
      <RelationsTab node={mockDeptNode} relatedEdges={[mockOwnsEdge]} allNodes={allMockNodes} />,
    )
    expect(screen.getByText('Outgoing')).toBeInTheDocument()
    expect(screen.getByText('Owns')).toBeInTheDocument()
    expect(screen.getByText('Brand Management')).toBeInTheDocument()
  })

  it('should show incoming relations', () => {
    render(
      <RelationsTab
        node={mockCapabilityNode}
        relatedEdges={[mockOwnsEdge]}
        allNodes={allMockNodes}
      />,
    )
    expect(screen.getByText('Incoming')).toBeInTheDocument()
    expect(screen.getByText('Marketing')).toBeInTheDocument()
  })

  it('should show both incoming and outgoing', () => {
    render(
      <RelationsTab
        node={mockDeptNode}
        relatedEdges={[mockOwnsEdge, mockReportsToEdge]}
        allNodes={allMockNodes}
      />,
    )
    expect(screen.getByText('Outgoing')).toBeInTheDocument()
    expect(screen.getByText('Owns')).toBeInTheDocument()
  })

  it('should use visual ID as fallback when other node not in graph', () => {
    render(
      <RelationsTab
        node={mockDeptNode}
        relatedEdges={[mockReportsToEdge]}
        allNodes={[mockDeptNode]}
      />,
    )
    // The target dept:xyz is not in allNodes, so it falls back to ID
    expect(screen.getByText('dept:xyz')).toBeInTheDocument()
  })

  it('should show role outgoing to capability via contributes_to', () => {
    render(
      <RelationsTab
        node={mockRoleNode}
        relatedEdges={[mockContributesToEdge]}
        allNodes={allMockNodes}
      />,
    )
    expect(screen.getByText('Outgoing')).toBeInTheDocument()
    expect(screen.getByText('Contributes To')).toBeInTheDocument()
    expect(screen.getByText('Brand Management')).toBeInTheDocument()
  })

  // Remove button tests
  it('should show remove button for deletable edges when onRemoveRelation provided', () => {
    render(
      <RelationsTab
        node={mockDeptNode}
        relatedEdges={[mockOwnsEdge]}
        allNodes={allMockNodes}
        onRemoveRelation={vi.fn()}
      />,
    )
    expect(screen.getByTestId(`remove-relation-${mockOwnsEdge.id}`)).toBeInTheDocument()
  })

  it('should not show remove button when onRemoveRelation not provided', () => {
    render(
      <RelationsTab node={mockDeptNode} relatedEdges={[mockOwnsEdge]} allNodes={allMockNodes} />,
    )
    expect(screen.queryByTestId(`remove-relation-${mockOwnsEdge.id}`)).not.toBeInTheDocument()
  })

  it('should not show remove button for hands_off_to edge', () => {
    render(
      <RelationsTab
        node={mockDeptNode}
        relatedEdges={[mockHandsOffToEdge]}
        allNodes={allMockNodes}
        onRemoveRelation={vi.fn()}
      />,
    )
    expect(screen.queryByTestId(`remove-relation-${mockHandsOffToEdge.id}`)).not.toBeInTheDocument()
  })

  it('should call onRemoveRelation with edge details when remove button clicked', () => {
    const onRemoveRelation = vi.fn()
    render(
      <RelationsTab
        node={mockDeptNode}
        relatedEdges={[mockOwnsEdge]}
        allNodes={allMockNodes}
        onRemoveRelation={onRemoveRelation}
      />,
    )
    fireEvent.click(screen.getByTestId(`remove-relation-${mockOwnsEdge.id}`))
    expect(onRemoveRelation).toHaveBeenCalledWith('owns', 'dept:abc', 'cap:c1')
  })

  it('should call onRemoveRelation with correct source/target for incoming relation', () => {
    const onRemoveRelation = vi.fn()
    render(
      <RelationsTab
        node={mockCapabilityNode}
        relatedEdges={[mockOwnsEdge]}
        allNodes={allMockNodes}
        onRemoveRelation={onRemoveRelation}
      />,
    )
    fireEvent.click(screen.getByTestId(`remove-relation-${mockOwnsEdge.id}`))
    // source/target are always the original edge source/target
    expect(onRemoveRelation).toHaveBeenCalledWith('owns', 'dept:abc', 'cap:c1')
  })
})
