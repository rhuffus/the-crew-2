import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CompanyModelForm } from '@/components/company-model/company-model-form'
import type { CompanyModelDto } from '@the-crew/shared-types'

vi.stubGlobal('fetch', vi.fn())

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

const emptyModel: CompanyModelDto = {
  projectId: 'p1',
  purpose: '',
  type: '',
  scope: '',
  principles: [],
  updatedAt: '2026-01-01T00:00:00Z',
}

const filledModel: CompanyModelDto = {
  projectId: 'p1',
  purpose: 'Build great products',
  type: 'SaaS',
  scope: 'Global',
  principles: ['Quality first', 'Move fast'],
  updatedAt: '2026-03-01T00:00:00Z',
}

describe('CompanyModelForm', () => {
  it('should render empty form fields', () => {
    renderWithQuery(<CompanyModelForm model={emptyModel} />)
    expect(screen.getByLabelText(/purpose/i)).toBeDefined()
    expect(screen.getByLabelText(/type/i)).toBeDefined()
    expect(screen.getByLabelText(/scope/i)).toBeDefined()
    expect(screen.getByText(/no principles defined/i)).toBeDefined()
  })

  it('should render filled form with values', () => {
    renderWithQuery(<CompanyModelForm model={filledModel} />)
    const purposeEl = screen.getByLabelText(/purpose/i) as HTMLTextAreaElement
    expect(purposeEl.value).toBe('Build great products')
    const typeEl = screen.getByLabelText(/type/i) as HTMLInputElement
    expect(typeEl.value).toBe('SaaS')
  })

  it('should render principles', () => {
    renderWithQuery(<CompanyModelForm model={filledModel} />)
    const inputs = screen.getAllByPlaceholderText(/principle/i) as HTMLInputElement[]
    expect(inputs).toHaveLength(2)
    expect(inputs[0]!.value).toBe('Quality first')
    expect(inputs[1]!.value).toBe('Move fast')
  })

  it('should add a principle', () => {
    renderWithQuery(<CompanyModelForm model={emptyModel} />)
    fireEvent.click(screen.getByRole('button', { name: /add/i }))
    expect(screen.getByPlaceholderText('Principle 1')).toBeDefined()
  })

  it('should remove a principle', () => {
    renderWithQuery(<CompanyModelForm model={filledModel} />)
    const removeButtons = screen.getAllByRole('button', { name: /remove principle/i })
    fireEvent.click(removeButtons[0]!)
    const inputs = screen.getAllByPlaceholderText(/principle/i) as HTMLInputElement[]
    expect(inputs).toHaveLength(1)
    expect(inputs[0]!.value).toBe('Move fast')
  })

  it('should disable update button when no changes', () => {
    renderWithQuery(<CompanyModelForm model={filledModel} />)
    const saveButton = screen.getByRole('button', { name: /update/i })
    expect(saveButton).toBeDisabled()
  })

  it('should enable update button when changes are made', () => {
    renderWithQuery(<CompanyModelForm model={filledModel} />)
    fireEvent.change(screen.getByLabelText(/purpose/i), { target: { value: 'New purpose' } })
    const saveButton = screen.getByRole('button', { name: /update/i })
    expect(saveButton).not.toBeDisabled()
  })
})
