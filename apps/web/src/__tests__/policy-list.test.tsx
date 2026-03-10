import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PolicyList } from '@/components/policies/policy-list'
import { PolicyCard } from '@/components/policies/policy-card'
import type { PolicyDto } from '@the-crew/shared-types'

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

const mockPolicy: PolicyDto = {
  id: 'pol1',
  projectId: 'p1',
  name: 'No orphan roles',
  description: 'Every role must belong to a department',
  scope: 'global',
  departmentId: null,
  type: 'constraint',
  condition: 'All roles must have a department',
  enforcement: 'mandatory',
  status: 'active',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
}

const deptPolicy: PolicyDto = {
  ...mockPolicy,
  id: 'pol2',
  name: 'Dept approval',
  scope: 'department',
  departmentId: 'd1',
  type: 'approval-gate',
  enforcement: 'advisory',
}

const resolveDepartmentName = (id: string) => {
  const names: Record<string, string> = { d1: 'Engineering' }
  return names[id]
}

describe('PolicyList', () => {
  it('should show empty state', () => {
    renderWithQuery(
      <PolicyList policies={[]} resolveDepartmentName={resolveDepartmentName} onDelete={vi.fn()} />,
    )
    expect(screen.getByText(/no policies yet/i)).toBeDefined()
  })

  it('should render policy rows in table', () => {
    renderWithQuery(
      <PolicyList
        policies={[mockPolicy]}
        resolveDepartmentName={resolveDepartmentName}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByText('No orphan roles')).toBeDefined()
  })

  it('should show type label', () => {
    renderWithQuery(
      <PolicyList
        policies={[mockPolicy]}
        resolveDepartmentName={resolveDepartmentName}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByText('Constraint')).toBeDefined()
  })

  it('should show Global scope for global policies', () => {
    renderWithQuery(
      <PolicyList
        policies={[mockPolicy]}
        resolveDepartmentName={resolveDepartmentName}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByText('Global')).toBeDefined()
  })

  it('should show department name for department-scoped policies', () => {
    renderWithQuery(
      <PolicyList
        policies={[deptPolicy]}
        resolveDepartmentName={resolveDepartmentName}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByText('Engineering')).toBeDefined()
  })

  it('should show enforcement badge', () => {
    renderWithQuery(
      <PolicyList
        policies={[mockPolicy]}
        resolveDepartmentName={resolveDepartmentName}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByText('mandatory')).toBeDefined()
  })

  it('should show status badge', () => {
    renderWithQuery(
      <PolicyList
        policies={[mockPolicy]}
        resolveDepartmentName={resolveDepartmentName}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByText('active')).toBeDefined()
  })

  it('should have delete button', () => {
    renderWithQuery(
      <PolicyList
        policies={[mockPolicy]}
        resolveDepartmentName={resolveDepartmentName}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByRole('button')).toBeDefined()
  })
})

describe('PolicyCard', () => {
  it('should display policy name and description', () => {
    renderWithQuery(
      <PolicyCard policy={mockPolicy} resolveDepartmentName={resolveDepartmentName} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('No orphan roles')).toBeDefined()
    expect(screen.getByText('Every role must belong to a department')).toBeDefined()
  })

  it('should show Global scope for global policies', () => {
    renderWithQuery(
      <PolicyCard policy={mockPolicy} resolveDepartmentName={resolveDepartmentName} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('Global')).toBeDefined()
  })

  it('should show department name for department-scoped policies', () => {
    renderWithQuery(
      <PolicyCard policy={deptPolicy} resolveDepartmentName={resolveDepartmentName} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('Engineering')).toBeDefined()
  })

  it('should show status, type, and enforcement badges', () => {
    renderWithQuery(
      <PolicyCard policy={mockPolicy} resolveDepartmentName={resolveDepartmentName} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('active')).toBeDefined()
    expect(screen.getByText('Constraint')).toBeDefined()
    expect(screen.getByText('mandatory')).toBeDefined()
  })

  it('should have delete button', () => {
    renderWithQuery(
      <PolicyCard policy={mockPolicy} resolveDepartmentName={resolveDepartmentName} onDelete={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: /delete no orphan roles/i })).toBeDefined()
  })

  it('should fall back to department id when name not found', () => {
    const unknownResolve = () => undefined
    renderWithQuery(
      <PolicyCard policy={deptPolicy} resolveDepartmentName={unknownResolve} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('d1')).toBeDefined()
  })
})
