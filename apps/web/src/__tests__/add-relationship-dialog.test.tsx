import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  AddRelationshipDialog,
  getAvailableEdgeTypes,
} from '@/components/visual-shell/inspector/add-relationship-dialog'
import { CONNECTION_RULES } from '@the-crew/shared-types'
import {
  mockDeptNode,
  mockRoleNode,
  mockCapabilityNode,
  mockWorkflowNode,
  allMockNodes,
  allMockEdges,
  mockOwnsEdge,
} from './fixtures/visual-graph'

describe('getAvailableEdgeTypes', () => {
  it('should return outgoing and incoming options for department', () => {
    const options = getAvailableEdgeTypes('department', CONNECTION_RULES)
    const outgoing = options.filter((o) => o.direction === 'outgoing')
    const incoming = options.filter((o) => o.direction === 'incoming')

    expect(outgoing.length).toBeGreaterThan(0)
    expect(incoming.length).toBeGreaterThan(0)

    const outEdgeTypes = outgoing.map((o) => o.edgeType)
    expect(outEdgeTypes).toContain('reports_to')
    expect(outEdgeTypes).toContain('owns')
    expect(outEdgeTypes).toContain('provides')
    expect(outEdgeTypes).toContain('consumes')
    expect(outEdgeTypes).toContain('participates_in')
  })

  it('should exclude hands_off_to', () => {
    const options = getAvailableEdgeTypes('workflow-stage', CONNECTION_RULES)
    expect(options.every((o) => o.edgeType !== 'hands_off_to')).toBe(true)
  })

  it('should merge compatible node types for same edge type and direction', () => {
    const options = getAvailableEdgeTypes('department', CONNECTION_RULES)
    const owns = options.find((o) => o.edgeType === 'owns' && o.direction === 'outgoing')
    expect(owns).toBeDefined()
    expect(owns!.compatibleNodeTypes).toContain('capability')
    expect(owns!.compatibleNodeTypes).toContain('workflow')
  })

  it('should return incoming options for capability', () => {
    const options = getAvailableEdgeTypes('capability', CONNECTION_RULES)
    const incoming = options.filter((o) => o.direction === 'incoming')
    const inEdgeTypes = incoming.map((o) => o.edgeType)
    expect(inEdgeTypes).toContain('owns')
    expect(inEdgeTypes).toContain('contributes_to')
  })

  it('should return empty for node type with no rules', () => {
    const options = getAvailableEdgeTypes('agent-assignment', CONNECTION_RULES)
    expect(options).toEqual([])
  })
})

