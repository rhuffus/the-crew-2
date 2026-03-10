import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { VisualNodeDto } from '@the-crew/shared-types'
import {
  useRelationshipMutation,
  getEntityApiPath,
} from '@/hooks/use-relationship-mutation'
import { apiClient } from '@/lib/api-client'

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}))

// --- Fixtures ---

function makeNode(
  overrides: Partial<VisualNodeDto> & Pick<VisualNodeDto, 'entityId' | 'nodeType' | 'label'>,
): VisualNodeDto {
  return {
    id: `${overrides.nodeType}::${overrides.entityId}`,
    sublabel: null,
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['organization'],
    parentId: null,
    ...overrides,
  }
}

const deptA = makeNode({ entityId: 'dept-a', nodeType: 'department', label: 'Engineering' })
const deptB = makeNode({ entityId: 'dept-b', nodeType: 'department', label: 'Product' })
const capNode = makeNode({ entityId: 'cap-1', nodeType: 'capability', label: 'UI Dev' })
const roleNode = makeNode({ entityId: 'role-1', nodeType: 'role', label: 'Frontend Dev' })
const archetypeNode = makeNode({ entityId: 'arch-1', nodeType: 'agent-archetype', label: 'Bot A' })
const skillNode = makeNode({ entityId: 'skill-1', nodeType: 'skill', label: 'React' })
const contractNode = makeNode({ entityId: 'con-1', nodeType: 'contract', label: 'API SLA' })
const workflowNode = makeNode({ entityId: 'wf-1', nodeType: 'workflow', label: 'Onboarding' })
const policyNode = makeNode({ entityId: 'pol-1', nodeType: 'policy', label: 'Security' })
const companyNode = makeNode({ entityId: 'comp-1', nodeType: 'company', label: 'Acme' })

const PROJECT_ID = 'p1'

// --- Helpers ---

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
    queryClient,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(apiClient.get).mockResolvedValue({})
  vi.mocked(apiClient.patch).mockResolvedValue({})
})

// --- getEntityApiPath ---

describe('getEntityApiPath', () => {
  it('maps all 8 entity types to correct REST paths', () => {
    expect(getEntityApiPath('department')).toBe('departments')
    expect(getEntityApiPath('capability')).toBe('capabilities')
    expect(getEntityApiPath('workflow')).toBe('workflows')
    expect(getEntityApiPath('role')).toBe('roles')
    expect(getEntityApiPath('agent-archetype')).toBe('agent-archetypes')
    expect(getEntityApiPath('skill')).toBe('skills')
    expect(getEntityApiPath('contract')).toBe('contracts')
    expect(getEntityApiPath('policy')).toBe('policies')
  })
})

// --- createEdge ---

