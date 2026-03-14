import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateProjectDocumentDto, UpdateProjectDocumentDto } from '@the-crew/shared-types'
import { projectDocumentsApi } from '@/api/project-documents'

function documentsKey(projectId: string) {
  return ['projects', projectId, 'documents'] as const
}

export function useProjectDocuments(projectId: string) {
  return useQuery({
    queryKey: documentsKey(projectId),
    queryFn: () => projectDocumentsApi.list(projectId),
  })
}

export function useProjectDocument(projectId: string, id: string) {
  return useQuery({
    queryKey: [...documentsKey(projectId), id] as const,
    queryFn: () => projectDocumentsApi.get(projectId, id),
    enabled: !!id,
  })
}

export function useCreateProjectDocument(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateProjectDocumentDto) => projectDocumentsApi.create(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsKey(projectId) })
    },
  })
}

export function useUpdateProjectDocument(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProjectDocumentDto }) =>
      projectDocumentsApi.update(projectId, id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsKey(projectId) })
    },
  })
}

export function useDeleteProjectDocument(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => projectDocumentsApi.remove(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsKey(projectId) })
    },
  })
}
