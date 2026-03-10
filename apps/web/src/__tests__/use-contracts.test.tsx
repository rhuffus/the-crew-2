import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useContracts, useCreateContract, useUpdateContract, useDeleteContract } from '@/hooks/use-contracts'
import { contractsApi } from '@/api/contracts'
import type { ContractDto } from '@the-crew/shared-types'

vi.mock('@/api/contracts', () => ({
  contractsApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

const mockContract: ContractDto = {
  id: 'c1',
  projectId: 'p1',
  name: 'Data SLA',
  description: 'Data delivery SLA',
  type: 'SLA',
  status: 'draft',
  providerId: 'd1',
  providerType: 'department',
  consumerId: 'd2',
  consumerType: 'department',
  acceptanceCriteria: ['99.9% uptime'],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useContracts', () => {
  it('should fetch contracts list', async () => {
    vi.mocked(contractsApi.list).mockResolvedValue([mockContract])
    const { result } = renderHook(() => useContracts('p1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockContract])
    expect(contractsApi.list).toHaveBeenCalledWith('p1')
  })
})

describe('useCreateContract', () => {
  it('should create a contract and invalidate cache', async () => {
    vi.mocked(contractsApi.create).mockResolvedValue(mockContract)
    const { result } = renderHook(() => useCreateContract('p1'), { wrapper: createWrapper() })
    result.current.mutate({
      name: 'Data SLA',
      description: 'Data delivery SLA',
      type: 'SLA',
      providerId: 'd1',
      providerType: 'department',
      consumerId: 'd2',
      consumerType: 'department',
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(contractsApi.create).toHaveBeenCalledWith('p1', expect.objectContaining({ name: 'Data SLA' }))
  })
})

describe('useUpdateContract', () => {
  it('should update a contract and invalidate cache', async () => {
    vi.mocked(contractsApi.update).mockResolvedValue({ ...mockContract, name: 'Updated SLA' })
    const { result } = renderHook(() => useUpdateContract('p1'), { wrapper: createWrapper() })
    result.current.mutate({ id: 'c1', dto: { name: 'Updated SLA' } })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(contractsApi.update).toHaveBeenCalledWith('p1', 'c1', { name: 'Updated SLA' })
  })
})

describe('useDeleteContract', () => {
  it('should delete a contract and invalidate cache', async () => {
    vi.mocked(contractsApi.remove).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteContract('p1'), { wrapper: createWrapper() })
    result.current.mutate('c1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(contractsApi.remove).toHaveBeenCalledWith('p1', 'c1')
  })
})