describe('createEdge', () => {
  it('creates reports_to edge — patches department directly', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useRelationshipMutation(PROJECT_ID), { wrapper })

    await act(() => result.current.createEdge('reports_to', deptA, deptB))

    expect(apiClient.get).not.toHaveBeenCalled()
    expect(apiClient.patch).toHaveBeenCalledWith(
      `/projects/${PROJECT_ID}/departments/${deptA.entityId}`,
      { parentId: deptB.entityId },
    )
  })

  it('creates owns edge (dept → capability) — patches capability', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useRelationshipMutation(PROJECT_ID), { wrapper })

    await act(() => result.current.createEdge('owns', deptA, capNode))

    expect(apiClient.get).not.toHaveBeenCalled()
    expect(apiClient.patch).toHaveBeenCalledWith(
      `/projects/${PROJECT_ID}/capabilities/${capNode.entityId}`,
      { ownerDepartmentId: deptA.entityId },
    )
  })

  it('creates assigned_to edge — patches agent-archetype', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useRelationshipMutation(PROJECT_ID), { wrapper })

    await act(() => result.current.createEdge('assigned_to', archetypeNode, roleNode))

    expect(apiClient.patch).toHaveBeenCalledWith(
      `/projects/${PROJECT_ID}/agent-archetypes/${archetypeNode.entityId}`,
      { roleId: roleNode.entityId },
    )
  })

  it('creates contributes_to edge — fetches role first, appends capability', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ capabilityIds: ['existing-cap'] })
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useRelationshipMutation(PROJECT_ID), { wrapper })

    await act(() => result.current.createEdge('contributes_to', roleNode, capNode))

    expect(apiClient.get).toHaveBeenCalledWith(
      `/projects/${PROJECT_ID}/roles/${roleNode.entityId}`,
    )
    expect(apiClient.patch).toHaveBeenCalledWith(
      `/projects/${PROJECT_ID}/roles/${roleNode.entityId}`,
      { capabilityIds: ['existing-cap', capNode.entityId] },
    )
  })

  it('creates has_skill edge — fetches archetype first, appends skill', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ skillIds: ['s0'] })
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useRelationshipMutation(PROJECT_ID), { wrapper })

    await act(() => result.current.createEdge('has_skill', archetypeNode, skillNode))

    expect(apiClient.get).toHaveBeenCalledWith(
      `/projects/${PROJECT_ID}/agent-archetypes/${archetypeNode.entityId}`,
    )
    expect(apiClient.patch).toHaveBeenCalledWith(
      `/projects/${PROJECT_ID}/agent-archetypes/${archetypeNode.entityId}`,
      { skillIds: ['s0', skillNode.entityId] },
    )
  })

  it('creates bound_by edge — fetches workflow first, appends contractId', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ contractIds: [] })
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useRelationshipMutation(PROJECT_ID), { wrapper })

    await act(() => result.current.createEdge('bound_by', workflowNode, contractNode))

    expect(apiClient.get).toHaveBeenCalledWith(
      `/projects/${PROJECT_ID}/workflows/${workflowNode.entityId}`,
    )
    expect(apiClient.patch).toHaveBeenCalledWith(
      `/projects/${PROJECT_ID}/workflows/${workflowNode.entityId}`,
      { contractIds: [contractNode.entityId] },
    )
  })

  it('creates participates_in edge — fetches workflow, includes metadata', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ participants: [] })
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useRelationshipMutation(PROJECT_ID), { wrapper })

    await act(() =>
      result.current.createEdge('participates_in', roleNode, workflowNode, {
        responsibility: 'Code review',
      }),
    )

    expect(apiClient.get).toHaveBeenCalledWith(
      `/projects/${PROJECT_ID}/workflows/${workflowNode.entityId}`,
    )
    expect(apiClient.patch).toHaveBeenCalledWith(
      `/projects/${PROJECT_ID}/workflows/${workflowNode.entityId}`,
      {
        participants: [
          {
            participantId: roleNode.entityId,
            participantType: 'role',
            responsibility: 'Code review',
          },
        ],
      },
    )
  })

  it('creates provides edge — patches contract with providerType', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useRelationshipMutation(PROJECT_ID), { wrapper })

    await act(() => result.current.createEdge('provides', deptA, contractNode))

    expect(apiClient.patch).toHaveBeenCalledWith(
      `/projects/${PROJECT_ID}/contracts/${contractNode.entityId}`,
      { providerId: deptA.entityId, providerType: 'department' },
    )
  })

  it('creates consumes edge — patches contract with consumerType', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useRelationshipMutation(PROJECT_ID), { wrapper })

    await act(() => result.current.createEdge('consumes', capNode, contractNode))

    expect(apiClient.patch).toHaveBeenCalledWith(
      `/projects/${PROJECT_ID}/contracts/${contractNode.entityId}`,
      { consumerId: capNode.entityId, consumerType: 'capability' },
    )
  })

  it('creates governs edge (→ department) — patches policy with scope', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useRelationshipMutation(PROJECT_ID), { wrapper })

    await act(() => result.current.createEdge('governs', policyNode, deptA))

    expect(apiClient.patch).toHaveBeenCalledWith(
      `/projects/${PROJECT_ID}/policies/${policyNode.entityId}`,
      { scope: 'department', departmentId: deptA.entityId },
    )
  })

  it('creates governs edge (→ company) — patches policy with global scope', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useRelationshipMutation(PROJECT_ID), { wrapper })

    await act(() => result.current.createEdge('governs', policyNode, companyNode))

    expect(apiClient.patch).toHaveBeenCalledWith(
      `/projects/${PROJECT_ID}/policies/${policyNode.entityId}`,
      { scope: 'global', departmentId: null },
    )
  })

  it('rejects hands_off_to edge', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useRelationshipMutation(PROJECT_ID), { wrapper })

    await expect(
      act(() => result.current.createEdge('hands_off_to', deptA, deptB)),
    ).rejects.toThrow('hands_off_to')
    expect(apiClient.patch).not.toHaveBeenCalled()
  })

  it('invalidates visual-graph queries on success', async () => {
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useRelationshipMutation(PROJECT_ID), { wrapper })

    await act(() => result.current.createEdge('reports_to', deptA, deptB))

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['visual-graph', PROJECT_ID],
    })
  })

  it('propagates API error and does not invalidate', async () => {
    vi.mocked(apiClient.patch).mockRejectedValue(new Error('Server error'))
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useRelationshipMutation(PROJECT_ID), { wrapper })

    await expect(
      act(() => result.current.createEdge('reports_to', deptA, deptB)),
    ).rejects.toThrow('Server error')
    expect(invalidateSpy).not.toHaveBeenCalled()
  })

  it('sets isPending true during operation and false after', async () => {
    let resolvePatched!: () => void
    vi.mocked(apiClient.patch).mockReturnValue(
      new Promise<void>((r) => { resolvePatched = r }),
    )
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useRelationshipMutation(PROJECT_ID), { wrapper })

    expect(result.current.isPending).toBe(false)

    let promise: Promise<void>
    act(() => {
      promise = result.current.createEdge('reports_to', deptA, deptB)
    })
    await waitFor(() => expect(result.current.isPending).toBe(true))

    await act(async () => {
      resolvePatched()
      await promise!
    })
    expect(result.current.isPending).toBe(false)
  })
})

