import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WorkflowDiagram } from '@/components/workflows/workflow-diagram'
import { WorkflowCard } from '@/components/workflows/workflow-card'
import type { WorkflowDto, WorkflowStageDto, WorkflowParticipantDto } from '@the-crew/shared-types'

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

const stages: WorkflowStageDto[] = [
  { name: 'Setup', order: 1, description: 'Account setup' },
  { name: 'Training', order: 2, description: 'Initial training' },
  { name: 'Review', order: 3, description: '' },
]

const participants: WorkflowParticipantDto[] = [
  { participantId: 'd1', participantType: 'department', responsibility: 'Owns' },
]

const mockWorkflow: WorkflowDto = {
  id: 'w1',
  projectId: 'p1',
  name: 'Onboarding Flow',
  description: 'New hire onboarding',
  ownerDepartmentId: 'd1',
  status: 'draft',
  triggerDescription: '',
  stages,
  participants,
  contractIds: [],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
}

describe('WorkflowDiagram', () => {
  it('should show empty state with no stages', () => {
    renderWithQuery(<WorkflowDiagram stages={[]} participants={[]} />)
    expect(screen.getByText(/no stages defined/i)).toBeDefined()
  })

  it('should render stage nodes in order', () => {
    renderWithQuery(<WorkflowDiagram stages={stages} participants={[]} />)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(screen.getByText('Setup')).toBeDefined()
    expect(screen.getByText('Training')).toBeDefined()
    expect(screen.getByText('Review')).toBeDefined()
  })

  it('should display stage order numbers', () => {
    renderWithQuery(<WorkflowDiagram stages={stages} participants={[]} />)
    expect(screen.getByText('1')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined()
    expect(screen.getByText('3')).toBeDefined()
  })

  it('should display stage description', () => {
    renderWithQuery(<WorkflowDiagram stages={stages} participants={[]} />)
    expect(screen.getByText('Account setup')).toBeDefined()
    expect(screen.getByText('Initial training')).toBeDefined()
  })

  it('should show participant badges', () => {
    renderWithQuery(<WorkflowDiagram stages={stages} participants={participants} />)
    expect(screen.getAllByText('d1').length).toBeGreaterThan(0)
  })

  it('should resolve participant names when resolver provided', () => {
    const resolve = (id: string) => (id === 'd1' ? 'Engineering' : undefined)
    renderWithQuery(
      <WorkflowDiagram stages={stages} participants={participants} resolveParticipantName={resolve} />,
    )
    expect(screen.getAllByText('Engineering').length).toBeGreaterThan(0)
  })

  it('should sort stages by order', () => {
    const unordered: WorkflowStageDto[] = [
      { name: 'Third', order: 3, description: '' },
      { name: 'First', order: 1, description: '' },
      { name: 'Second', order: 2, description: '' },
    ]
    renderWithQuery(<WorkflowDiagram stages={unordered} participants={[]} />)
    const items = screen.getAllByRole('listitem')
    expect(items[0]!.textContent).toContain('First')
    expect(items[1]!.textContent).toContain('Second')
    expect(items[2]!.textContent).toContain('Third')
  })
})

describe('WorkflowCard expand/collapse', () => {
  it('should not show diagram initially', () => {
    renderWithQuery(
      <WorkflowCard workflow={mockWorkflow} ownerName="Engineering" onDelete={vi.fn()} />,
    )
    expect(screen.queryByRole('list', { name: /workflow stages/i })).toBeNull()
  })

  it('should expand to show diagram on click', () => {
    renderWithQuery(
      <WorkflowCard workflow={mockWorkflow} ownerName="Engineering" onDelete={vi.fn()} />,
    )
    fireEvent.click(screen.getByRole('button', { name: /expand onboarding flow/i }))
    expect(screen.getByRole('list', { name: /workflow stages/i })).toBeDefined()
  })

  it('should collapse diagram on second click', () => {
    renderWithQuery(
      <WorkflowCard workflow={mockWorkflow} ownerName="Engineering" onDelete={vi.fn()} />,
    )
    const toggle = screen.getByRole('button', { name: /expand onboarding flow/i })
    fireEvent.click(toggle)
    expect(screen.getByRole('list', { name: /workflow stages/i })).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: /collapse onboarding flow/i }))
    expect(screen.queryByRole('list', { name: /workflow stages/i })).toBeNull()
  })

  it('should disable expand when no stages', () => {
    const noStages = { ...mockWorkflow, stages: [] }
    renderWithQuery(
      <WorkflowCard workflow={noStages} onDelete={vi.fn()} />,
    )
    const toggle = screen.getByRole('button', { name: /expand onboarding flow/i })
    expect(toggle).toBeDisabled()
  })
})
