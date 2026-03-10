import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateContractDto, UpdateContractDto } from '@the-crew/shared-types'
import { contractsApi } from '@/api/contracts'

function contractsKey(projectId: string) {
  return ['projects', projectId, 'contracts'] as const
}

export function useContracts(projectId: string) {
  return useQuery({
    queryKey: contractsKey(projectId),
    queryFn: () => contractsApi.list(projectId),
  })
}

export function useCreateContract(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateContractDto) => contractsApi.create(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractsKey(projectId) })
    },
  })
}

export function useUpdateContract(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateContractDto }) =>
      contractsApi.update(projectId, id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractsKey(projectId) })
    },
  })
}

export function useDeleteContract(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => contractsApi.remove(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractsKey(projectId) })
    },
  })
}
