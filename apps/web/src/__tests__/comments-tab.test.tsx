import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CommentsTab } from '@/components/visual-shell/inspector/comments-tab'
import type { CommentDto } from '@the-crew/shared-types'

vi.mock('@/hooks/use-comments', () => ({
  useComments: vi.fn(),
  useCreateComment: vi.fn(),
  useResolveComment: vi.fn(),
}))
vi.mock('@/hooks/use-permissions', () => ({
  usePermission: vi.fn(),
}))

import { useComments, useCreateComment, useResolveComment } from '@/hooks/use-comments'
import { usePermission } from '@/hooks/use-permissions'

const mockUseComments = useComments as ReturnType<typeof vi.fn>
const mockUseCreateComment = useCreateComment as ReturnType<typeof vi.fn>
const mockUseResolveComment = useResolveComment as ReturnType<typeof vi.fn>
const mockUsePermission = usePermission as ReturnType<typeof vi.fn>

function makeComment(overrides: Partial<CommentDto> = {}): CommentDto {
  return {
    id: 'c1',
    projectId: 'p1',
    targetType: 'node',
    targetId: 'e1',
    scopeType: 'company',
    authorId: 'user-1',
    authorName: 'Alice',
    content: 'This looks good',
    resolved: false,
    parentId: null,
    replyCount: 0,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(), // 5 min ago
    updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    ...overrides,
  }
}

const defaultProps = {
  projectId: 'p1',
  entityId: 'e1',
  scopeType: 'company' as const,
}

const mutateFn = vi.fn()
const resolveFn = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  mockUseCreateComment.mockReturnValue({ mutate: mutateFn, isPending: false })
  mockUseResolveComment.mockReturnValue({ mutate: resolveFn, isPending: false })
  mockUsePermission.mockReturnValue(true)
})

describe('CommentsTab', () => {
  it('renders loading state', () => {
    mockUseComments.mockReturnValue({ data: undefined, isLoading: true })

    render(<CommentsTab {...defaultProps} />)

    expect(screen.getByTestId('comments-loading')).toBeInTheDocument()
    expect(screen.getByText('Loading comments...')).toBeInTheDocument()
  })

  it('renders empty state when no comments', () => {
    mockUseComments.mockReturnValue({ data: [], isLoading: false })

    render(<CommentsTab {...defaultProps} />)

    expect(screen.getByTestId('comments-tab')).toBeInTheDocument()
    expect(screen.getByTestId('no-comments')).toBeInTheDocument()
    expect(screen.getByText('No comments yet.')).toBeInTheDocument()
    expect(screen.getByText('0 comments')).toBeInTheDocument()
  })

  it('renders list of comments with author, content, and time', () => {
    const comments = [
      makeComment({ id: 'c1', authorName: 'Alice', content: 'First comment' }),
      makeComment({ id: 'c2', authorName: 'Bob', content: 'Second comment' }),
    ]
    mockUseComments.mockReturnValue({ data: comments, isLoading: false })

    render(<CommentsTab {...defaultProps} />)

    expect(screen.getByTestId('comments-tab')).toBeInTheDocument()
    expect(screen.getByText('2 comments')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('First comment')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Second comment')).toBeInTheDocument()
    // Time should be rendered (e.g. "5m ago")
    expect(screen.getByTestId('comment-c1')).toBeInTheDocument()
    expect(screen.getByTestId('comment-c2')).toBeInTheDocument()
  })

  it('can create a new comment via input and submit', () => {
    mockUseComments.mockReturnValue({ data: [], isLoading: false })

    render(<CommentsTab {...defaultProps} />)

    const input = screen.getByTestId('comment-input')
    const submit = screen.getByTestId('comment-submit')

    fireEvent.change(input, { target: { value: 'My new comment' } })
    fireEvent.click(submit)

    expect(mutateFn).toHaveBeenCalledWith(
      expect.objectContaining({
        targetType: 'node',
        targetId: 'e1',
        scopeType: 'company',
        content: 'My new comment',
        parentId: null,
      }),
    )
  })

  it('can resolve a comment', () => {
    const comments = [
      makeComment({ id: 'c1', authorId: 'current-user' }),
    ]
    mockUseComments.mockReturnValue({ data: comments, isLoading: false })

    render(<CommentsTab {...defaultProps} />)

    const resolveBtn = screen.getByTestId('resolve-btn-c1')
    fireEvent.click(resolveBtn)

    expect(resolveFn).toHaveBeenCalledWith({ id: 'c1' })
  })

  it('shows replies nested under parent', () => {
    const comments: CommentDto[] = [
      makeComment({ id: 'c1', authorName: 'Alice', content: 'Parent comment', replyCount: 1 }),
      makeComment({ id: 'r1', authorName: 'Bob', content: 'Reply content', parentId: 'c1' }),
    ]
    mockUseComments.mockReturnValue({ data: comments, isLoading: false })

    render(<CommentsTab {...defaultProps} />)

    // Only the top-level comment is counted in the header
    expect(screen.getByText('1 comment')).toBeInTheDocument()
    // Parent comment rendered
    expect(screen.getByTestId('comment-c1')).toBeInTheDocument()
    expect(screen.getByText('Parent comment')).toBeInTheDocument()
    // Reply rendered with reply testid
    expect(screen.getByTestId('reply-r1')).toBeInTheDocument()
    expect(screen.getByText('Reply content')).toBeInTheDocument()
  })

  it('reply button sets replyTo state and shows reply indicator', () => {
    const comments = [
      makeComment({ id: 'c1', authorName: 'Alice', content: 'A comment' }),
    ]
    mockUseComments.mockReturnValue({ data: comments, isLoading: false })

    render(<CommentsTab {...defaultProps} />)

    const replyBtn = screen.getByTestId('reply-btn-c1')
    fireEvent.click(replyBtn)

    // After clicking reply, the input area shows "Replying to comment" indicator
    expect(screen.getByText('Replying to comment')).toBeInTheDocument()

    // The input placeholder should change to "Write a reply..."
    const input = screen.getByTestId('comment-input')
    expect(input).toHaveAttribute('placeholder', 'Write a reply...')

    // Cancel reply
    fireEvent.click(screen.getByText('cancel'))
    expect(screen.queryByText('Replying to comment')).not.toBeInTheDocument()
    expect(input).toHaveAttribute('placeholder', 'Add a comment...')
  })

  it('comment input is hidden when user lacks comment:create permission', () => {
    mockUseComments.mockReturnValue({ data: [], isLoading: false })
    mockUsePermission.mockReturnValue(false)

    render(<CommentsTab {...defaultProps} />)

    expect(screen.getByTestId('comments-tab')).toBeInTheDocument()
    expect(screen.queryByTestId('comment-input-area')).not.toBeInTheDocument()
    expect(screen.queryByTestId('comment-input')).not.toBeInTheDocument()
    expect(screen.queryByTestId('comment-submit')).not.toBeInTheDocument()
  })
})
