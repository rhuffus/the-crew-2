import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bootstrapApi, type BootstrapInput } from '@/lib/bootstrap-api'

function statusKey(projectId: string) {
  return ['bootstrap', 'status', projectId] as const
}

export function useBootstrapStatus(projectId: string) {
  return useQuery({
    queryKey: statusKey(projectId),
    queryFn: () => bootstrapApi.getStatus(projectId),
    enabled: !!projectId,
  })
}

export function useBootstrapProject(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: BootstrapInput) => bootstrapApi.bootstrap(projectId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statusKey(projectId) })
      queryClient.invalidateQueries({ queryKey: ['visual-graph'] })
    },
  })
}
