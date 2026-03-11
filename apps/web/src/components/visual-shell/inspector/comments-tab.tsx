import { useState } from 'react'
import { MessageSquare, Check, Send, CornerDownRight } from 'lucide-react'
import type { CommentDto, ScopeType, CommentTargetType } from '@the-crew/shared-types'
import { useComments, useCreateComment, useResolveComment } from '@/hooks/use-comments'
import { usePermission } from '@/hooks/use-permissions'

export interface CommentsTabProps {
  projectId: string
  entityId: string
  scopeType: ScopeType
}

export function CommentsTab({ projectId, entityId, scopeType }: CommentsTabProps) {
  const { data: comments = [], isLoading } = useComments(projectId, 'node' as CommentTargetType, entityId)
  const createComment = useCreateComment(projectId)
  const resolveComment = useResolveComment(projectId)
  const canComment = usePermission('comment:create')
  const canResolveAny = usePermission('comment:resolve:any')
  const [newContent, setNewContent] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)

  // Separate top-level comments from replies
  const topLevel = comments.filter(c => !c.parentId)
  const replies = comments.filter(c => c.parentId)
  const repliesByParent = new Map<string, CommentDto[]>()
  for (const r of replies) {
    const list = repliesByParent.get(r.parentId!) ?? []
    list.push(r)
    repliesByParent.set(r.parentId!, list)
  }

  const handleCreate = () => {
    const trimmed = newContent.trim()
    if (!trimmed) return
    createComment.mutate({
      targetType: 'node',
      targetId: entityId,
      scopeType,
      authorId: 'current-user', // TODO: real user from auth context
      authorName: 'You',
      content: trimmed,
      parentId: replyTo,
    })
    setNewContent('')
    setReplyTo(null)
  }

  const handleResolve = (id: string) => {
    resolveComment.mutate({ id })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCreate()
    }
  }

  if (isLoading) {
    return <div data-testid="comments-loading" className="text-xs text-muted-foreground">Loading comments...</div>
  }

  return (
    <div data-testid="comments-tab" className="space-y-3">
      <div className="flex items-center gap-1.5">
        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          {topLevel.length} comment{topLevel.length !== 1 ? 's' : ''}
        </span>
      </div>

      {topLevel.length === 0 && (
        <p data-testid="no-comments" className="text-xs text-muted-foreground">No comments yet.</p>
      )}

      <div className="space-y-2">
        {topLevel.map(comment => (
          <div key={comment.id} data-testid={`comment-${comment.id}`} className="space-y-1">
            <CommentCard
              comment={comment}
              onResolve={canResolveAny || comment.authorId === 'current-user' ? handleResolve : undefined}
              onReply={canComment ? () => setReplyTo(comment.id) : undefined}
            />
            {/* Replies */}
            {(repliesByParent.get(comment.id) ?? []).map(reply => (
              <div key={reply.id} className="ml-4 flex items-start gap-1">
                <CornerDownRight className="mt-1.5 h-3 w-3 shrink-0 text-muted-foreground/50" />
                <CommentCard comment={reply} isReply />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* New comment input */}
      {canComment && (
        <div data-testid="comment-input-area" className="space-y-1.5 pt-2 border-t border-border">
          {replyTo && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <CornerDownRight className="h-3 w-3" />
              <span>Replying to comment</span>
              <button type="button" onClick={() => setReplyTo(null)} className="text-primary hover:underline">cancel</button>
            </div>
          )}
          <div className="flex gap-1.5">
            <textarea
              data-testid="comment-input"
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={replyTo ? 'Write a reply...' : 'Add a comment...'}
              rows={2}
              className="flex-1 rounded border border-border bg-background px-2 py-1.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              data-testid="comment-submit"
              onClick={handleCreate}
              disabled={!newContent.trim() || createComment.isPending}
              className="self-end rounded bg-primary px-2 py-1.5 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function CommentCard({ comment, onResolve, onReply, isReply }: {
  comment: CommentDto
  onResolve?: (id: string) => void
  onReply?: () => void
  isReply?: boolean
}) {
  const timeAgo = formatTimeAgo(comment.createdAt)

  return (
    <div
      data-testid={isReply ? `reply-${comment.id}` : undefined}
      className={`rounded border border-border p-2 ${comment.resolved ? 'bg-muted/30 opacity-60' : 'bg-background'}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-foreground">{comment.authorName}</span>
        <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
      </div>
      <p className="mt-0.5 text-xs text-foreground/80 whitespace-pre-wrap">{comment.content}</p>
      <div className="mt-1 flex items-center gap-2">
        {comment.resolved && (
          <span data-testid={`resolved-badge-${comment.id}`} className="text-[10px] text-green-600 flex items-center gap-0.5">
            <Check className="h-3 w-3" /> Resolved
          </span>
        )}
        {!comment.resolved && onResolve && (
          <button
            type="button"
            data-testid={`resolve-btn-${comment.id}`}
            onClick={() => onResolve(comment.id)}
            className="text-[10px] text-muted-foreground hover:text-green-600"
          >
            Resolve
          </button>
        )}
        {onReply && !isReply && (
          <button
            type="button"
            data-testid={`reply-btn-${comment.id}`}
            onClick={onReply}
            className="text-[10px] text-muted-foreground hover:text-primary"
          >
            Reply
          </button>
        )}
        {comment.replyCount > 0 && (
          <span className="text-[10px] text-muted-foreground">
            {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
          </span>
        )}
      </div>
    </div>
  )
}

function formatTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
