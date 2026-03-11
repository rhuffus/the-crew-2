import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReviewIndicator } from '@/components/visual-shell/inspector/review-indicator'

const mockUseReviewByEntity = vi.fn()
const mockUseCreateReview = vi.fn()
const mockUseUpdateReview = vi.fn()
const mockUsePermission = vi.fn()

vi.mock('@/hooks/use-collaboration', () => ({
  useReviewByEntity: (...args: unknown[]) => mockUseReviewByEntity(...args),
  useCreateReview: (...args: unknown[]) => mockUseCreateReview(...args),
  useUpdateReview: (...args: unknown[]) => mockUseUpdateReview(...args),
}))

vi.mock('@/hooks/use-permissions', () => ({
  usePermission: (p: string) => mockUsePermission(p),
}))

const defaultProps = {
  projectId: 'proj-1',
  entityId: 'ent-1',
  nodeType: 'department' as const,
}

describe('ReviewIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseReviewByEntity.mockReturnValue({ data: null })
    mockUseCreateReview.mockReturnValue({ mutate: vi.fn(), isPending: false })
    mockUseUpdateReview.mockReturnValue({ mutate: vi.fn(), isPending: false })
    mockUsePermission.mockReturnValue(true)
  })

  it('shows "Request Review" button when no review and canReview', () => {
    render(<ReviewIndicator {...defaultProps} />)

    const btn = screen.getByTestId('request-review-btn')
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveTextContent('Request Review')
  })

  it('does not render when no review and no permission', () => {
    mockUsePermission.mockReturnValue(false)

    const { container } = render(<ReviewIndicator {...defaultProps} />)
    expect(container.innerHTML).toBe('')
  })

  it('shows "Approved" status with reviewer name', () => {
    mockUseReviewByEntity.mockReturnValue({
      data: { id: 'rev-1', entityId: 'ent-1', status: 'approved', reviewerName: 'Alice' },
    })

    render(<ReviewIndicator {...defaultProps} />)

    const indicator = screen.getByTestId('review-indicator')
    expect(indicator).toHaveTextContent('Approved')
    expect(indicator).toHaveTextContent('by Alice')
  })

  it('shows "Needs Changes" status', () => {
    mockUseReviewByEntity.mockReturnValue({
      data: { id: 'rev-1', entityId: 'ent-1', status: 'needs-changes', reviewerName: 'Bob' },
    })

    render(<ReviewIndicator {...defaultProps} />)

    const indicator = screen.getByTestId('review-indicator')
    expect(indicator).toHaveTextContent('Needs Changes')
    expect(indicator).toHaveTextContent('by Bob')
  })

  it('shows "Pending Review" status', () => {
    mockUseReviewByEntity.mockReturnValue({
      data: { id: 'rev-1', entityId: 'ent-1', status: 'pending', reviewerName: 'Charlie' },
    })

    render(<ReviewIndicator {...defaultProps} />)

    const indicator = screen.getByTestId('review-indicator')
    expect(indicator).toHaveTextContent('Pending Review')
    expect(indicator).toHaveTextContent('by Charlie')
  })

  it('shows approve button when status is not approved', () => {
    mockUseReviewByEntity.mockReturnValue({
      data: { id: 'rev-1', entityId: 'ent-1', status: 'pending', reviewerName: 'Alice' },
    })

    render(<ReviewIndicator {...defaultProps} />)

    expect(screen.getByTestId('approve-btn')).toBeInTheDocument()
  })

  it('shows needs-changes button when status is not needs-changes', () => {
    mockUseReviewByEntity.mockReturnValue({
      data: { id: 'rev-1', entityId: 'ent-1', status: 'approved', reviewerName: 'Alice' },
    })

    render(<ReviewIndicator {...defaultProps} />)

    expect(screen.getByTestId('needs-changes-btn')).toBeInTheDocument()
  })

  it('calls createReview.mutate when requesting review', () => {
    const mutateFn = vi.fn()
    mockUseCreateReview.mockReturnValue({ mutate: mutateFn, isPending: false })

    render(<ReviewIndicator {...defaultProps} />)

    fireEvent.click(screen.getByTestId('request-review-btn'))
    expect(mutateFn).toHaveBeenCalledWith({
      entityId: 'ent-1',
      nodeType: 'department',
      status: 'pending',
      reviewerId: 'current-user',
      reviewerName: 'You',
    })
  })

  it('calls updateReview.mutate when changing status', () => {
    const mutateFn = vi.fn()
    mockUseReviewByEntity.mockReturnValue({
      data: { id: 'rev-1', entityId: 'ent-1', status: 'pending', reviewerName: 'Alice' },
    })
    mockUseUpdateReview.mockReturnValue({ mutate: mutateFn, isPending: false })

    render(<ReviewIndicator {...defaultProps} />)

    fireEvent.click(screen.getByTestId('approve-btn'))
    expect(mutateFn).toHaveBeenCalledWith({ id: 'rev-1', dto: { status: 'approved' } })
  })
})
