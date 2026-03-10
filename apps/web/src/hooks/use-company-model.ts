import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UpdateCompanyModelDto } from '@the-crew/shared-types'
import { companyModelApi } from '@/api/company-model'

function companyModelKey(projectId: string) {
  return ['projects', projectId, 'company-model'] as const
}

export function useCompanyModel(projectId: string) {
  return useQuery({
    queryKey: companyModelKey(projectId),
    queryFn: () => companyModelApi.get(projectId),
  })
}

export function useUpdateCompanyModel(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: UpdateCompanyModelDto) => companyModelApi.update(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyModelKey(projectId) })
    },
  })
}
