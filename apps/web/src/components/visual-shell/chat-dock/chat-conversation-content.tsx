import { useEffect, useRef, useState } from 'react'
import { Bot, Sparkles, Loader2, Building2, Lock, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import type { BootstrapConversationStatus, ProposalDto, ScopeDescriptor } from '@the-crew/shared-types'
import { usePermission } from '@/hooks/use-permissions'
import { useChatThread, useChatMessages, useSendMessage } from '@/hooks/use-chat'
import {
  useBootstrapConversation,
  useStartBootstrapConversation,
  useSendBootstrapMessage,
  useProposeGrowth,
  useApproveGrowthProposal,
  useRejectGrowthProposal,
} from '@/hooks/use-bootstrap-conversation'
import { useAiProviderValidation } from '@/hooks/use-ai-provider-config'
import { ChatMessageList } from './chat-message-list'
import { ChatInput } from './chat-input'
import { ProposalCard } from './proposal-card'

export type ChatMode = 'generic' | 'ceo'

interface ChatConversationContentProps {
  projectId: string
  chatMode: ChatMode
  currentScope: ScopeDescriptor
}

const STATUS_LABELS: Record<BootstrapConversationStatus, string> = {
  'not-started': 'Not started',
  'collecting-context': 'Collecting context',
  'drafting-foundation-docs': 'Drafting documents',
  'reviewing-foundation-docs': 'Reviewing documents',
  'ready-to-grow': 'Ready to grow',
  'growth-started': 'Growth started',
}

export function ChatConversationContent({
  projectId,
  chatMode,
  currentScope,
}: ChatConversationContentProps) {
  if (chatMode === 'ceo') {
    return <CeoContent projectId={projectId} />
  }
  return <GenericContent projectId={projectId} currentScope={currentScope} />
}

// --- Generic chat content ---

function GenericContent({
  projectId,
  currentScope,
}: {
  projectId: string
  currentScope: ScopeDescriptor
}) {
  const { t } = useTranslation('chat')
  const canRead = usePermission('chat:read')
  const canWriteCompany = usePermission('chat:write:company')
  const canWriteDepartment = usePermission('chat:write:department')
  const canWriteNode = usePermission('chat:write:node')

  const canWrite =
    currentScope.scopeType === 'company'
      ? canWriteCompany
      : currentScope.scopeType === 'department'
        ? canWriteDepartment
        : canWriteNode

  const { data: thread } = useChatThread(
    projectId,
    currentScope.scopeType,
    currentScope.entityId ?? undefined,
  )

  const threadId = thread?.id
  const { data: messages, isLoading: messagesLoading } = useChatMessages(
    projectId,
    threadId,
  )
  const { mutate: send, isPending } = useSendMessage(projectId, threadId)

  const handleSend = (content: string) => {
    if (!threadId) return
    send({ content })
  }

  if (!canRead) return null

  return (
    <div className="flex h-full flex-col" data-testid="generic-chat-content">
      <ChatMessageList
        messages={messages ?? []}
        projectId={projectId}
        isLoading={messagesLoading}
      />
      {canWrite ? (
        <ChatInput
          onSend={handleSend}
          disabled={!threadId}
          isPending={isPending}
          projectId={projectId}
        />
      ) : (
        <div
          data-testid="chat-read-only"
          className="flex items-center gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground"
        >
          <Lock className="h-3 w-3" />
          <span>{t('dock.readOnly')}</span>
        </div>
      )}
    </div>
  )
}

// --- CEO chat content ---

function CeoContent({ projectId }: { projectId: string }) {
  const { t } = useTranslation('settings')
  const { data: conversation, isError: conversationError } =
    useBootstrapConversation(projectId)
  const startMutation = useStartBootstrapConversation(projectId)
  const proposeMutation = useProposeGrowth(projectId)
  const approveMutation = useApproveGrowthProposal(projectId)
  const rejectMutation = useRejectGrowthProposal(projectId)
  const startedRef = useRef(false)
  const [pendingProposals, setPendingProposals] = useState<ProposalDto[]>([])
  const { data: aiValidation } = useAiProviderValidation('claude-max')
  const hasNoProvider = aiValidation && !aiValidation.configured

  // Auto-start conversation when component mounts
  useEffect(() => {
    if (!startedRef.current && conversationError && !startMutation.isPending) {
      startedRef.current = true
      startMutation.mutate()
    }
  }, [conversationError, startMutation])

  const threadId = conversation?.threadId
  const { data: thread } = useChatThread(projectId, 'company')
  const effectiveThreadId = threadId ?? thread?.id
  const sendMutation = useSendBootstrapMessage(projectId, effectiveThreadId)
  const { data: messages, isLoading: messagesLoading } = useChatMessages(
    projectId,
    effectiveThreadId,
  )

  const status = conversation?.status ?? 'not-started'

  const handleSend = (content: string) => {
    sendMutation.mutate(content)
  }

  const handleProposeGrowth = () => {
    proposeMutation.mutate(undefined, {
      onSuccess: (data) => {
        const actionable = data.proposals.filter(
          (p) => p.status === 'proposed' || p.status === 'under-review',
        )
        setPendingProposals(actionable)
      },
    })
  }

  const handleApproveProposal = (proposalId: string) => {
    approveMutation.mutate(proposalId, {
      onSuccess: () => {
        setPendingProposals((prev) => prev.filter((p) => p.id !== proposalId))
      },
    })
  }

  const handleRejectProposal = (proposalId: string, reason: string) => {
    rejectMutation.mutate(
      { proposalId, reason },
      {
        onSuccess: () => {
          setPendingProposals((prev) =>
            prev.filter((p) => p.id !== proposalId),
          )
        },
      },
    )
  }

  const isLoading = startMutation.isPending || messagesLoading
  const isSending = sendMutation.isPending
  const isGrowthAction =
    proposeMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending
  const canProposeGrowth =
    status === 'ready-to-grow' || status === 'growth-started'
  const inputDisabled = status === 'not-started' || !!hasNoProvider

  return (
    <div className="flex h-full flex-col" data-testid="ceo-chat-content">
      {/* Status bar */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
        <Bot className="h-4 w-4 text-blue-600" />
        <span className="text-xs font-medium text-blue-700">CEO Agent</span>
        <div className="ml-auto flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span className="text-[10px] text-muted-foreground">
            {STATUS_LABELS[status]}
          </span>
        </div>
      </div>

      {/* No provider warning */}
      {hasNoProvider && (
        <div
          className="flex items-center gap-2 border-b border-orange-200 bg-orange-50 px-3 py-2 dark:border-orange-800 dark:bg-orange-950"
          data-testid="no-provider-warning"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-orange-600" />
          <span className="flex-1 text-xs text-orange-700 dark:text-orange-300">
            {t('noProviderError')}
          </span>
          <Link
            to="/settings"
            className="shrink-0 rounded-md bg-orange-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-orange-700"
            data-testid="go-to-settings-link"
          >
            {t('goToSettings')}
          </Link>
        </div>
      )}

      {/* Messages */}
      {isLoading && !messages?.length ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ChatMessageList
          messages={messages ?? []}
          projectId={projectId}
          isLoading={false}
        />
      )}

      {/* Pending proposals */}
      {pendingProposals.length > 0 && (
        <div
          className="space-y-2 border-t border-border px-3 py-2"
          data-testid="ceo-proposals-section"
        >
          <p className="text-xs font-medium text-muted-foreground">
            Pending proposals:
          </p>
          {pendingProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onApprove={handleApproveProposal}
              onReject={handleRejectProposal}
            />
          ))}
          {isGrowthAction && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Processing...
            </div>
          )}
        </div>
      )}

      {/* Growth action bar */}
      {canProposeGrowth && pendingProposals.length === 0 && (
        <div className="border-t border-border px-3 py-2">
          <button
            onClick={handleProposeGrowth}
            disabled={proposeMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            data-testid="ceo-propose-growth-btn"
          >
            {proposeMutation.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Building2 className="h-3 w-3" />
            )}
            Propose Structure
          </button>
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        disabled={inputDisabled}
        isPending={isSending}
        projectId={projectId}
      />
    </div>
  )
}
