import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EntityLink } from '@/components/visual-shell/entity-link'

// Mock TanStack Router
const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

// Mock the store
const mockFocusNode = vi.fn()
vi.mock('@/stores/visual-workspace-store', () => ({
  useVisualWorkspaceStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ focusNode: mockFocusNode }),
}))

describe('EntityLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders entity label', () => {
    render(
      <EntityLink
        entityId="abc"
        nodeType="department"
        label="Marketing"
        projectId="proj-1"
      />,
    )
    expect(screen.getByText('Marketing')).toBeInTheDocument()
  })

  it('renders with data-testid', () => {
    render(
      <EntityLink
        entityId="abc"
        nodeType="department"
        label="Marketing"
        projectId="proj-1"
      />,
    )
    expect(screen.getByTestId('entity-link-abc')).toBeInTheDocument()
  })

  it('shows external icon for out-of-scope entities', () => {
    const { container } = render(
      <EntityLink
        entityId="abc"
        nodeType="department"
        label="Marketing"
        projectId="proj-1"
        isInScope={false}
      />,
    )
    // ExternalLink icon should be present
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('does not show external icon for in-scope entities', () => {
    const { container } = render(
      <EntityLink
        entityId="abc"
        nodeType="department"
        label="Marketing"
        projectId="proj-1"
        isInScope={true}
      />,
    )
    // No ExternalLink icon
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('navigates to department L2 on click', () => {
    render(
      <EntityLink
        entityId="dept-123"
        nodeType="department"
        label="Engineering"
        projectId="proj-1"
      />,
    )
    fireEvent.click(screen.getByTestId('entity-link-dept-123'))
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/projects/proj-1/departments/dept-123' })
  })

  it('navigates to workflow L3 on click', () => {
    render(
      <EntityLink
        entityId="wf-456"
        nodeType="workflow"
        label="CI/CD Pipeline"
        projectId="proj-1"
      />,
    )
    fireEvent.click(screen.getByTestId('entity-link-wf-456'))
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/projects/proj-1/workflows/wf-456' })
  })

  it('navigates to parent dept L2 and focuses on leaf entity', () => {
    render(
      <EntityLink
        entityId="role-1"
        nodeType="role"
        label="CTO"
        projectId="proj-1"
        parentId="dept:eng"
      />,
    )
    fireEvent.click(screen.getByTestId('entity-link-role-1'))
    expect(mockFocusNode).toHaveBeenCalledWith('role:role-1')
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/projects/proj-1/departments/eng' })
  })

  it('navigates to org L1 for contract without parent dept', () => {
    render(
      <EntityLink
        entityId="ct-1"
        nodeType="contract"
        label="Data SLA"
        projectId="proj-1"
      />,
    )
    fireEvent.click(screen.getByTestId('entity-link-ct-1'))
    expect(mockFocusNode).toHaveBeenCalledWith('contract:ct-1')
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/projects/proj-1/org' })
  })

  it('has correct title attribute', () => {
    render(
      <EntityLink
        entityId="abc"
        nodeType="department"
        label="Marketing"
        projectId="proj-1"
      />,
    )
    expect(screen.getByTestId('entity-link-abc')).toHaveAttribute('title', 'Navigate to Department: Marketing')
  })

  it('stops event propagation on click', () => {
    const parentClick = vi.fn()
    render(
      <div onClick={parentClick}>
        <EntityLink
          entityId="abc"
          nodeType="department"
          label="Marketing"
          projectId="proj-1"
        />
      </div>,
    )
    fireEvent.click(screen.getByTestId('entity-link-abc'))
    expect(parentClick).not.toHaveBeenCalled()
  })
})
