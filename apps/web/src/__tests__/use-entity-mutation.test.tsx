import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEntityMutation } from '@/hooks/use-entity-mutation'

const mockPost = vi.fn()
const mockPatch = vi.fn()

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
  },
}))

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

describe('useEntityMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return created entity id from createEntity', async () => {
    mockPost.mockResolvedValue({ id: 'new-123', name: 'Test' })

    const { result } = renderHook(
      () => useEntityMutation('p1'),
      { wrapper: createWrapper() },
    )

    let created: { id: string } | undefined
    await act(async () => {
      created = await result.current.createEntity('department', { name: 'Test Dept' })
    })

    expect(created).toEqual({ id: 'new-123', name: 'Test' })
    expect(mockPost).toHaveBeenCalledWith('/projects/p1/departments', { name: 'Test Dept' })
  })

  it('should return undefined for unknown nodeType', async () => {
    const { result } = renderHook(
      () => useEntityMutation('p1'),
      { wrapper: createWrapper() },
    )

    let created: { id: string } | undefined
    await act(async () => {
      created = await result.current.createEntity('company' as never, { name: 'Test' })
    })

    expect(created).toBeUndefined()
  })

  it('should accept Record<string, unknown> for arrays', async () => {
    mockPost.mockResolvedValue({ id: 'skill-1' })

    const { result } = renderHook(
      () => useEntityMutation('p1'),
      { wrapper: createWrapper() },
    )

    await act(async () => {
      await result.current.createEntity('skill', {
        name: 'TS',
        category: 'tech',
        tags: ['typescript', 'frontend'],
      })
    })

    expect(mockPost).toHaveBeenCalledWith('/projects/p1/skills', {
      name: 'TS',
      category: 'tech',
      tags: ['typescript', 'frontend'],
    })
  })

  it('should set isPending during createEntity', async () => {
    let resolvePost: (v: unknown) => void
    mockPost.mockReturnValue(new Promise((r) => { resolvePost = r }))

    const { result } = renderHook(
      () => useEntityMutation('p1'),
      { wrapper: createWrapper() },
    )

    expect(result.current.isPending).toBe(false)

    let promise: Promise<unknown>
    act(() => {
      promise = result.current.createEntity('department', { name: 'Test' })
    })

    expect(result.current.isPending).toBe(true)

    await act(async () => {
      resolvePost!({ id: '1' })
      await promise!
    })

    expect(result.current.isPending).toBe(false)
  })

  it('should call correct API path for each entity type', async () => {
    mockPost.mockResolvedValue({ id: '1' })

    const { result } = renderHook(
      () => useEntityMutation('p1'),
      { wrapper: createWrapper() },
    )

    const types = [
      ['department', 'departments'],
      ['capability', 'capabilities'],
      ['role', 'roles'],
      ['workflow', 'workflows'],
      ['contract', 'contracts'],
      ['policy', 'policies'],
      ['skill', 'skills'],
      ['agent-archetype', 'agent-archetypes'],
      ['agent-assignment', 'agent-assignments'],
    ] as const

    for (const [nodeType, path] of types) {
      await act(async () => {
        await result.current.createEntity(nodeType, { name: 'Test' })
      })
      expect(mockPost).toHaveBeenCalledWith(`/projects/p1/${path}`, { name: 'Test' })
    }
  })
})
