import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ContractList } from '@/components/contracts/contract-list'
import { ContractCard } from '@/components/contracts/contract-card'
import type { ContractDto } from '@the-crew/shared-types'

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

const mockContract: ContractDto = {
  id: 'c1',
  projectId: 'p1',
  name: 'Data Delivery SLA',
  description: 'Ensures timely data delivery',
  type: 'SLA',
  status: 'draft',
  providerId: 'd1',
  providerType: 'department',
  consumerId: 'd2',
  consumerType: 'department',
  acceptanceCriteria: ['99.9% uptime', 'Max 5s latency'],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
}

const resolvePartyName = (id: string) => {
  const names: Record<string, string> = { d1: 'Engineering', d2: 'Product' }
  return names[id]
}

describe('ContractList', () => {
  it('should show empty state', () => {
    renderWithQuery(
      <ContractList contracts={[]} resolvePartyName={resolvePartyName} onDelete={vi.fn()} />,
    )
    expect(screen.getByText(/no contracts yet/i)).toBeDefined()
  })

  it('should render contract rows in table', () => {
    renderWithQuery(
      <ContractList
        contracts={[mockContract]}
        resolvePartyName={resolvePartyName}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByText('Data Delivery SLA')).toBeDefined()
  })

  it('should show type label', () => {
    renderWithQuery(
      <ContractList
        contracts={[mockContract]}
        resolvePartyName={resolvePartyName}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByText('SLA')).toBeDefined()
  })

  it('should show provider and consumer names', () => {
    renderWithQuery(
      <ContractList
        contracts={[mockContract]}
        resolvePartyName={resolvePartyName}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByText('Engineering')).toBeDefined()
    expect(screen.getByText('Product')).toBeDefined()
  })

  it('should show status badge', () => {
    renderWithQuery(
      <ContractList
        contracts={[mockContract]}
        resolvePartyName={resolvePartyName}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByText('draft')).toBeDefined()
  })

  it('should have delete button', () => {
    renderWithQuery(
      <ContractList
        contracts={[mockContract]}
        resolvePartyName={resolvePartyName}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByRole('button')).toBeDefined()
  })

  it('should show em dash when party name not found', () => {
    const unknownResolve = () => undefined
    renderWithQuery(
      <ContractList
        contracts={[mockContract]}
        resolvePartyName={unknownResolve}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getAllByText('\u2014')).toHaveLength(2)
  })
})

describe('ContractCard', () => {
  it('should display contract name and description', () => {
    renderWithQuery(
      <ContractCard contract={mockContract} resolvePartyName={resolvePartyName} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('Data Delivery SLA')).toBeDefined()
    expect(screen.getByText('Ensures timely data delivery')).toBeDefined()
  })

  it('should show provider and consumer names', () => {
    renderWithQuery(
      <ContractCard contract={mockContract} resolvePartyName={resolvePartyName} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('Engineering')).toBeDefined()
    expect(screen.getByText('Product')).toBeDefined()
  })

  it('should show status and type badges', () => {
    renderWithQuery(
      <ContractCard contract={mockContract} resolvePartyName={resolvePartyName} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('draft')).toBeDefined()
    expect(screen.getByText('SLA')).toBeDefined()
  })

  it('should show acceptance criteria count', () => {
    renderWithQuery(
      <ContractCard contract={mockContract} resolvePartyName={resolvePartyName} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('2 criteria')).toBeDefined()
  })

  it('should have delete button', () => {
    renderWithQuery(
      <ContractCard contract={mockContract} resolvePartyName={resolvePartyName} onDelete={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: /delete data delivery sla/i })).toBeDefined()
  })

  it('should fall back to party id when name not found', () => {
    const unknownResolve = () => undefined
    renderWithQuery(
      <ContractCard contract={mockContract} resolvePartyName={unknownResolve} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('d1')).toBeDefined()
    expect(screen.getByText('d2')).toBeDefined()
  })
})
