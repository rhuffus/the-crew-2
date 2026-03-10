import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useValidations } from '@/hooks/use-validations'
import { validationsApi } from '@/api/validations'
import type { ValidationResultDto } from '@the-crew/shared-types'

vi.mock('@/api/validations', () => ({
  validationsApi: {
    get: vi.fn(),
  },
}))

const mockResult: ValidationResultDto = {
  projectId: 'p1',
  issues: [
    { entity: 'CompanyModel', entityId: null, field: 'purpose', message: 'No purpose', severity: 'error' },
    { entity: 'Department', entityId: 'd1', field: 'mandate', message: 'No mandate', severity: 'warning' },
  ],
  summary: { errors: 1, warnings: 1 },
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

describe('useValidations', () => {
  it('should fetch validation result', async () => {
    vi.mocked(validationsApi.get).mockResolvedValue(mockResult)
    const { result } = renderHook(() => useValidations('p1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockResult)
    expect(validationsApi.get).toHaveBeenCalledWith('p1')
  })

  it('should handle error', async () => {
    vi.mocked(validationsApi.get).mockRejectedValue(new Error('fail'))
    const { result } = renderHook(() => useValidations('p1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('should return empty issues for clean project', async () => {
    const clean: ValidationResultDto = { projectId: 'p1', issues: [], summary: { errors: 0, warnings: 0 } }
    vi.mocked(validationsApi.get).mockResolvedValue(clean)
    const { result } = renderHook(() => useValidations('p1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.issues).toEqual([])
  })
})
