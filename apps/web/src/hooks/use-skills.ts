import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateSkillDto, UpdateSkillDto } from '@the-crew/shared-types'
import { skillsApi } from '@/api/skills'

function skillsKey(projectId: string) {
  return ['projects', projectId, 'skills'] as const
}

export function useSkills(projectId: string) {
  return useQuery({
    queryKey: skillsKey(projectId),
    queryFn: () => skillsApi.list(projectId),
  })
}

export function useCreateSkill(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateSkillDto) => skillsApi.create(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillsKey(projectId) })
    },
  })
}

export function useUpdateSkill(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSkillDto }) =>
      skillsApi.update(projectId, id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillsKey(projectId) })
    },
  })
}

export function useDeleteSkill(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => skillsApi.remove(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillsKey(projectId) })
    },
  })
}