// --- deleteEdge ---

describe('deleteEdge', () => {
  it('deletes reports_to edge — patches department with null parentId', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useRelationshipMutation(PROJECT_ID), { wrapper })

    await act(() => result.current.deleteEdge('reports_to', deptA, deptB))

    expect(apiClient.get).not.toHaveBeenCalled()
    expect(apiClient.patch).toHaveBeenCalledWith(
      `/projects/${PROJECT_ID}/departments/${deptA.entityId}`,
      { parentId: null },
    )
  })

  it('deletes owns edge — patches capability with null ownerDepartmentId', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useRelationshipMutation(PROJECT_ID), { wrapper })

    await act(() => result.current.deleteEdge('owns', deptA, capNode))

    expect(apiClient.patch).toHaveBeenCalledWith(
      `/projects/${PROJECT_ID}/capabilities/${capNode.entityId}`,
      { ownerDepartmentId: null },
    )
  })

  it('deletes contributes_to edge — fetches role, filters out capability', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      capabilityIds: ['cap-other', capNode.entityId],
    })
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useRelationshipMutation(PROJECT_ID), { wrapper })

    await act(() => result.current.deleteEdge('contributes_to', roleNode, capNode))

    expect(apiClient.get).toHaveBeenCalledWith(
      `/projects/${PROJECT_ID}/roles/${roleNode.entityId}`,
    )
    expect(apiClient.patch).toHaveBeenCalledWith(
      `/projects/${PROJECT_ID}/roles/${roleNode.entityId}`,
      { capabilityIds: ['cap-other'] },
    )
  })

  it('deletes governs edge — patches policy with global scope', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useRelationshipMutation(PROJECT_ID), { wrapper })

    await act(() => result.current.deleteEdge('governs', policyNode, deptA))

    expect(apiClient.patch).toHaveBeenCalledWith(
      `/projects/${PROJECT_ID}/policies/${policyNode.entityId}`,
      { departmentId: null, scope: 'global' },
    )
  })

  it('rejects hands_off_to deletion', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useRelationshipMutation(PROJECT_ID), { wrapper })

    await expect(
      act(() => result.current.deleteEdge('hands_off_to', deptA, deptB)),
    ).rejects.toThrow('hands_off_to')
    expect(apiClient.patch).not.toHaveBeenCalled()
  })

  it('invalidates visual-graph queries on success', async () => {
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useRelationshipMutation(PROJECT_ID), { wrapper })

    await act(() => result.current.deleteEdge('reports_to', deptA, deptB))

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['visual-graph', PROJECT_ID],
    })
  })

  it('propagates API error on deletion', async () => {
    vi.mocked(apiClient.patch).mockRejectedValue(new Error('Not found'))
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useRelationshipMutation(PROJECT_ID), { wrapper })

    await expect(
      act(() => result.current.deleteEdge('reports_to', deptA, deptB)),
    ).rejects.toThrow('Not found')
  })
})

// --- updateEdgeMetadata ---

describe('updateEdgeMetadata', () => {
  it('updates participates_in responsibility — fetches workflow, patches participant', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      participants: [
        { participantId: roleNode.entityId, participantType: 'role', responsibility: 'Old' },
        { participantId: 'other-id', participantType: 'department', responsibility: 'Other' },
      ],
    })
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useRelationshipMutation(PROJECT_ID), { wrapper })

    await act(() =>
      result.current.updateEdgeMetadata('participates_in', roleNode, workflowNode, {
        responsibility: 'New responsibility',
      }),
    )

    expect(apiClient.get).toHaveBeenCalledWith(
      `/projects/${PROJECT_ID}/workflows/${workflowNode.entityId}`,
    )
    expect(apiClient.patch).toHaveBeenCalledWith(
      `/projects/${PROJECT_ID}/workflows/${workflowNode.entityId}`,
      {
        participants: [
          { participantId: roleNode.entityId, participantType: 'role', responsibility: 'New responsibility' },
          { participantId: 'other-id', participantType: 'department', responsibility: 'Other' },
        ],
      },
    )
  })

  it('rejects non-participates_in edge types', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useRelationshipMutation(PROJECT_ID), { wrapper })

    await expect(
      act(() =>
        result.current.updateEdgeMetadata('reports_to', deptA, deptB, {
          responsibility: 'test',
        }),
      ),
    ).rejects.toThrow('does not support metadata editing')
    expect(apiClient.get).not.toHaveBeenCalled()
    expect(apiClient.patch).not.toHaveBeenCalled()
  })

  it('propagates API error during metadata update', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ participants: [] })
    vi.mocked(apiClient.patch).mockRejectedValue(new Error('Conflict'))
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useRelationshipMutation(PROJECT_ID), { wrapper })

    await expect(
      act(() =>
        result.current.updateEdgeMetadata('participates_in', roleNode, workflowNode, {
          responsibility: 'X',
        }),
      ),
    ).rejects.toThrow('Conflict')
  })
})
