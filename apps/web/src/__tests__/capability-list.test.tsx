import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CapabilityList } from '@/components/capabilities/capability-list'
import type { CapabilityDto, DepartmentDto } from '@the-crew/shared-types'

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

const mockCap: CapabilityDto = {
  id: 'c1',
  projectId: 'p1',
  name: 'User Onboarding',
  description: 'Onboard new users',
  ownerDepartmentId: 'd1',
  inputs: ['User data'],
  outputs: ['Account', 'Email'],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
}

const mockDept: DepartmentDto = {
  id: 'd1',
  projectId: 'p1',
  name: 'Engineering',
  description: '',
  mandate: '',
  parentId: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

describe('CapabilityList', () => {
  it('should show empty state', () => {
    renderWithQuery(
      <CapabilityList capabilities={[]} departments={[]} onDelete={vi.fn()} onEdit={vi.fn()} />,
    )
    expect(screen.getByText(/no capabilities yet/i)).toBeDefined()
  })

  it('should render capability rows in table', () => {
    renderWithQuery(
      <CapabilityList
        capabilities={[mockCap]}
        departments={[mockDept]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    )
    expect(screen.getByText('User Onboarding')).toBeDefined()
    expect(screen.getByText('Onboard new users')).toBeDefined()
  })

  it('should show owner department name', () => {
    renderWithQuery(
      <CapabilityList
        capabilities={[mockCap]}
        departments={[mockDept]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    )
    expect(screen.getByText('Engineering')).toBeDefined()
  })

  it('should show input/output counts', () => {
    renderWithQuery(
      <CapabilityList
        capabilities={[mockCap]}
        departments={[mockDept]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    )
    expect(screen.getByText('1')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined()
  })

  it('should have delete button', () => {
    renderWithQuery(
      <CapabilityList
        capabilities={[mockCap]}
        departments={[mockDept]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    )
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(1)
  })

  it('should call onEdit when name is clicked', () => {
    const onEdit = vi.fn()
    renderWithQuery(
      <CapabilityList
        capabilities={[mockCap]}
        departments={[mockDept]}
        onDelete={vi.fn()}
        onEdit={onEdit}
      />,
    )
    screen.getByText('User Onboarding').click()
    expect(onEdit).toHaveBeenCalledWith(mockCap)
  })

  it('should show em dash when no owner department', () => {
    const capNoOwner = { ...mockCap, ownerDepartmentId: null }
    renderWithQuery(
      <CapabilityList
        capabilities={[capNoOwner]}
        departments={[mockDept]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    )
    expect(screen.getByText('\u2014')).toBeDefined()
  })
})
