import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateWorkflowDto, UpdateWorkflowDto } from '@the-crew/shared-types'
import { workflowsApi } from '@/api/workflows'

function workflowsKey(projectId: string) {
  return ['projects', projectId, 'workflows'] as const
}

export function useWorkflows(projectId: string) {
  return useQuery({
    queryKey: workflowsKey(projectId),
    queryFn: () => workflowsApi.list(projectId),
  })
}

export function useCreateWorkflow(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateWorkflowDto) => workflowsApi.create(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowsKey(projectId) })
    },
  })
}

export function useUpdateWorkflow(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateWorkflowDto }) =>
      workflowsApi.update(projectId, id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowsKey(projectId) })
    },
  })
}

export function useDeleteWorkflow(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => workflowsApi.remove(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowsKey(projectId) })
    },
  })
}
