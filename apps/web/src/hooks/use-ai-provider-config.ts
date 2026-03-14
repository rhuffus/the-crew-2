import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiProviderConfigApi } from '@/api/ai-provider-config'
import type { UpsertAiProviderConfigDto } from '@the-crew/shared-types'

const QUERY_KEY = ['ai-provider-configs'] as const

export function useAiProviderConfigs() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => aiProviderConfigApi.list(),
  })
}

export function useAiProviderValidation(providerId: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, providerId, 'validate'] as const,
    queryFn: () => aiProviderConfigApi.validate(providerId),
    enabled: !!providerId,
  })
}

export function useUpsertAiProviderConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ providerId, dto }: { providerId: string; dto: UpsertAiProviderConfigDto }) =>
      aiProviderConfigApi.upsert(providerId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useDeleteAiProviderConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (providerId: string) => aiProviderConfigApi.remove(providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
