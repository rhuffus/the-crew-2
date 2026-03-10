import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateProjectDto, UpdateProjectDto } from '@the-crew/shared-types'
import { projectsApi } from '@/api/projects'

const PROJECTS_KEY = ['projects'] as const

export function useProjects() {
  return useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: () => projectsApi.list(),
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, id],
    queryFn: () => projectsApi.get(id),
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateProjectDto) => projectsApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProjectDto }) =>
      projectsApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
    },
  })
}
