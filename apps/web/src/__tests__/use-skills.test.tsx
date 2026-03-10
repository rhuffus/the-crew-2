import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSkills, useCreateSkill, useUpdateSkill, useDeleteSkill } from '@/hooks/use-skills'
import { skillsApi } from '@/api/skills'
import type { SkillDto } from '@the-crew/shared-types'

vi.mock('@/api/skills', () => ({
  skillsApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

const mockSkill: SkillDto = {
  id: 's1',
  projectId: 'p1',
  name: 'Code Review',
  description: 'Reviews code for quality',
  category: 'Engineering',
  tags: ['quality'],
  compatibleRoleIds: ['r1'],
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

describe('useSkills', () => {
  it('should fetch skills list', async () => {
    vi.mocked(skillsApi.list).mockResolvedValue([mockSkill])
    const { result } = renderHook(() => useSkills('p1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockSkill])
    expect(skillsApi.list).toHaveBeenCalledWith('p1')
  })
})

describe('useCreateSkill', () => {
  it('should create a skill and invalidate cache', async () => {
    vi.mocked(skillsApi.create).mockResolvedValue(mockSkill)
    const { result } = renderHook(() => useCreateSkill('p1'), { wrapper: createWrapper() })
    result.current.mutate({
      name: 'Code Review',
      description: 'Reviews code for quality',
      category: 'Engineering',
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(skillsApi.create).toHaveBeenCalledWith('p1', expect.objectContaining({ name: 'Code Review' }))
  })
})

describe('useUpdateSkill', () => {
  it('should update a skill and invalidate cache', async () => {
    vi.mocked(skillsApi.update).mockResolvedValue({ ...mockSkill, name: 'Updated' })
    const { result } = renderHook(() => useUpdateSkill('p1'), { wrapper: createWrapper() })
    result.current.mutate({ id: 's1', dto: { name: 'Updated' } })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(skillsApi.update).toHaveBeenCalledWith('p1', 's1', { name: 'Updated' })
  })
})

describe('useDeleteSkill', () => {
  it('should delete a skill and invalidate cache', async () => {
    vi.mocked(skillsApi.remove).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteSkill('p1'), { wrapper: createWrapper() })
    result.current.mutate('s1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(skillsApi.remove).toHaveBeenCalledWith('p1', 's1')
  })
})
