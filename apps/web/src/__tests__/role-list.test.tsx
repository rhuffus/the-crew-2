import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RoleList } from '@/components/roles/role-list'
import { RoleCard } from '@/components/roles/role-card'
import type { RoleDto } from '@the-crew/shared-types'

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

const mockRole: RoleDto = {
  id: 'r1',
  projectId: 'p1',
  name: 'Product Manager',
  description: 'Manages product lifecycle',
  departmentId: 'd1',
  capabilityIds: ['c1', 'c2'],
  accountability: 'Product roadmap',
  authority: 'Feature approval',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
}

const resolveDepartmentName = (id: string) => {
  const names: Record<string, string> = { d1: 'Engineering' }
  return names[id]
}

describe('RoleList', () => {
  it('should show empty state', () => {
    renderWithQuery(
      <RoleList roles={[]} resolveDepartmentName={resolveDepartmentName} onDelete={vi.fn()} />,
    )
    expect(screen.getByText(/no roles yet/i)).toBeDefined()
  })

  it('should render role rows in table', () => {
    renderWithQuery(
      <RoleList
        roles={[mockRole]}
        resolveDepartmentName={resolveDepartmentName}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByText('Product Manager')).toBeDefined()
  })

  it('should show department name', () => {
    renderWithQuery(
      <RoleList
        roles={[mockRole]}
        resolveDepartmentName={resolveDepartmentName}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByText('Engineering')).toBeDefined()
  })

  it('should show accountability and authority', () => {
    renderWithQuery(
      <RoleList
        roles={[mockRole]}
        resolveDepartmentName={resolveDepartmentName}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByText('Product roadmap')).toBeDefined()
    expect(screen.getByText('Feature approval')).toBeDefined()
  })

  it('should have delete button', () => {
    renderWithQuery(
      <RoleList
        roles={[mockRole]}
        resolveDepartmentName={resolveDepartmentName}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByRole('button')).toBeDefined()
  })

  it('should show em dash when department name not found', () => {
    const unknownResolve = () => undefined
    renderWithQuery(
      <RoleList roles={[mockRole]} resolveDepartmentName={unknownResolve} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('\u2014')).toBeDefined()
  })
})

describe('RoleCard', () => {
  it('should display role name and description', () => {
    renderWithQuery(
      <RoleCard role={mockRole} resolveDepartmentName={resolveDepartmentName} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('Product Manager')).toBeDefined()
    expect(screen.getByText('Manages product lifecycle')).toBeDefined()
  })

  it('should show department name', () => {
    renderWithQuery(
      <RoleCard role={mockRole} resolveDepartmentName={resolveDepartmentName} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('Engineering')).toBeDefined()
  })

  it('should show accountability and authority', () => {
    renderWithQuery(
      <RoleCard role={mockRole} resolveDepartmentName={resolveDepartmentName} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('Product roadmap')).toBeDefined()
    expect(screen.getByText('Feature approval')).toBeDefined()
  })

  it('should show capability count badge', () => {
    renderWithQuery(
      <RoleCard role={mockRole} resolveDepartmentName={resolveDepartmentName} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('2 capabilities')).toBeDefined()
  })

  it('should have delete button', () => {
    renderWithQuery(
      <RoleCard role={mockRole} resolveDepartmentName={resolveDepartmentName} onDelete={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: /delete product manager/i })).toBeDefined()
  })

  it('should fall back to department id when name not found', () => {
    const unknownResolve = () => undefined
    renderWithQuery(
      <RoleCard role={mockRole} resolveDepartmentName={unknownResolve} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('d1')).toBeDefined()
  })

  it('should not show capability badge when empty', () => {
    const roleNoCaps = { ...mockRole, capabilityIds: [] }
    renderWithQuery(
      <RoleCard role={roleNoCaps} resolveDepartmentName={resolveDepartmentName} onDelete={vi.fn()} />,
    )
    expect(screen.queryByText(/capabilities/)).toBeNull()
  })
})
