import { useQuery } from '@tanstack/react-query'
import { validationsApi } from '@/api/validations'

function validationsKey(projectId: string) {
  return ['projects', projectId, 'validations'] as const
}

export function useValidations(projectId: string) {
  return useQuery({
    queryKey: validationsKey(projectId),
    queryFn: () => validationsApi.get(projectId),
  })
}
