import { create } from 'zustand'
import type { ProposalDto, ProposalStatus, ProposalType } from '@the-crew/shared-types'
import { proposalsApi } from '@/lib/proposals-api'

interface ProposalsStoreState {
  proposals: ProposalDto[]
  loading: boolean
  error: string | null
  statusFilter: ProposalStatus | null
  typeFilter: ProposalType | null

  loadProposals: (projectId: string) => Promise<void>
  setStatusFilter: (status: ProposalStatus | null) => void
  setTypeFilter: (type: ProposalType | null) => void
  approveProposal: (projectId: string, proposalId: string, userId: string) => Promise<void>
  rejectProposal: (projectId: string, proposalId: string, reason: string) => Promise<void>
  getFilteredProposals: () => ProposalDto[]
  getProposalsByStatus: (status: ProposalStatus) => ProposalDto[]
}

export const useProposalsStore = create<ProposalsStoreState>((set, get) => ({
  proposals: [],
  loading: false,
  error: null,
  statusFilter: null,
  typeFilter: null,

  loadProposals: async (projectId) => {
    try {
      set({ loading: true, error: null })
      const { statusFilter, typeFilter } = get()
      const filters: { status?: ProposalStatus; proposalType?: ProposalType } = {}
      if (statusFilter) filters.status = statusFilter
      if (typeFilter) filters.proposalType = typeFilter
      const proposals = await proposalsApi.list(projectId, filters)
      set({ proposals })
    } catch (err) {
      set({ error: (err as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  setStatusFilter: (status) => set({ statusFilter: status }),
  setTypeFilter: (type) => set({ typeFilter: type }),

  approveProposal: async (projectId, proposalId, userId) => {
    await proposalsApi.approve(projectId, proposalId, userId)
    await get().loadProposals(projectId)
  },

  rejectProposal: async (projectId, proposalId, reason) => {
    await proposalsApi.reject(projectId, proposalId, reason)
    await get().loadProposals(projectId)
  },

  getFilteredProposals: () => {
    const { proposals, statusFilter, typeFilter } = get()
    return proposals.filter(p => {
      if (statusFilter && p.status !== statusFilter) return false
      if (typeFilter && p.proposalType !== typeFilter) return false
      return true
    })
  },

  getProposalsByStatus: (status) => {
    return get().proposals.filter(p => p.status === status)
  },
}))
