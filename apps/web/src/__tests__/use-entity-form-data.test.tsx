import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEntityFormData } from '@/hooks/use-entity-form-data'

vi.mock('@/api/departments', () => ({
  departmentsApi: {
    list: vi.fn().mockResolvedValue([
      { id: 'd1', name: 'Engineering' },
      { id: 'd2', name: 'Marketing' },
    ]),
  },
}))

vi.mock('@/api/roles', () => ({
  rolesApi: {
    list: vi.fn().mockResolvedValue([
      { id: 'r1', name: 'Developer' },
    ]),
  },
}))

vi.mock('@/api/capabilities', () => ({
  capabilitiesApi: {
    list: vi.fn().mockResolvedValue([
      { id: 'c1', name: 'Web Dev' },
    ]),
  },
}))

vi.mock('@/api/agent-archetypes', () => ({
  agentArchetypesApi: {
    list: vi.fn().mockResolvedValue([
      { id: 'a1', name: 'Code Agent' },
    ]),
  },
}))

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

describe('useEntityFormData', () => {
  it('should return department options for role nodeType', async () => {
    const { result } = renderHook(
      () => useEntityFormData('p1', 'role'),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.optionsMap.departments).toEqual([
      { value: 'd1', label: 'Engineering' },
      { value: 'd2', label: 'Marketing' },
    ])
  })

  it('should return roles and departments for agent-archetype', async () => {
    const { result } = renderHook(
      () => useEntityFormData('p1', 'agent-archetype'),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.optionsMap.departments).toBeDefined()
    expect(result.current.optionsMap.roles).toBeDefined()
  })

  it('should return archetypes for agent-assignment', async () => {
    const { result } = renderHook(
      () => useEntityFormData('p1', 'agent-assignment'),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.optionsMap.archetypes).toEqual([
      { value: 'a1', label: 'Code Agent' },
    ])
  })

  it('should return empty optionsMap for skill (no sources)', async () => {
    const { result } = renderHook(
      () => useEntityFormData('p1', 'skill'),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(Object.keys(result.current.optionsMap)).toHaveLength(0)
  })

  it('should return departments and capabilities for contract (party-select)', async () => {
    const { result } = renderHook(
      () => useEntityFormData('p1', 'contract'),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.optionsMap.departments).toBeDefined()
    expect(result.current.optionsMap.capabilities).toBeDefined()
  })

  it('should handle null nodeType', async () => {
    const { result } = renderHook(
      () => useEntityFormData('p1', null),
      { wrapper: createWrapper() },
    )

    // Should not be loading since there's nothing to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(Object.keys(result.current.optionsMap)).toHaveLength(0)
  })

  it('should start with isLoading true when sources are needed', () => {
    const { result } = renderHook(
      () => useEntityFormData('p1', 'role'),
      { wrapper: createWrapper() },
    )

    // Initially loading since departments haven't loaded yet
    expect(result.current.isLoading).toBe(true)
  })
})
