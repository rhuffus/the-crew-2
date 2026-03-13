import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { proposalsApi } from '@/lib/proposals-api'
import type { CreateProposalDto, ProposalType, ProposalStatus } from '@the-crew/shared-types'

function proposalsKey(projectId: string, filters?: { status?: ProposalStatus; proposalType?: ProposalType }) {
  return ['proposals', projectId, filters ?? null] as const
}

function proposalKey(projectId: string, proposalId: string) {
  return ['proposals', projectId, proposalId] as const
}

export function useProposals(projectId: string, filters?: { status?: ProposalStatus; proposalType?: ProposalType }) {
  return useQuery({
    queryKey: proposalsKey(projectId, filters),
    queryFn: () => proposalsApi.list(projectId, filters),
    enabled: !!projectId,
  })
}

export function useProposal(projectId: string, proposalId: string) {
  return useQuery({
    queryKey: proposalKey(projectId, proposalId),
    queryFn: () => proposalsApi.get(projectId, proposalId),
    enabled: !!projectId && !!proposalId,
  })
}

export function useSubmitProposal(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateProposalDto & { id: string }) => proposalsApi.submit(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals', projectId] })
    },
  })
}

export function useApproveProposal(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ proposalId, approvedByUserId }: { proposalId: string; approvedByUserId: string }) =>
      proposalsApi.approve(projectId, proposalId, approvedByUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals', projectId] })
      queryClient.invalidateQueries({ queryKey: ['visual-graph'] })
    },
  })
}

export function useRejectProposal(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ proposalId, reason }: { proposalId: string; reason: string }) =>
      proposalsApi.reject(projectId, proposalId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals', projectId] })
    },
  })
}
