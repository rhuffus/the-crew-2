import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WorkflowList } from '@/components/workflows/workflow-list'
import { WorkflowCard } from '@/components/workflows/workflow-card'
import type { WorkflowDto } from '@the-crew/shared-types'

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

const mockWorkflow: WorkflowDto = {
  id: 'w1',
  projectId: 'p1',
  name: 'Onboarding Flow',
  description: 'New hire onboarding process',
  ownerDepartmentId: 'd1',
  status: 'draft',
  triggerDescription: 'New hire joins',
  stages: [
    { name: 'Setup', order: 1, description: 'Account setup' },
    { name: 'Training', order: 2, description: 'Initial training' },
  ],
  participants: [
    { participantId: 'd1', participantType: 'department', responsibility: 'Owns the process' },
  ],
  contractIds: ['c1'],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
}

const resolveDeptName = (id: string) => {
  const names: Record<string, string> = { d1: 'Engineering' }
  return names[id]
}

describe('WorkflowList', () => {
  it('should show empty state', () => {
    renderWithQuery(
      <WorkflowList workflows={[]} resolveDeptName={resolveDeptName} onDelete={vi.fn()} />,
    )
    expect(screen.getByText(/no workflows yet/i)).toBeDefined()
  })

  it('should render workflow rows in table', () => {
    renderWithQuery(
      <WorkflowList workflows={[mockWorkflow]} resolveDeptName={resolveDeptName} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('Onboarding Flow')).toBeDefined()
  })

  it('should show owner department name', () => {
    renderWithQuery(
      <WorkflowList workflows={[mockWorkflow]} resolveDeptName={resolveDeptName} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('Engineering')).toBeDefined()
  })

  it('should show status badge', () => {
    renderWithQuery(
      <WorkflowList workflows={[mockWorkflow]} resolveDeptName={resolveDeptName} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('draft')).toBeDefined()
  })

  it('should show stage count', () => {
    renderWithQuery(
      <WorkflowList workflows={[mockWorkflow]} resolveDeptName={resolveDeptName} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('2')).toBeDefined()
  })

  it('should have delete button', () => {
    renderWithQuery(
      <WorkflowList workflows={[mockWorkflow]} resolveDeptName={resolveDeptName} onDelete={vi.fn()} />,
    )
    expect(screen.getByRole('button')).toBeDefined()
  })

  it('should show em dash when no owner', () => {
    const noOwner = { ...mockWorkflow, ownerDepartmentId: null }
    renderWithQuery(
      <WorkflowList workflows={[noOwner]} resolveDeptName={resolveDeptName} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('\u2014')).toBeDefined()
  })
})

describe('WorkflowCard', () => {
  it('should display workflow name and description', () => {
    renderWithQuery(
      <WorkflowCard workflow={mockWorkflow} ownerName="Engineering" onDelete={vi.fn()} />,
    )
    expect(screen.getByText('Onboarding Flow')).toBeDefined()
    expect(screen.getByText('New hire onboarding process')).toBeDefined()
  })

  it('should show status badge', () => {
    renderWithQuery(
      <WorkflowCard workflow={mockWorkflow} ownerName="Engineering" onDelete={vi.fn()} />,
    )
    expect(screen.getByText('draft')).toBeDefined()
  })

  it('should show owner department badge', () => {
    renderWithQuery(
      <WorkflowCard workflow={mockWorkflow} ownerName="Engineering" onDelete={vi.fn()} />,
    )
    expect(screen.getByText('Engineering')).toBeDefined()
  })

  it('should show stage count', () => {
    renderWithQuery(
      <WorkflowCard workflow={mockWorkflow} ownerName="Engineering" onDelete={vi.fn()} />,
    )
    expect(screen.getByText('2 stages')).toBeDefined()
  })

  it('should show participant count', () => {
    renderWithQuery(
      <WorkflowCard workflow={mockWorkflow} ownerName="Engineering" onDelete={vi.fn()} />,
    )
    expect(screen.getByText('1 participant')).toBeDefined()
  })

  it('should have delete button', () => {
    renderWithQuery(
      <WorkflowCard workflow={mockWorkflow} ownerName="Engineering" onDelete={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: /delete onboarding flow/i })).toBeDefined()
  })

  it('should not show owner badge when no owner', () => {
    const noOwner = { ...mockWorkflow, ownerDepartmentId: null }
    renderWithQuery(
      <WorkflowCard workflow={noOwner} onDelete={vi.fn()} />,
    )
    expect(screen.queryByText('Engineering')).toBeNull()
  })
})
