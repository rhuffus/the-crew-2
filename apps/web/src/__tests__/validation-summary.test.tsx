import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ValidationIssue } from '@the-crew/shared-types'
import { ValidationSummary } from '@/components/visual-shell/explorer/validation-summary'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import {
  mockDeptNode,
  mockContractNode,
} from './fixtures/visual-graph'

vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')))

describe('ValidationSummary', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      validationIssues: [],
      graphNodes: [],
      showValidationOverlay: true,
      selectedNodeIds: [],
      focusNodeId: null,
    })
  })

  it('should show no issues when clean', () => {
    render(<ValidationSummary />)
    expect(screen.getByText('No issues')).toBeInTheDocument()
  })

  it('should show error count', () => {
    render(<ValidationSummary errors={3} />)
    expect(screen.getByText('3 errors')).toBeInTheDocument()
  })

  it('should show warning count', () => {
    render(<ValidationSummary warnings={2} />)
    expect(screen.getByText('2 warnings')).toBeInTheDocument()
  })

  it('should show both errors and warnings', () => {
    render(<ValidationSummary errors={1} warnings={5} />)
    expect(screen.getByText('1 error')).toBeInTheDocument()
    expect(screen.getByText('5 warnings')).toBeInTheDocument()
  })

  it('should show singular for 1 error', () => {
    render(<ValidationSummary errors={1} />)
    expect(screen.getByText('1 error')).toBeInTheDocument()
  })

  it('should show singular for 1 warning', () => {
    render(<ValidationSummary warnings={1} />)
    expect(screen.getByText('1 warning')).toBeInTheDocument()
  })
})

describe('ValidationSummary issue list', () => {
  const mockIssues: ValidationIssue[] = [
    { entity: 'Department', entityId: 'abc', field: 'mandate', message: 'Missing mandate', severity: 'warning' },
    { entity: 'Contract', entityId: 'ct1', field: 'provider', message: 'Missing provider', severity: 'error' },
    { entity: 'Contract', entityId: 'ct1', field: null, message: 'No consumer', severity: 'warning' },
  ]

  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      validationIssues: mockIssues,
      graphNodes: [mockDeptNode, mockContractNode],
      showValidationOverlay: true,
      selectedNodeIds: [],
      focusNodeId: null,
    })
  })

  it('should show per-node issue list when issues and projectId present', () => {
    render(<ValidationSummary errors={1} warnings={2} projectId="proj-1" />)
    expect(screen.getByTestId('validation-issue-list')).toBeInTheDocument()
  })

  it('should show node labels in issue groups', () => {
    render(<ValidationSummary errors={1} warnings={2} projectId="proj-1" />)
    expect(screen.getByText('Data SLA')).toBeInTheDocument()
    expect(screen.getByText('Marketing')).toBeInTheDocument()
  })

  it('should show issue messages', () => {
    render(<ValidationSummary errors={1} warnings={2} projectId="proj-1" />)
    expect(screen.getByText('Missing mandate')).toBeInTheDocument()
    expect(screen.getByText('Missing provider')).toBeInTheDocument()
    expect(screen.getByText('No consumer')).toBeInTheDocument()
  })

  it('should focus node on click', async () => {
    render(<ValidationSummary errors={1} warnings={2} projectId="proj-1" />)
    const deptButton = screen.getByTestId('validation-node-dept:abc')
    await userEvent.click(deptButton)
    expect(useVisualWorkspaceStore.getState().selectedNodeIds).toEqual(['dept:abc'])
    expect(useVisualWorkspaceStore.getState().focusNodeId).toBe('dept:abc')
  })

  it('should not show issue list without projectId', () => {
    render(<ValidationSummary errors={1} warnings={2} />)
    expect(screen.queryByTestId('validation-issue-list')).not.toBeInTheDocument()
  })

  it('should not show issue list when overlay is hidden', () => {
    useVisualWorkspaceStore.setState({ showValidationOverlay: false })
    render(<ValidationSummary errors={1} warnings={2} projectId="proj-1" />)
    expect(screen.queryByTestId('validation-issue-list')).not.toBeInTheDocument()
  })

  it('should sort errors before warnings in issue list', () => {
    render(<ValidationSummary errors={1} warnings={2} projectId="proj-1" />)
    const nodes = screen.getAllByTestId(/^validation-node-/)
    // Data SLA (contract with error) should come before Marketing (dept with warning)
    expect(nodes[0]!.getAttribute('data-testid')).toBe('validation-node-contract:ct1')
    expect(nodes[1]!.getAttribute('data-testid')).toBe('validation-node-dept:abc')
  })
})
