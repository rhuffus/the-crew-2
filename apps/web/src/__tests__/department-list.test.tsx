import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DepartmentList } from '@/components/departments/department-list'
import type { DepartmentDto } from '@the-crew/shared-types'

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

const mockDept: DepartmentDto = {
  id: 'd1',
  projectId: 'p1',
  name: 'Engineering',
  description: 'Builds the product',
  mandate: 'Ship quality software',
  parentId: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
}

describe('DepartmentList', () => {
  it('should show empty state', () => {
    renderWithQuery(
      <DepartmentList departments={[]} onDelete={vi.fn()} onEdit={vi.fn()} />,
    )
    expect(screen.getByText(/no departments yet/i)).toBeDefined()
  })

  it('should render department rows in table', () => {
    renderWithQuery(
      <DepartmentList departments={[mockDept]} onDelete={vi.fn()} onEdit={vi.fn()} />,
    )
    expect(screen.getByText('Engineering')).toBeDefined()
    expect(screen.getByText('Builds the product')).toBeDefined()
  })

  it('should show parent name for child department', () => {
    const parent = mockDept
    const child: DepartmentDto = { ...mockDept, id: 'd2', name: 'Frontend', parentId: 'd1' }
    renderWithQuery(
      <DepartmentList departments={[parent, child]} onDelete={vi.fn()} onEdit={vi.fn()} />,
    )
    // "Engineering" appears as row name + parent cell on Frontend row
    expect(screen.getAllByText('Engineering')).toHaveLength(2)
    expect(screen.getByText('Frontend')).toBeDefined()
  })

  it('should show mandate text', () => {
    renderWithQuery(
      <DepartmentList departments={[mockDept]} onDelete={vi.fn()} onEdit={vi.fn()} />,
    )
    expect(screen.getByText('Ship quality software')).toBeDefined()
  })

  it('should have delete button', () => {
    renderWithQuery(
      <DepartmentList departments={[mockDept]} onDelete={vi.fn()} onEdit={vi.fn()} />,
    )
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(1)
  })

  it('should show em dash when no parent', () => {
    renderWithQuery(
      <DepartmentList departments={[mockDept]} onDelete={vi.fn()} onEdit={vi.fn()} />,
    )
    expect(screen.getByText('\u2014')).toBeDefined()
  })

  it('should call onEdit when name is clicked', () => {
    const onEdit = vi.fn()
    renderWithQuery(
      <DepartmentList departments={[mockDept]} onDelete={vi.fn()} onEdit={onEdit} />,
    )
    screen.getByText('Engineering').click()
    expect(onEdit).toHaveBeenCalledWith(mockDept)
  })
})