describe('AddRelationshipDialog', () => {
  const defaultProps = {
    node: mockDeptNode,
    allNodes: allMockNodes,
    allEdges: allMockEdges,
    onAdd: vi.fn(),
    onCancel: vi.fn(),
  }

  it('should render the dialog', () => {
    render(<AddRelationshipDialog {...defaultProps} />)
    expect(screen.getByTestId('add-relationship-dialog')).toBeInTheDocument()
    expect(screen.getByText('Add Relationship')).toBeInTheDocument()
  })

  it('should show edge type select with options', () => {
    render(<AddRelationshipDialog {...defaultProps} />)
    const select = screen.getByTestId('edge-type-select') as HTMLSelectElement
    expect(select).toBeInTheDocument()
    // Should have optgroup elements for outgoing and incoming
    const optgroups = select.querySelectorAll('optgroup')
    expect(optgroups.length).toBe(2)
    expect(optgroups[0]!.label).toBe('Outgoing')
    expect(optgroups[1]!.label).toBe('Incoming')
    // Should have options beyond the "Select..." placeholder
    expect(select.options.length).toBeGreaterThan(1)
  })

  it('should not show entity select before edge type is chosen', () => {
    render(<AddRelationshipDialog {...defaultProps} />)
    expect(screen.queryByTestId('entity-select')).not.toBeInTheDocument()
  })

  it('should show entity select after edge type is chosen', () => {
    render(<AddRelationshipDialog {...defaultProps} />)
    // Select first option (outgoing)
    const edgeSelect = screen.getByTestId('edge-type-select')
    fireEvent.change(edgeSelect, { target: { value: '0' } })
    expect(screen.getByTestId('entity-select')).toBeInTheDocument()
  })

  it('should filter entities by compatible node types', () => {
    render(<AddRelationshipDialog {...defaultProps} />)
    const edgeSelect = screen.getByTestId('edge-type-select')

    // Find the "contributes_to" incoming option (from role → capability)
    // For department, "owns" outgoing should target capabilities and workflows
    const options = getAvailableEdgeTypes('department', CONNECTION_RULES)
    const ownsIdx = options.findIndex((o) => o.edgeType === 'owns' && o.direction === 'outgoing')
    fireEvent.change(edgeSelect, { target: { value: String(ownsIdx) } })

    const entitySelect = screen.getByTestId('entity-select')
    const entityOptions = entitySelect.querySelectorAll('option')
    // "Select entity..." + matching nodes (capability + workflow minus self)
    const optionTexts = [...entityOptions].map((o) => o.textContent)
    expect(optionTexts.some((t) => t?.includes('Brand Management'))).toBe(true)
    expect(optionTexts.some((t) => t?.includes('Onboarding'))).toBe(true)
    // Should NOT include other departments or non-matching types
    expect(optionTexts.every((t) => !t?.includes('CMO'))).toBe(true)
  })

  it('should show no candidates message when no compatible entities exist', () => {
    // Use a role node — role as source for contributes_to → capability
    // But pass no capability nodes
    const nodesWithoutCap = allMockNodes.filter((n) => n.nodeType !== 'capability')
    render(
      <AddRelationshipDialog
        {...defaultProps}
        node={mockRoleNode}
        allNodes={nodesWithoutCap}
      />,
    )
    const options = getAvailableEdgeTypes('role', CONNECTION_RULES)
    const contIdx = options.findIndex((o) => o.edgeType === 'contributes_to' && o.direction === 'outgoing')
    fireEvent.change(screen.getByTestId('edge-type-select'), { target: { value: String(contIdx) } })
    expect(screen.getByTestId('no-candidates')).toBeInTheDocument()
  })

  it('should show responsibility input for participates_in', () => {
    render(<AddRelationshipDialog {...defaultProps} />)
    const options = getAvailableEdgeTypes('department', CONNECTION_RULES)
    const partIdx = options.findIndex((o) => o.edgeType === 'participates_in' && o.direction === 'outgoing')
    fireEvent.change(screen.getByTestId('edge-type-select'), { target: { value: String(partIdx) } })
    // Select a workflow entity
    fireEvent.change(screen.getByTestId('entity-select'), { target: { value: mockWorkflowNode.id } })
    expect(screen.getByTestId('add-responsibility-input')).toBeInTheDocument()
  })

  it('should disable Add button when form is incomplete', () => {
    render(<AddRelationshipDialog {...defaultProps} />)
    expect(screen.getByTestId('add-confirm-btn')).toBeDisabled()
  })

  it('should enable Add button when form is complete', () => {
    render(<AddRelationshipDialog {...defaultProps} />)
    const options = getAvailableEdgeTypes('department', CONNECTION_RULES)
    const ownsIdx = options.findIndex((o) => o.edgeType === 'owns' && o.direction === 'outgoing')
    fireEvent.change(screen.getByTestId('edge-type-select'), { target: { value: String(ownsIdx) } })
    fireEvent.change(screen.getByTestId('entity-select'), { target: { value: mockCapabilityNode.id } })
    // Add button should be enabled (no metadata required for "owns")
    // But this is a duplicate! Let's use a different node
    // Actually checkDuplicate might flag it — let me use mockWorkflowNode which is also an owns target
    fireEvent.change(screen.getByTestId('entity-select'), { target: { value: mockWorkflowNode.id } })
    expect(screen.getByTestId('add-confirm-btn')).not.toBeDisabled()
  })

  it('should call onAdd with outgoing source/target when submitted', () => {
    const onAdd = vi.fn()
    render(<AddRelationshipDialog {...defaultProps} onAdd={onAdd} />)
    const options = getAvailableEdgeTypes('department', CONNECTION_RULES)
    const ownsIdx = options.findIndex((o) => o.edgeType === 'owns' && o.direction === 'outgoing')
    fireEvent.change(screen.getByTestId('edge-type-select'), { target: { value: String(ownsIdx) } })
    fireEvent.change(screen.getByTestId('entity-select'), { target: { value: mockWorkflowNode.id } })
    fireEvent.click(screen.getByTestId('add-confirm-btn'))
    // Outgoing: source = current node, target = selected entity
    expect(onAdd).toHaveBeenCalledWith('owns', mockDeptNode.id, mockWorkflowNode.id, undefined)
  })

  it('should call onAdd with incoming source/target when submitted', () => {
    const onAdd = vi.fn()
    render(<AddRelationshipDialog {...defaultProps} node={mockCapabilityNode} allEdges={[]} onAdd={onAdd} />)
    const options = getAvailableEdgeTypes('capability', CONNECTION_RULES)
    const contIdx = options.findIndex((o) => o.edgeType === 'contributes_to' && o.direction === 'incoming')
    fireEvent.change(screen.getByTestId('edge-type-select'), { target: { value: String(contIdx) } })
    fireEvent.change(screen.getByTestId('entity-select'), { target: { value: mockRoleNode.id } })
    fireEvent.click(screen.getByTestId('add-confirm-btn'))
    // Incoming: source = selected entity, target = current node
    expect(onAdd).toHaveBeenCalledWith('contributes_to', mockRoleNode.id, mockCapabilityNode.id, undefined)
  })

  it('should include metadata for participates_in', () => {
    const onAdd = vi.fn()
    render(<AddRelationshipDialog {...defaultProps} onAdd={onAdd} />)
    const options = getAvailableEdgeTypes('department', CONNECTION_RULES)
    const partIdx = options.findIndex((o) => o.edgeType === 'participates_in' && o.direction === 'outgoing')
    fireEvent.change(screen.getByTestId('edge-type-select'), { target: { value: String(partIdx) } })
    fireEvent.change(screen.getByTestId('entity-select'), { target: { value: mockWorkflowNode.id } })
    fireEvent.change(screen.getByTestId('add-responsibility-input'), { target: { value: 'Lead facilitator' } })
    fireEvent.click(screen.getByTestId('add-confirm-btn'))
    expect(onAdd).toHaveBeenCalledWith(
      'participates_in',
      mockDeptNode.id,
      mockWorkflowNode.id,
      { responsibility: 'Lead facilitator' },
    )
  })

  it('should show duplicate warning for exact duplicate', () => {
    render(<AddRelationshipDialog {...defaultProps} allEdges={[mockOwnsEdge]} />)
    const options = getAvailableEdgeTypes('department', CONNECTION_RULES)
    const ownsIdx = options.findIndex((o) => o.edgeType === 'owns' && o.direction === 'outgoing')
    fireEvent.change(screen.getByTestId('edge-type-select'), { target: { value: String(ownsIdx) } })
    // mockOwnsEdge: dept:abc → cap:c1 (owns)
    fireEvent.change(screen.getByTestId('entity-select'), { target: { value: mockCapabilityNode.id } })
    expect(screen.getByTestId('duplicate-warning')).toBeInTheDocument()
    expect(screen.getByText('This relationship already exists.')).toBeInTheDocument()
    // Add button should be disabled for exact duplicate
    expect(screen.getByTestId('add-confirm-btn')).toBeDisabled()
  })

  it('should call onCancel when Cancel button clicked', () => {
    const onCancel = vi.fn()
    render(<AddRelationshipDialog {...defaultProps} onCancel={onCancel} />)
    fireEvent.click(screen.getByTestId('add-cancel-btn'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('should reset entity selection when edge type changes', () => {
    render(<AddRelationshipDialog {...defaultProps} />)
    const options = getAvailableEdgeTypes('department', CONNECTION_RULES)
    const ownsIdx = options.findIndex((o) => o.edgeType === 'owns' && o.direction === 'outgoing')
    fireEvent.change(screen.getByTestId('edge-type-select'), { target: { value: String(ownsIdx) } })
    fireEvent.change(screen.getByTestId('entity-select'), { target: { value: mockWorkflowNode.id } })
    // Change edge type
    const reportsIdx = options.findIndex((o) => o.edgeType === 'reports_to' && o.direction === 'outgoing')
    fireEvent.change(screen.getByTestId('edge-type-select'), { target: { value: String(reportsIdx) } })
    // Entity should be reset
    const entitySelect = screen.getByTestId('entity-select') as HTMLSelectElement
    expect(entitySelect.value).toBe('')
  })
})
